<template>
  <div class="container">
    <header class="jumbotron">
      <h3>{{ content }}</h3>

      <!-- 로그인 안했을 때 화면 -->
      <div v-if="!currentUser">
        <router-link to="/register" class="nav-link">
          <button type="button" class="btn btn-primary">Sign Up</button>
        </router-link>
        <router-link to="/login" class="nav-link">
          <button type="button" class="btn btn-primary">Sign In</button>
        </router-link>
      </div>

      <!-- 로그인 했을 때 화면 -->
      <div v-if="currentUser">
        <router-link to="/user" class="nav-link">
          <button type="button" class="btn btn-primary">Start</button>
        </router-link>
        <router-link to="/profile" class="nav-link">
          <button type="button" class="btn btn-primary">My Page</button>
        </router-link>
      </div>
    </header>
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
