<template>
  <div id="background">
    <v-card class="sign-in" elevation="10">
      <img alt="Logo" class="sign-in__logo" src="../../assets/logo.png"/>

      <h1 class="sign-in__title">Email Verification</h1>
      <p class="sign-in__message">
        Its time to verified your email account, Please go to your email and verified it form there!
      </p>

      <p class="sign-in__message">
        Please wait for 10 seconds and refresh your inbox, if still you don't receive any verification email
        <span @click="resendEmailVerificationLink" style="cursor: pointer;  color: #2B81D6;font-weight: bold">Resend</span> it.
      </p>

      <p class="sign-in__message">
        If you have verified your email, Please
        <span @click="fetchUpdatedUser" style="cursor: pointer;  color: #2B81D6;font-weight: bold">Reload</span> it.
      </p>

    </v-card>
    <loading-dialog v-model="loading" message="Your request is processing, Please wait..."/>
    <error-dialog v-model="error" :error="errorVal"/>
  </div>
</template>

<script>
import LoadingDialog from '../../components/LoadingDialog';
import ErrorDialog from '../../components/ErrorDialog';
import {auth} from '@/firebase_config';
import {sendEmailVerification, signInWithEmailAndPassword} from "firebase/auth";

export default {
  name: 'SignIn',
  components: {ErrorDialog, LoadingDialog},

  data: () => ({
    error: false,
    errorVal: {},
    loading: false,
  }),

  methods: {
    async fetchUpdatedUser() {
      this.loading = true;
      try {
        let _user = JSON.parse(localStorage.getItem('auth_user'));
        const userCredential = await signInWithEmailAndPassword(auth, _user.email, _user.password)

        const user = userCredential.user;

        localStorage.setItem('auth_token', user.accessToken)
        localStorage.setItem('fb_auth_user', JSON.stringify(user))
        await this.$router.push('/');

      } catch (e) {
        this.error = true;
        this.errorVal = {
          title: 'Error while signing in',
          description: 'Email or Password incorrect!'
        };
      }

      this.loading = false;
    },

    async resendEmailVerificationLink() {
      this.loading = true;
      // Send verification email to email account
      try {
        await sendEmailVerification(auth.currentUser);
      } catch (e) {
        this.error = true;
        this.errorVal = {
          title: 'Error while sending verification Email!',
          description: 'Please use a valid email!'
        };
      }
      this.loading = false;
    }
  }
}
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
