<template>
  <div id="background">
    <v-card class="sign-in" elevation="10">
      <img alt="Logo" class="sign-in__logo" src="../../assets/logo.png"/>

      <h1 class="sign-in__title">Authenticate yourself</h1>
      <p class="sign-in__message">
        You need an admin account to access the content ahead, if you do not
        have an account or have forgotten your password then you can contact the
        support regarding your issue
      </p>

      <v-form ref="form">
        <v-text-field
            v-model="username"
            :rules="[required(), email()]"
            label="Your Email"
            outlined
        />

        <v-text-field
            v-model="password"
            :rules="[required('Do not leave this field empty')]"
            label="Your Password"
            outlined
            type="password"
            @keypress.enter="signIn"
        />

        <p style="text-decoration: none; color: #2B81D6; cursor: pointer" @click="sendForgotPasswordEmail">
          Password forgot!
        </p>

        <router-link style=" text-decoration: none" to="/auth/sign-up">
          If you dont have account, please sign up free!
        </router-link>

        <v-btn
            class="mt-4"
            color="primary"
            dark
            elevation="0"
            height="45px"
            width="100%"
            @click="signIn"
        >
          Authenticate
          <v-icon small style="margin-left: 5px">mdi-arrow-right</v-icon>
        </v-btn>
      </v-form>
    </v-card>
    <loading-dialog v-model="loading" message="Your request is processing, Please wait..."/>
    <error-dialog v-model="error" :error="errorVal"/>
  </div>
</template>

<script>
import {email, required} from '@/utils/validators';
import LoadingDialog from '../../components/LoadingDialog';
import ErrorDialog from '../../components/ErrorDialog';
import {auth} from '@/firebase_config';
import {sendPasswordResetEmail, signInWithEmailAndPassword} from "firebase/auth";
import {UsersService} from "@/services/users-service";

export default {
  name: 'SignIn',
  components: {ErrorDialog, LoadingDialog},

  data: () => ({
    users_service: new UsersService(),
    error: false,
    errorVal: {},
    loading: false,
    username: '',
    password: '',
    db_user: null,
  }),

  methods: {
    email,
    required,

    async sendForgotPasswordEmail() {
      this.loading = true;
      if (this.username === '') {
        this.error = true;
        this.errorVal = {
          title: 'Username/Email field is required!',
          description: 'Please provide username/email for processing!',
        };
        this.loading = false;
      }

      try {
        this.loading = true;
        await sendPasswordResetEmail(auth, this.username)
      } catch (e) {
        this.error = true;
        this.errorVal = {
          title: 'Error',
          description: 'Something went wrong while sending Password Sending Email!'
        };
      }
      this.loading = false;
    },

    async signIn() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        try {
          const userCredential = await signInWithEmailAndPassword(auth, this.username, this.password)

          const user = userCredential.user;

          this.db_user = await this.users_service.fetchOne(user.uid);

          localStorage.setItem('auth_token', user.accessToken)
          localStorage.setItem('fb_auth_user', JSON.stringify(user))
          localStorage.setItem('auth_user', JSON.stringify(this.db_user))
          await this.$router.push('/')

        } catch (e) {
          this.error = true;
          this.errorVal = {
            title: 'Error while signing in',
            description: 'Email or Password incorrect!'
          };
        }

        this.loading = false;
      }
    }
  }
};
</script>

<style lang="sass" scoped>
.sign-in
  width: 448px
  padding: 20px 40px 40px 40px
  background: white
  text-align: center
  border-radius: 8px

  &__header
    display: grid
    grid-column-gap: 20px
    grid-template-columns: calc(30% - 20px) 70%

  &__logo
    width: 30%
    margin-bottom: 20px

  &__title
    color: black
    font-size: 24px
    margin-bottom: 10px
    font-weight: normal
    font-family: google-sans, sans-serif

  &__message
    font-size: 13px
    margin-bottom: 40px


#background
  height: 100vh
  display: flex
  align-items: center
  justify-content: center
  background: #00f3ff

</style>

<style>
html {
  overflow-y: auto;
}
</style>
