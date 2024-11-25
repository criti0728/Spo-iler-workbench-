<template>

  <video autoplay muted loop src="../assets/demo-video.mp4"></video>
  <div class="overlay"></div>



  <div class="body-text">
    <div class="title">Welcome to Spo-iler!</div>
    <div class="sub-title">Make amazing experiences by our AI prediction service!</div>
    <div v-if="!currentUser" class="information">Register or log in to enjoy Spo-iler services!</div>
    <div v-if="currentUser" class="information">Ready to provide you with Spo-iler services!</div>

    <!-- 로그인 안했을 때 화면 -->
    <div class="buttons" v-if="!currentUser">
      <router-link to="/register" class="nav-link">
        <button type="button" class="btn btn-primary">Sign Up</button>
      </router-link>
      <router-link to="/login" class="nav-link">
        <button type="button" class="btn btn-primary">Login</button>
      </router-link>
    </div>

    <!-- 로그인 했을 때 화면 -->
    <div class="buttons" v-if="currentUser">
      <router-link to="/user" class="nav-link">
        <button type="button" class="btn btn-primary">Start</button>
      </router-link>
      <router-link to="/profile" class="nav-link">
        <button type="button" class="btn btn-primary">My Page</button>
      </router-link>
      <a href="https://github.com/pasongvan/Spo-iler/blob/main/README.md" class="nav-link" target="_blank" rel="noopener noreferrer">
      <button type="button" class="btn btn-primary">
        <img src="../assets/open_in_new.png" alt="">
        App Info
      </button>
    </a>
    </div>
  </div>
</template>

<script>
import UserService from "../services/user.service";

export default {
  name: "Home",
  data() {
    return {
      content: "이게 보이면 머가 잘못된거임",
    };
  },
  mounted() {
    UserService.getPublicContent().then(
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
  },
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    }
  }
};
</script>

<style scoped>
*{
  font-family: 'Poppins', sans-serif;
  color: #f2f2f2;
}

video {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -1;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: -1;
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
.body-text .title{
  font-size: 45px;
  font-weight: 600;
}
.body-text .sub-title {
  font-size: 30px;
  font-weight: 600;
}
.information {
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.buttons {
  display: flex;
  justify-content: center;
}
button {
  width: 120px;
  height: 40px;
  background-color: rgba(0, 0, 255, 0.7);
  border-color: rgba(0, 0, 255, 0.7);
}
button img {
  height: 80%;
}
</style>