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

#app {
  min-width: 1000px;
}

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
</style>