<template>
  <div class="container">
    <!-- 왼쪽 사이드바 -->
    <div class="left-side">
      <!-- 업로드 섹션 -->
      <div class="upload-section">
        <!-- 사진 업로드 -->
        <div class="upload-box"
        @dragover.prevent="handleDragOver"
        @dragleave.prevent="handleDragLeave"
        @drop.prevent="handleDrop"
        >
          <img src="../assets/upload-icon.png" alt="">
          <p v-if="!isDragging">Drop files here</p>
          <p v-if="isDragging" class="dragging-text">Release to Upload</p>
          <p>OR</p>
          <p class="click-upload" @click.prevent="uploadByClick">Click here</p>
          <p>ONLY IMAGE files available</p>
          <input type="file" @change="handleImageUpload" accept="image/*" hidden ref="fileInput"/>
        </div>

        <!-- 업로드 이미지 미리보기 -->
        <div v-show="showInUploadSection">
          <img :src="imageUrl" alt="Uploaded Image" style="max-width: 100%;" />
        </div>

        <!-- 선수/감독 선택 -->
        <div>
          <label for="role">Select Role:</label>
          <select v-model="role" id="role">
            <option value="player">Player</option>
            <option value="coach">Coach</option>
          </select>
        </div>

        <!-- 경기 진행 시간 선택 -->
        <div>
          <label for="gameTime">Select Game Time:</label>
          <input type="number" v-model="gameTime" id="gameTime" min="0" max="100" /> % of Game
        </div>

        <!-- 현재 스코어 선택 -->
        <div>
          <label for="score">Enter Current Score (Your Team vs Opponent):</label>
          <input type="number" v-model="score" id="score" /> : <input type="number" v-model="opponentScore" id="opponentScore" />
        </div>

        <!-- Run 버튼 -->
        <div>
          <button @click.prevent="runAnalyze">Analyze</button>
        </div>
        

        <!-- 사진 업로드 섹션 ->로컬스토리지 관련으로 문제 생길 시 복구하기
        <div>            
          <h4>Upload a photo to detect emotions:</h4>
          <input type="file" @change="handleImageUpload" accept="image/*" />
        </div> -->

        <!-- 업로드된 이미지 미리보기 ->로컬스토리지 관련으로 문제 생길 시 복구하기
        <div v-if="imageUrl">
          <h4>Uploaded Image:</h4>
          <img :src="imageUrl" alt="Uploaded Image" style="max-width: 100%; height: auto;" />
        </div> -->
      </div>
    </div>

    <!-- 메인 섹션 -->
    <div class="main">
      메인 섹션
      <!-- 결과 섹션 -->
      <div class="result-section">
        <!-- 이미지 미리보기 -->
        <div v-show="showInMainSection">
          <img :src="imageUrl" alt="Uploaded Image" style="max-width: 100%;" />
        </div>
        <!-- 예측된 승률 표시 -->
        <div v-if="winProbability !== null">
          <h4>Estimated Winning Probability: {{ winProbability.toFixed(2) }}%</h4>
        </div>
      </div>

      <!-- 분석 섹션 -->
      <div class="analyze-section">
        <!-- 감정 분석 결과 표시 -->
        <div v-if="emotion">
          <h4>Detected Emotion: {{ emotion }}</h4>
        </div>
      </div>
    </div>

    <div class="right-side">
      <!-- 히스토리 섹션 -->
      <div class="history-section">
        히스토리 섹션
      </div>
    </div>
    
    <!-- 숨겨진 캔버스 (face-api.js에서 필요) -->
    <canvas ref="canvas" style="display: none;"></canvas>
  </div>
</template>
 
<script>
import * as faceapi from "face-api.js"; // face-api.js 가져오기
import UserService from "../services/user.service";
import { compressImage } from "../utils/imageProcessing";
import { saveToLocalStorage } from "../utils/storage";

