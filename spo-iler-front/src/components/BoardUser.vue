<template>
  <div class="screen">
    <!-- 왼쪽 사이드바 -->
    <div class="left-side">
      <div class="upload-section">
        <!-- 사진 업로드 -->
        <div class="upload-box"
          @dragover.prevent="handleDragOver"
          @dragleave.prevent="handleDragLeave"
          @drop.prevent="handleDrop"
        >
          <img id="upload-icon" src="../assets/upload-icon.png" alt="">
          <span v-if="!isDragging" id="dropFilesHere">Drop files here</span>
          <p v-if="isDragging" class="dragging-text">Release to Upload</p>
          <span>OR</span>
          <p class="click-upload" @click.prevent="uploadByClick">Click here</p>
          <span>ONLY IMAGE files available</span>
          <input type="file" @change="handleImageUpload" accept="image/*" hidden ref="fileInput" />
        </div>
        <div class="left-side-image-box">
          <div v-show="showInUploadSection">
            <img class="left-side-image" :src="imageUrl" alt="Uploaded Image" />
          </div>
          <span v-show="!showInUploadSection">The image will be displayed here.</span>
        </div>
        <div class="option-box">
          <label for="role">Role</label>
          <div class="options">
            <select v-model="role" id="role">
              <option value="player">Player</option>
              <option value="coach">Coach</option>
            </select>
          </div>
          <label for="gameTime">Game Time (%)</label>
          <div class="options">
            <input type="number" v-model="gameTime" id="gameTime" min="0" max="100" />
            <span id="percent">%</span>
          </div>
          <label for="score">Current Score</label>
          <div class="options">
            <input type="number" v-model="score" id="score" />
            <span id="versus">:</span>
            <input type="number" v-model="opponentScore" id="opponentScore" />
          </div>
          <button @click.prevent="runAnalyze">Analyze</button>
        </div>
      </div>
    </div>

    <!-- 메인 섹션 -->
    <div class="main">
      <!-- 승률 섹션 -->
      <div class="result-section">
        <div v-if="showInMainSection && winProbability !== null">
          <h4 :class="['win-probability', winProbability > 50 ? 'green' : 'red']">
            Estimated Winning Probability: {{ winProbability.toFixed(2) }}%
          </h4>
        </div>
        <span v-if="!showInMainSection">
          The predicted win rate will be displayed here.
        </span>
      </div>

      <!-- 이미지 미리보기 -->
      <div class="main-section-image-box" ref="imageContainer" style="position: relative;">
        <div v-show="showInMainSection">
          <!-- 이미지 -->
          <!-- <img :src="finalImage" alt="Uploaded Image" style="max-width: 100%; display: block;" /> -->
          <!-- 캔버스 -->
          <canvas ref="canvas" style="position: absolute; top: 0; left: 0; pointer-events: none;"></canvas>
        </div>
        <span v-show="!showInMainSection">The image will be displayed here.</span>
      </div>



      <!--파이 차트-->
      <div class="analysis-box">
        <span v-show='!showInMainSection'>The analysis results will be displayed here.</span>
        <canvas v-show='showInMainSection' id="myPieChart"></canvas>
        
      </div>

      <!-- 감정 분석 표 -->
      <div class="emotion-table-container">
        <span v-show='!showInMainSection'>The analysis results will be displayed here.</span>
        <table v-show='showInMainSection' class="emotion-table" v-if="emotionTableData.length > 0">
          <thead>
            <tr>
              <th>Emotion</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(data, index) in emotionTableData" :key="index">
              <td>{{ data.emotion }}</td>
              <td>{{ data.percentage }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 오른쪽 히스토리 -->
    <div class="right-side">
      <div class="history-section">
        <ActivityLogs :logs="logs" />
      </div>
    </div>

  </div>
</template>


<script>
import * as faceapi from "face-api.js"; // face-api.js 가져오기
import UserService from "../services/user.service";
import { compressImage } from "../utils/imageProcessing";
import { saveToLocalStorage, getFromLocalStorage } from "../utils/storage";
import ActivityLogs from "../components/ActivityLogs.vue";
import { Chart } from "chart.js";

export default {
  name: "User",
  components: {
    ActivityLogs,
  },
  data() {
    return {
      content: "",
      emotion: null,
      winProbability: null,
      role: "player",
      gameTime: 50,
      score: 0,
      opponentScore: 0,
      finalImage: null,
      isDragging: false,
      imageFile: null,
      showInUploadSection: false,
      showInMainSection: false,
      pieChart: null,
      logs: [],
      emotionTableData: [],
      averageExpressions: {}, // 감정 분석 결과를 저장
    };
  },
  mounted() {
    UserService.getUserBoard().then(
      (response) => {
        this.content = response.data;
      },
      (error) => {
        this.content =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();
      }
    );
    this.loadModels();
    this.logs = getFromLocalStorage("userLogs");
  },
  methods: {
    handleDragOver() {
      this.isDragging = true;
      const uploadBox = document.querySelector(".upload-box");
      uploadBox.classList.add("drag-active");
    },
    handleDragLeave() {
      this.isDragging = false;
      const uploadBox = document.querySelector(".upload-box");
      uploadBox.classList.remove("drag-active");
    },
    handleDrop(event) {
      this.isDragging = false;
      const uploadBox = document.querySelector(".upload-box");
      uploadBox.classList.remove("drag-active");
      const file = event.dataTransfer.files[0];
      if (file) {
        this.handleImageUpload(event);
      }
    },
    uploadByClick() {
      this.$refs.fileInput.click();
    },
    async loadModels() {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        await faceapi.nets.faceExpressionNet.loadFromUri("/models");
        console.log("Models loaded successfully!");
      } catch (err) {
        console.error("Error loading models:", err);
      }
    },
    async handleImageUpload(event) {
      let file = null;
      try {
        file = event.dataTransfer.files[0];
      } catch (error) {
        file = event.target.files[0];
      }
      if (!file || !file.type.startsWith("image/")) {
        alert("Only image files are allowed!");
      }
      if (!file) {
        this.emotion = "No file selected.";
        return;
      }
      this.imageUrl = URL.createObjectURL(file);
      this.showInUploadSection = true;
      this.showInMainSection = false;
      this.imageFile = file;
    },
    
    async runAnalyze() {
      this.winProbability = null;
      this.logs = getFromLocalStorage("userLogs");
      const file = this.imageFile;

      if (!file) {
        console.error("No image file provided.");
        return;
      }

      try {
        const originalImage = await this.loadImage(file);
        if (!originalImage) throw new Error("Failed to load original image.");

        const compressedFile = await compressImage(file);
        const compressedImage = await this.loadImage(compressedFile);
        if (!compressedImage) throw new Error("Failed to load compressed image.");
        this.imageUrl = URL.createObjectURL(compressedFile);

        // 비동기 Promise로 이미지 로드 완료를 기다림
        await new Promise((resolve, reject) => {
          const img = new Image();
          img.src = this.imageUrl;

          img.onload = async () => {
            try {
              const canvas = this.$refs.canvas;
              const ctx = canvas.getContext("2d");

              const maxWidth = this.$refs.imageContainer.offsetWidth;
              const aspectRatio = img.naturalWidth / img.naturalHeight;
              canvas.width = maxWidth;
              canvas.height = maxWidth / aspectRatio;

              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

              const options = new faceapi.TinyFaceDetectorOptions({
                inputSize: 512,
                scoreThreshold: 0.5,
              });
              const detections = await faceapi.detectAllFaces(originalImage, options).withFaceExpressions();

              if (detections.length > 0) {
                const totalExpressions = detections.reduce((acc, detection) => {
                  Object.entries(detection.expressions).forEach(([emotion, value]) => {
                    acc[emotion] = (acc[emotion] || 0) + value;
                  });
                  return acc;
                }, {});
                const numFaces = detections.length;

                if (numFaces > 0) {
                  this.averageExpressions = Object.entries(totalExpressions).reduce((acc, [emotion, totalValue]) => {
                    acc[emotion] = totalValue / numFaces;
                    return acc;
                  }, {});
                } else {
                  this.averageExpressions = {};
                }

                console.log("Average Expressions:", this.averageExpressions);

                const sortedEmotions = Object.entries(this.averageExpressions)
                  .sort(([, valueA], [, valueB]) => valueB - valueA)
                  .slice(0, 4);

                this.emotion = sortedEmotions
                  .map(([emotion, value]) => `${emotion}: ${(value * 100).toFixed(2)}%`)
                  .join(", ");

                this.emotionTableData = Object.entries(this.averageExpressions).map(([emotion, value]) => ({
                  emotion,
                  percentage: (value * 100).toFixed(2),
                }));

                const labels = Object.keys(this.averageExpressions);
                const data = Object.values(this.averageExpressions).map((value) => value * 100);
                this.calculateWinProbability(); // 승률 계산
                this.createPieChart(labels, data);
              } else {
                this.emotionTableData = [];
                alert("No face detected.");
              }
              resolve(); // 작업 완료
            } catch (error) {
              reject(error); // 작업 실패 시 reject
            }
          };

          img.onerror = (err) => reject(err);
        });

        this.showInMainSection = true;
        this.showInUploadSection = false;

        this.logs = getFromLocalStorage("userLogs");
        this.parseEmotionToTable();
      } catch (error) {
        console.error("Error during analysis:", error);
        alert(error.message || "Analysis failed.");
      } finally {
        // finally는 모든 작업이 완료된 후 실행
        try {
          this.logs = getFromLocalStorage("userLogs");
          this.parseEmotionToTable();
          saveToLocalStorage("userLogs", {
            timestamp: new Date().toISOString(),
            winProbability: this.winProbability, // 계산이 완료된 후 저장
            imageUrl: this.imageUrl,
          });
          console.log("Final winProbability saved:", this.winProbability);
        } catch (storageError) {
          console.error("Error saving data to local storage:", storageError);
        }
      }
    },
    createPieChart(labels, data) {
      if (this.pieChart) {
        this.pieChart.destroy();
      }

      const ctx = document.getElementById("myPieChart").getContext("2d");
      this.pieChart = new Chart(ctx, {
        type: "pie",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Emotion Analysis",
              data: data,
              backgroundColor: [
                "rgba(180, 180, 180, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(54, 162, 235, 1)",
                "rgba(75, 192, 192, 1)",
                "rgba(153, 102, 255, 1)",
                "rgba(255, 159, 64, 1)",
                "rgba(255, 99, 132, 1)",
              ],
              borderColor: "rgba(255, 255, 255, 1)",
              borderWidth: 3,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
          },
        },
      });
    },
    loadImage(file) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
      });
    },
    parseEmotionToTable() {
      if (this.emotion) {
        const emotionEntries = this.emotion.split(", ");
        this.emotionTableData = emotionEntries.map((entry) => {
          const [emotion, percentage] = entry.split(": ");
          return { emotion: emotion.trim(), percentage: parseFloat(percentage) };
        });
      } else {
        this.emotionTableData = [];
      }
    },
    calculateWinProbability() {
      let probability = 50;

      const emotionRatios = this.getPositiveEmotionRatio();

      if (emotionRatios.negative > 0.8) {
        probability -= emotionRatios.negative * 8;
      } else if (emotionRatios.negative > 0.5) {
        probability -= emotionRatios.negative * 5;
      }

      if (emotionRatios.positive > 0.8) {
        probability += emotionRatios.positive * 8;
      } else if (emotionRatios.positive >= 0.5) {
        probability += emotionRatios.positive * 5;
      }

      const scoreDifference = this.score - this.opponentScore;
      probability += scoreDifference > 0 ? Math.log(scoreDifference + 1) * 5 : -Math.log(Math.abs(scoreDifference) + 1) * 5;
      
      this.winProbability = Math.max(0, Math.min(probability, 100));
      console.log(this.winProbability)
    },
    getPositiveEmotionRatio() {
      if (!this.averageExpressions || Object.keys(this.averageExpressions).length === 0) {
        return { positive: 0, negative: 0 };
      }

      const positiveEmotions = ["happy", "surprised"];
      const negativeEmotions = ["angry", "sad"];

      let positiveEmotion = 0;
      let negativeEmotion = 0;

      Object.entries(this.averageExpressions).forEach(([emotion, value]) => {
        const normalizedEmotion = emotion.toLowerCase();
        if (positiveEmotions.includes(normalizedEmotion)) {
          positiveEmotion += value;
        } else if (negativeEmotions.includes(normalizedEmotion)) {
          negativeEmotion += value;
        }
      });
      console.log(positiveEmotion)
      console.log(negativeEmotion)
      return { positive: positiveEmotion, negative: negativeEmotion };
    },
  },
};
</script>


<style scoped>
@import "../styles/BoardUser.css";
</style>