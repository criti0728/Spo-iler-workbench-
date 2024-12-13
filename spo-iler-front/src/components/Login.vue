<template>
  <div class="col-md-12">
    <div class="card card-container">
      <img
        id="logo-img"
        src="../assets/new-logo-bright.png"
        class="logo-img-card"
      />
      <span class="info-text-main">
        Login
      </span>
      <p class="info-text-sub">
        Log in to experience amazing predictions!
      </p>
      <Form @submit="handleLogin" :validation-schema="schema">
        <div class="form-group">
          <div class="input">
            <img class="icon" src="../assets/person-icon.png" alt="">
            <Field name="username" type="text" class="form-control" placeholder="Username" />
          </div>
          <ErrorMessage name="username" class="error-feedback" />
        </div>
        <div class="form-group">
          <div class="input">
            <img class="icon" src="../assets/lock-icon.png" alt="">
            <Field name="password" type="password" class="form-control" placeholder="Password" />
          </div>
          <ErrorMessage name="password" class="error-feedback" />
        </div>

        <div class="form-group">
          <button class="btn btn-primary btn-block" :disabled="loading">
            <span
              v-show="loading"
              class="spinner-border spinner-border-sm"
            ></span>
            <span>Login</span>
          </button>
        </div>

        <div class="form-group">
          <div v-if="message" class="alert alert-danger" role="alert">
            <span>{{ message }}</span>
          </div>
        </div>
      </Form>
    </div>
  </div>
</template>

<script>
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";

export default {
  name: "Login",
  components: {
    Form,
    Field,
    ErrorMessage,
  },
  data() {
    const schema = yup.object().shape({
      username: yup.string().required("Username is required!"),
      password: yup.string().required("Password is required!"),
    });

    return {
      loading: false,
      message: "",
      schema,
    };
  },
  computed: {
    loggedIn() {
      return this.$store.state.auth.status.loggedIn;
    },
  },
  created() {
    if (this.loggedIn) {
      this.$router.push("/profile");
    }
  },
  methods: {
    handleLogin(user) {
      this.loading = true;

      this.$store.dispatch("auth/login", user).then(
        () => {
          this.$router.push("/");
        },
        (error) => {
          this.loading = false;
          this.message =
            (error.response &&
              error.response.data &&
              error.response.data.message) ||
            error.message ||
            error.toString();
        }
      );
    },
  },
};
</script>

<style scoped>
*{
  font-family: 'Poppins', sans-serif;
}

label {
  display: block;
  margin-top: 10px;
}

.card-container.card {
  max-width: 350px !important;
  padding: 0px 40px;
}

.card {
  background-color: #f0fcff;
  padding: 20px 25px 30px;
  margin: 0 auto 25px;
  margin-top: 50px;
  -moz-border-radius: 2px;
  -webkit-border-radius: 2px;
  -moz-box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.3);
  -webkit-box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.3);
  box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.3);
  border: 1px solid #dfe8eb;
  border-radius: 10px;
}

.logo-img-card {
  height: 50px;
  margin: 0 auto 10px;
  margin-top: 2rem;
  margin-bottom: 2rem;
  display: block;
}

.error-feedback {
  color: red;
  font-size: small;
}

.info-text-main {
  text-align: center;
  font-size: larger;
  font-weight: 700;
}

.info-text-sub {
  text-align: center;
  margin-bottom: 1rem;
  font-size: small;
}

.icon {
  width: 1.5rem;
  height: 1.5rem;
  margin-right: 1rem;
}

.input {
  display: flex;
  align-items: center;
}

.form-control {
  font-size: small;
}

.form-group {
  text-align: center;
}
</style>