export default {
  name: "User",
  data() {
    return {
      content: "", // 기본 텍스트 콘텐츠
      emotion: null, // 감정 분석 결과
      winProbability: null, // 계산된 승리 확률
      role: "player", // 선수/감독 선택 (기본값: 선수)
      gameTime: 50, // 경기 진행 시간 (0~100%)
      score: 0, // 현재 스코어 (팀 점수)
      opponentScore: 0, // 상대팀 점수
      imageUrl: null, // 이미지 미리보기 URL
      isDragging: false, // 드래그 상태를 추적
      imageFile: null,
      showInUploadSection: false,
      showInMainSection: false,
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
  },
  methods: {
    // 이미지 드래그 앤 드롭을 위한 함수 3개
    handleDragOver() {
      this.isDragging = true;
    },
    handleDragLeave() {
      this.isDragging = false;
    },
    handleDrop(event) {
      this.isDragging = false;
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

      // 이미지 로드
      const image = await this.loadImage(file);
      if (!image) {
        this.emotion = "Failed to load image.";
        return;
      }

      // 캔버스 설정: 캔버스를 이미지 크기에 맞추기
      const canvas = this.$refs.canvas;
      faceapi.matchDimensions(canvas, image);  // 캔버스를 이미지 크기와 맞춤

      const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.5 });


      // 얼굴 감지 및 감정 분석
      const detections = await faceapi.detectAllFaces(image, options).withFaceExpressions();
      console.log("Detections:", detections); // 디버깅: 감지 결과 출력

      if (detections.length > 0) {
        const expressions = detections[0].expressions;
        console.log("Expressions:", expressions); // 디버깅: 감정 데이터 출력

        if (expressions) {
          // 감정을 배열로 변환하고 내림차순으로 정렬
          const sortedEmotions = Object.entries(expressions)
            .sort(([, valueA], [, valueB]) => valueB - valueA) // 확률값 기준 정렬
            .slice(0, 4); // 상위 3개 추출

          // 상위 3개의 감정을 문자열로 변환
          this.emotion = sortedEmotions
            .map(([emotion, value]) => `${emotion}: ${(value * 100).toFixed(2)}%`)
            .join(", ");

          console.log("Top 3 emotions:", this.emotion); // 디버깅: 상위 3개 감정
        } else {
          this.emotion = "No emotions detected.";
        }

      } else {
        this.emotion = "No faces detected.";
      }

      // 승률 계산
      this.calculateWinProbability();
      try {
        // 이미지 압축
        const compressedFile = await compressImage(file);
        this.imageUrl = URL.createObjectURL(compressedFile);

        // 로컬스토리지에 저장
        saveToLocalStorage("userLogs", {
          timestamp: new Date().toISOString(),
          imageUrl: this.imageUrl,
        });
      } catch (error) {
        console.error("Failed to process the image", error);
      }
      // 메인 섹션에 이미지 미리보기 표시
      this.showInMainSection = true;
      // 업로드 섹션에서 미리보기 제거
      this.showInUploadSection = false;
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

    // 승률 계산 메서드
    calculateWinProbability() {
      let probability = 50; // 기본 50%

      // 감정 분석 반영 (긍정적인 감정 비율에 따른 승률 조정)
      const positiveEmotionRatio = this.getPositiveEmotionRatio();
      probability += positiveEmotionRatio * 30; // 감정 분석에 따라 최대 30% 증가

      // 경기 진행 시간 반영 (100%까지 진행되면 승률이 그대로 유지)
      probability += (this.gameTime / 100) * 10; // 경기 진행에 따라 승률 증가

      // 스코어 차이 반영 (자신의 점수가 높을수록 승률 증가)
      const scoreDifference = this.score - this.opponentScore;
      if (scoreDifference > 0) {
        probability += (scoreDifference / 30); // 점수 차이에 따라 승률 증가
      }

      // 선수/감독 반영 (감독의 경우 좀 더 낮은 승률)
      if (this.role === "coach") {
        probability += 5; // 감독일 경우 5% 추가
      }

      // 승률은 0~100 사이로 제한
      this.winProbability = Math.max(0, Math.min(probability, 100));
    },

    // 긍정적인 감정 비율을 계산하는 메서드
    getPositiveEmotionRatio() {
      if (!this.emotion) return 0;

      const emotionEntries = this.emotion.split(", ");
      let positiveEmotion = 0;
      emotionEntries.forEach((entry) => {
        const [emotion, percentage] = entry.split(": ");
        if (["happy", "surprised"].includes(emotion.toLowerCase())) {
          positiveEmotion += parseFloat(percentage) / 100;
        }
      });

      return positiveEmotion / emotionEntries.length;
    },
  },
};
</script>

<style scoped>
/* 임시 스타일 */
.upload-section {
  background-color: aquamarine;
}
img {
  width: 100px;
}
.main {
  background-color: bisque;
}
.analyze-section {
  background-color: skyblue;
}
.result-section {
  background-color: pink;
}
.history-section {
  background-color: yellow;
}


/* 찐 스타일 */
.container {
  display: flex;
}

.upload-box {
  border: 2px dashed #a5a5a5;
  border-radius: 10px;
  padding: 40px;
  text-align: center;
  background-color: #f8f9fa;
}

.click-upload {
  cursor: pointer;
}

</style>
