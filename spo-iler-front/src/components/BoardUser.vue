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
import { Chart } from 'chart.js';

export default {
  name: "User",
  components: {
    ActivityLogs,
  },
  data() {
    return {
      content: "", // 기본 텍스트 콘텐츠
      emotion: null, // 감정 분석 결과
      winProbability: null, // 계산된 승리 확률
      role: "player", // 선수/감독 선택 (기본값: 선수)
      gameTime: 50, // 경기 진행 시간 (0~100%)
      score: 0, // 현재 스코어 (팀 점수)
      opponentScore: 0, // 상대팀 점수
      finalImage: null, // 이미지 미리보기 URL
      isDragging: false, // 드래그 상태를 추적
      imageFile: null,
      showInUploadSection: false,
      showInMainSection: false,
      pieChart: null,
      logs: [],
      emotionTableData: [], // 감정 분석 결과를 담을 데이터
      
    };
  },
  mounted() {
    // 사용자 데이터를 가져오기 위한 서비스 호출
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

    // face-api.js 모델 로드
    this.loadModels();
    this.logs = getFromLocalStorage("userLogs");
  },
  methods: {
    // 이미지 드래그 앤 드롭을 위한 함수 3개
    handleDragOver() {
      this.isDragging = true;
      const uploadBox = document.querySelector(".upload-box");
      uploadBox.classList.add("drag-active"); // 드래그 상태 클래스 추가
    },
    handleDragLeave() {
      this.isDragging = false;
      const uploadBox = document.querySelector(".upload-box");
      uploadBox.classList.remove("drag-active"); // 드래그 상태 클래스 제거
    },
    handleDrop(event) {
      this.isDragging = false;
      const uploadBox = document.querySelector(".upload-box");
      uploadBox.classList.remove("drag-active"); // 드래그 상태 클래스 제거
      const file = event.dataTransfer.files[0];
      if (file) {
        this.handleImageUpload(event);
      }
    },
    
    // 클릭으로 파일 업로드
    uploadByClick() {
      this.$refs.fileInput.click();
    },

    // face-api.js 모델 로드 메서드
    async loadModels() {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        await faceapi.nets.faceExpressionNet.loadFromUri("/models");
        
        console.log("Models loaded successfully!");
      } catch (err) {
        console.error("Error loading models:", err);
      }
    },

    // 이미지 업로드 처리
    async handleImageUpload(event) {
      let file = null;
      try {
        file = event.dataTransfer.files[0]; // Drag & Drop 방식
      } catch (error) {
        file = event.target.files[0]; // 클릭 방식
      }

      // 이미지 파일이 아닌 파일을 업로드 했을 때
      if (!file || !file.type.startsWith("image/")) {
        alert("Only image files are allowed!");
      }

      // 파일을 업로드하지 않았을 때
      if (!file) {
        this.emotion = "No file selected.";
        return;
      }
      // 이미지 URL로 미리보기 제공
      this.imageUrl = URL.createObjectURL(file);

      // 미리보기 visibility 변경
      this.showInUploadSection = true;
      this.showInMainSection = false;

      // 이미지 임시 저장
      this.imageFile = file;
    },
    
    // 업로드된 이미지 분석 메서드
    async runAnalyze() {
      const file = this.imageFile;

      if (!file) {
        console.error("No image file provided.");
        return;
      }

      try {
        // 1. 원본 이미지 로드
        const originalImage = await this.loadImage(file);
        if (!originalImage) throw new Error("Failed to load original image.");

        // 2. 압축 이미지 로드
        const compressedFile = await compressImage(file);
        const compressedImage = await this.loadImage(compressedFile);
        if (!compressedImage) throw new Error("Failed to load compressed image.");
        this.imageUrl = URL.createObjectURL(compressedFile);

        // 3. 이미지 로드 후 캔버스 설정
        const img = new Image();
        img.src = this.imageUrl;

        img.onload = async () => {
          const canvas = this.$refs.canvas;
          const ctx = canvas.getContext("2d");

          // 캔버스 크기 동기화
          const maxWidth = this.$refs.imageContainer.offsetWidth; // 부모 박스 너비
          const aspectRatio = img.naturalWidth / img.naturalHeight;
          canvas.width = maxWidth; // 화면에 맞게 너비 설정
          canvas.height = maxWidth / aspectRatio; // 비율에 맞춰 높이 설정

          console.log(`Canvas resized to: ${canvas.width}x${canvas.height}`);

          // 이미지 그리기
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // 4. 얼굴 감지 및 분석
          const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.5 });
          const detections = await faceapi.detectAllFaces(originalImage, options).withFaceExpressions();

          if (detections.length > 0) {
            // 얼굴 감지 결과를 캔버스에 표시
            const displaySize = { width: canvas.width, height: canvas.height };
            const resizedDetections = faceapi.resizeResults(detections, displaySize);

            // 얼굴 감지 영역 표시
            faceapi.draw.drawDetections(canvas, resizedDetections);
            faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

            console.log("Face detections and expressions drawn on canvas.");

            // 감정 분석 데이터 처리
            const totalExpressions = detections.reduce((acc, detection) => {
              Object.entries(detection.expressions).forEach(([emotion, value]) => {
                acc[emotion] = (acc[emotion] || 0) + value;
              });
              return acc;
            }, {});

            const numFaces = detections.length;
            const averageExpressions = Object.entries(totalExpressions).reduce((acc, [emotion, totalValue]) => {
              acc[emotion] = totalValue / numFaces;
              return acc;
            }, {});

            console.log("Average Expressions:", averageExpressions);

            // 감정 분석 데이터 저장
            const sortedEmotions = Object.entries(averageExpressions)
              .sort(([, valueA], [, valueB]) => valueB - valueA)
              .slice(0, 4);

            this.emotion = sortedEmotions
              .map(([emotion, value]) => `${emotion}: ${(value * 100).toFixed(2)}%`)
              .join(", ");

            // 감정 분석 표 데이터 업데이트
            this.emotionTableData = Object.entries(averageExpressions).map(([emotion, value]) => ({
              emotion,
              percentage: (value * 100).toFixed(2),
            }));

            // 감정 분석 차트 생성
            const labels = Object.keys(averageExpressions);
            const data = Object.values(averageExpressions).map(value => value * 100);
            this.createPieChart(labels, data);

          } else {
            console.log("No faces detected.");
            this.emotionTableData = []; // 감정 분석 결과 초기화
          }
        };

        // 승률 계산
        this.calculateWinProbability();

        img.onerror = (err) => {
          console.error("Failed to load image from imageUrl:", err);
        };

        // 상태 업데이트
        this.showInMainSection = true;
        this.showInUploadSection = false;

        // 로컬스토리지 저장
        saveToLocalStorage("userLogs", {
          timestamp: new Date().toISOString(),
          winProbability: this.winProbability ? this.winProbability.toFixed(2) : null,
          imageUrl: this.imageUrl,
        });
        this.logs = getFromLocalStorage("userLogs");
        this.parseEmotionToTable();

      } catch (error) {
        console.error("Error during analysis:", error);
        alert(error.message || "Analysis failed.");
      }
    },


    
    // 파이차트 생성 메서드
    createPieChart(labels, data) {
      if (this.pieChart) {
        this.pieChart.destroy(); // 이전 차트 제거
      }

      const ctx = document.getElementById("myPieChart").getContext("2d");
      this.pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            label: 'Emotion Analysis',
            data: data,
            backgroundColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)'
            ],
            borderColor: [
              'rgba(255, 255, 255, 1)',
              'rgba(255, 255, 255, 1)',
              'rgba(255, 255, 255, 1)',
              'rgba(255, 255, 255, 1)',
              'rgba(255, 255, 255, 1)',
              'rgba(255, 255, 255, 1)',
              'rgba(255, 255, 255, 1)'
            ],
            borderWidth: 3,
            hoverBackgroundColor: 'rgba(0, 0, 0, 1)',
            hoverBorderWidth: 0,
            hoverBorderColor: 'rgba(255, 255, 255, 1)',
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false, // 캔버스 비율 유지 해제
          plugins: {
            legend: {
              display: false,
              position: 'left',
            },
            tooltip: {
              enabled: true
            }
          }
        }
      });
    },

    // 파일에서 이미지를 로드하는 메서드
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
    // 승률 계산 메서드
    calculateWinProbability() {
      let probability = 50; // 기본 승률 50%

      // 감정 분석 반영
      const emotionRatios = this.getPositiveEmotionRatio();
      console.log(emotionRatios.negative)
      if (emotionRatios.negative > 0.8) {
        probability -= emotionRatios.negative * 8;
        console.log('probability (negative > 0.8) is :'+ probability);
      } else if (emotionRatios.negative > 0.5) {
        probability -= emotionRatios.negative * 5;
        console.log('probability (negative > 0.5) is :'+ probability);
      } else if (emotionRatios.positive >= 0.5) {
        probability += emotionRatios.positive * 5;
        console.log('probability (positive >= 0.5) is :'+ probability);
      } else if (emotionRatios.positive > 0.8) {
        probability += emotionRatios.positive * 8;
        console.log('probability (positive > 0.8) is :'+ probability);
      } else {
        console.log('No condition met. Current probability is: ' + probability);
      }

      

      // 0:0 점수 상황에서 부정적 감정
      if (this.score === 0 && this.opponentScore === 0 && emotionRatios.negative > 0.5) {
        probability -= 10; // 추가 패널티
      }

      // 경기 진행 시간 반영
      if (this.gameTime <= 25&&emotionRatios.negative<0.5) {
        // 초반 진행: 영향이 작음
        probability += (this.gameTime / 25) * 10; // 최대 10% 상승
      } else if (this.gameTime <= 75) {
        // 중반 진행: 영향이 더 커짐
        probability += 10 + Math.pow((this.gameTime - 25) / 50, 2) * 15; // 최대 추가 15% 상승
      } else {
        // 후반 진행: 승률 급격히 상승
        probability += 25 + ((this.gameTime - 75) / 25) * 20; // 최대 추가 10% 상승
      }
      if (this.gameTime <= 25&&emotionRatios.negative>0.5) {
        // 초반 진행: 영향이 작음
        probability -= (this.gameTime / 25) * 10; // 최대 10% 상승
      } else if (this.gameTime <= 75) {
        // 중반 진행: 영향이 더 커짐
        probability -= 10 + Math.pow((this.gameTime - 25) / 50, 2) * 15; // 최대 추가 15% 상승
      } else {
        // 후반 진행: 승률 급격히 낮아짐
        probability -= 25 + ((this.gameTime - 75) / 25) * 20; // 최대 추가 10% 상승
      }

      // 점수 차이 반영
      const scoreDifference = this.score - this.opponentScore;
      if (scoreDifference > 0) {
        probability += Math.min(60, Math.log(scoreDifference + 1) * 5); // 점수 차이 상승
      } else if (scoreDifference < 0) {
        probability -= Math.min(60, Math.log(Math.abs(scoreDifference) + 1) * 5); // 점수 차이 패널티
      }
      // 경기 진행 시간에 따른 스코어 영향 강화
      let timeScoreImpact = 0;
      if (this.gameTime <= 25) {
        timeScoreImpact = (this.gameTime / 25) * Math.log(Math.abs(scoreDifference) + 1) * 2; // 초반
      } else if (this.gameTime <= 75) {
        timeScoreImpact = 2 + ((this.gameTime - 25) / 50) * Math.log(Math.abs(scoreDifference) + 1) * 5; // 중반
      } else {
        timeScoreImpact = 10 + ((this.gameTime - 75) / 25) * Math.log(Math.abs(scoreDifference) + 1) * 8; // 후반
      }

      // 점수 차이가 클수록 진행 시간의 영향 증가
      if (scoreDifference > 0) {
        probability += timeScoreImpact; // 점수 차이가 유리하면 승률 증가
      } else if (scoreDifference < 0) {
        probability -= timeScoreImpact; // 점수 차이가 불리하면 승률 감소
      }


      // 역할에 따른 승률 조정
      const roleMultiplier = this.role === "coach" ? 0.95 : 1.05;
      probability *= roleMultiplier;

      // 무작위 요소 추가
      const randomFactor = Math.random() * 1 - 0.5; // 랜덤 범위 [-0.5, 0.5]
      probability += randomFactor * 2;

      // 승률은 0~100%로 제한
      this.winProbability = Math.max(0, Math.min(probability, 100));
    },

    // 긍정적인 감정 비율을 계산하는 메서드
    getPositiveEmotionRatio() {
    if (!this.emotion) return 0;

    const emotionEntries = this.emotion.split(", ");
    let positiveEmotion = 0, negativeEmotion = 0;
    emotionEntries.forEach((entry) => {
      const [emotion, percentage] = entry.split(": ");
      const value = parseFloat(percentage) / 100;
      if (["happy", "surprised"].includes(emotion.toLowerCase())) {
        positiveEmotion += value;
      } else if (["angry", "sad"].includes(emotion.toLowerCase())) {
        negativeEmotion += value;
      }
    });

    return {
      positive: positiveEmotion,
      negative: negativeEmotion,
    };
  }

  },
};
</script>

<style scoped>
@import "../styles/BoardUser.css";
</style>