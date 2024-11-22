<template>
  <div id="app">
    <nav v-if="showNav">
      <div class="wrapper">
        <a href="/">
          <img class="logo" src="./assets/new-logo.png" alt="">
        </a>
        <!-- 왼쪽에 붙는 메뉴 -->
        <div class="navbar-nav mr-auto">
          <ul class="nav-links">
            <li>
              <router-link to="/home">Home</router-link>
            </li>
            <li v-if="showAdminBoard">
              <router-link to="/admin">Admin</router-link>
            </li>
            <li v-if="showModeratorBoard">
              <router-link to="/mod">Moderator</router-link>
            </li>
            <li>
              <router-link v-if="currentUser" to="/user">Analyze</router-link>
            </li>
          </ul>
        </div>
      
        <!-- 오른쪽에 붙는 메뉴 -->
        <!-- 로그인 했을 때 -->
        <div v-if="currentUser" class="navbar-nav ml-auto">
          <ul class="nav-links">
            <li>
              <router-link to="/profile">
                <font-awesome-icon icon="user"/>
                {{ currentUser.username }}
              </router-link>
            </li>
            <li>
              <a id="logout" @click.prevent="logOut">
                <font-awesome-icon icon="sign-out-alt" /> LogOut
              </a>
            </li>
          </ul>
        </div>
        <!-- 로그인 안했을 때 -->
        <div v-if="!currentUser" class="navbar-nav ml-auto">
          <ul class="nav-links">
            <li>
              <router-link to="/register">
                <font-awesome-icon icon="user-plus" /> Sign Up
              </router-link>
            </li>
            <li>
              <router-link to="/login">
                <font-awesome-icon icon="sign-in-alt" /> Login
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
    <router-view />
  </div>
</template>

<script>
export default {
  computed: {
    currentRoute() {
      return this.$route.path; // 현재 경로 반환
    },
    showNav() {
      return (this.$route.path !== '/') && (this.$route.path !== '/home')
    },
    currentUser() {
      return this.$store.state.auth.user;
    },
    showAdminBoard() {
      if (this.currentUser && this.currentUser['roles']) {
        return this.currentUser['roles'].includes('ROLE_ADMIN');
      }

      return false;
    },
    showModeratorBoard() {
      if (this.currentUser && this.currentUser['roles']) {
        return this.currentUser['roles'].includes('ROLE_MODERATOR');
      }

      return false;
    }
  },
  methods: {
    logOut() {
      this.$store.dispatch('auth/logout');
      this.$router.push('/login');
      window.localStorage.removeItem('userLogs');
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500;600;700&display=swap');
*{
  font-family: 'Poppins', sans-serif;
}

.logo {
  height: 3.5rem;
}

#logout {
  cursor: pointer;
  color: #f2f2f2;
}

/* #app {
  min-width: 1000px;
} */

nav{
  background: #242526;
}
nav .wrapper{
  position: relative;
  max-width: 1300px;
  padding: 0px 30px;
  height: 70px;
  line-height: 70px;
  margin: auto;
  display: flex;
  justify-content: space-between;
}
.wrapper .nav-links{
  display: inline-flex;
}
.nav-links li{
  list-style: none;
}
.nav-links li a{
  color: #f2f2f2;
  text-decoration: none;
  font-size: 18px;
  font-weight: 500;
  padding: 9px 15px;
  border-radius: 5px;
  transition: all 0.3s ease;
}
.nav-links li a:hover{
  background: #3A3B3C;
}

.body-text{
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  text-align: center;
  padding: 0 30px;
}
.body-text div{
  font-size: 45px;
  font-weight: 600;
}
/* Flexbox 및 Grid 통합 규칙 추가 ======================================== */
@media (max-width: 900px) {
  .screen {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    height: auto; /* 콘텐츠에 맞는 높이 */
  }

  /* 모든 주요 섹션 (left-side, main, history-section) */
  .left-side,
  .main,
  .history-section {
    width: 100%; /* 전체 너비를 사용 */
    padding: 1rem; /* 모바일 패딩 */
    height: auto; /* 높이 자동 조정 */
  }

  /* 공통적으로 적용되는 shared-box 스타일 (공통 요소 포함) */
  .shared-box {
    width: 100%; /* 전체 너비 */
    height: auto; /* 높이 자동 조정 */
    padding: 1rem; /* 패딩 조정 */
    margin: 0; /* 외부 여백 제거 */
  }

  /* 업로드 박스 */
  .upload-box {
    padding: 1rem; /* 내부 패딩 축소 */
    width: 100%; /* 업로드 박스 전체 너비 */
    height: auto; /* 높이 자동 */
    text-align: center;
    margin-bottom: 1rem; /* 간격 추가 */
  }

  /* 이미지 미리보기 박스 */
  .left-side-image-box img {
    max-width: 80%; /* 모바일에서 이미지 크기 조정 */
    height: auto; /* 비율 유지 */
    margin: 0 auto; /* 가운데 정렬 */
  }

  /* 메인 섹션 내부 */
  .main {
    display: flex;
    flex-direction: column; /* 내부 요소를 세로 배치 */
    gap: 1rem; /* 요소 간 간격 */
    height: auto; /* 높이 콘텐츠에 맞게 */
  }

  /* 승률 섹션 */
  .result-section {
    width: 100%; /* 전체 너비 */
    padding: 1rem; /* 패딩 축소 */
    text-align: center;
    font-size: 1rem; /* 글자 크기 축소 */
  }

  /* 이미지 미리보기 섹션 */
  .main-section-image-box {
    width: 100%;
    padding: 1rem;
    text-align: center;
  }

  /* 파이 차트 */
  .analysis-box {
    width: 100%;
    padding: 1rem;
    height: auto;
    text-align: center;
  }

  #myPieChart {
    width: 100%; /* 화면에 맞춤 */
    max-width: 300px; /* 최대 너비 제한 */
    height: auto; /* 비율 유지 */
    margin: 0 auto; /* 가운데 정렬 */
  }

  /* 감정 분석 표 */
  .emotion-table-container {
    width: 100%;
    padding: 1rem;
    font-size: 0.9rem;
    height: auto; /* 높이 자동 */
  }

  .emotion-table {
    width: 100%;
    font-size: 0.8rem; /* 글자 크기 축소 */
  }

  /* 스크롤바 조정 */
  .emotion-table-container::-webkit-scrollbar {
    width: 6px; /* 스크롤바 너비 축소 */
  }

  .emotion-table-container::-webkit-scrollbar-thumb {
    background-color: #bbb; /* 스크롤바 색상 변경 */
  }

  /* 버튼 크기 조정 */
  button {
    padding: 8px 16px; /* 버튼 내부 여백 축소 */
    font-size: 0.9rem; /* 글자 크기 축소 */
    width: 100%; /* 전체 너비 */
    margin: 0 auto; /* 가운데 정렬 */
  }
}

</style>