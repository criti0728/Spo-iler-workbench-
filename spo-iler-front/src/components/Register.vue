<template>
  <div class="col-md-12">
    <div class="card card-container">
      <img
        id="logo-img"
        src="../assets/new-logo-bright.png"
        class="logo-img-card"
      />
      <span class="info-text-main">
        Create a Spo-iler account
      </span>
      <p class="info-text-sub">
        Sign up easily to access all Spo-iler services! All fields are required.
      </p>
      <Form @submit="handleRegister" :validation-schema="schema">
        <div v-if="!successful">
          <div class="form-group">
            <div class="input">
              <img class="icon" src="../assets/person-icon.png" alt="">
              <Field name="username" type="text" class="form-control" placeholder="Username" />
            </div>
            <ErrorMessage name="username" class="error-feedback" />
          </div>
          <div class="form-group">
            <div class="input">
              <img class="icon" src="../assets/mail-icon.png" alt="">
              <Field name="email" type="email" class="form-control" placeholder="e-mail address" />
            </div>
            <ErrorMessage name="email" class="error-feedback" />
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
              Sign Up
            </button>
          </div>
        </div>
      </Form>

      <div
        v-if="message"
        class="alert"
        :class="successful ? 'alert-success' : 'alert-danger'"
      >
        <span>{{ message }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";

export default {
  name: "Register",
  components: {
    Form,
    Field,
    ErrorMessage,
  },
  data() {
    const schema = yup.object().shape({
      username: yup
        .string()
        .required("Username is required!")
        .min(3, "Must be at least 3 characters!")
        .max(20, "Must be maximum 20 characters!"),
      email: yup
        .string()
        .required("Email is required!")
        .email("Email is invalid!")
        .max(50, "Must be maximum 50 characters!"),
      password: yup
        .string()
        .required("Password is required!")
        .min(6, "Must be at least 6 characters!")
        .max(40, "Must be maximum 40 characters!"),
    });

    return {
      successful: false,
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
  mounted() {
    if (this.loggedIn) {
      this.$router.push("/profile");
    }
  },
  methods: {
    handleRegister(user) {
      this.message = "";
      this.successful = false;
      this.loading = true;

      this.$store.dispatch("auth/register", user).then(
        (data) => {
          this.message = data.message;
          this.successful = true;
          this.loading = false;
        },
        (error) => {
          this.message =
            (error.response &&
              error.response.data &&
              error.response.data.message) ||
            error.message ||
            error.toString();
          this.successful = false;
          this.loading = false;
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
  margin-bottom: 3rem;
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
  margin-bottom: 2rem;
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

.alert-success, alert-danger {
  text-align: center;
}
</style>
