<template>
  <div id="background">
    <v-card class="sign-in" elevation="10">
      <img src="../../assets/logo.png" alt="Logo" class="sign-in__logo"/>

      <h1 class="sign-in__title">Authenticate yourself</h1>
      <p class="sign-in__message">
        You need an admin account to access the content ahead, if you do not
        have an account or have forgotten your password then you can contact the
        support regarding your issue
      </p>
      <v-form ref="form">
        <v-text-field
            v-model="username"
            label="Your Email"
            outlined
            :rules="[required(), email()]"
        />
        <v-text-field
            v-model="password"
            :rules="[required('Do not leave this field empty')]"
            @keypress.enter="signIn"
            label="Your Password"
            type="password"
            outlined
        />

        <router-link to="/auth/sign-up" style=" text-decoration: none">
          If you dont have account, please sign up free!
        </router-link>

        <v-btn
            class="mt-4"
            @click="signIn"
            color="primary"
            dark
            elevation="0"
            width="100%"
            height="45px"
        >
          Authenticate
          <v-icon small style="margin-left: 5px">mdi-arrow-right</v-icon>
        </v-btn>
      </v-form>
    </v-card>
    <loading-dialog v-model="loading" message="You are being authenticated, Please wait..."/>
    <error-dialog v-model="error" :error="errorVal"/>
  </div>
</template>

<script>
import { required, email } from '@/utils/validators';
import LoadingDialog from '../../components/LoadingDialog';
import ErrorDialog from '../../components/ErrorDialog';
import { auth } from '@/firebase_config';
import {  signInWithEmailAndPassword } from "firebase/auth";
import { UsersService} from "@/services/users-service";

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
    async signIn() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        try {
          await signInWithEmailAndPassword(auth, this.username, this.password)
              .then(async (userCredential) => {
                // Signed in
                const user = userCredential.user;

                this.db_user = await this.users_service.fetchOne(user.uid);

                localStorage.setItem('auth_token', user.accessToken)
                localStorage.setItem('fb_auth_user', JSON.stringify(user))
                localStorage.setItem('auth_user', JSON.stringify(this.db_user))
                await this.$router.push('/')
              })
              .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode, 'code')
                console.log(errorMessage, 'message')
              });

        } catch (e) {
          this.error = true;
          this.errorVal = {
            title: 'Error while signing in',
            description: 'Email or Password incorrect!'
          };
          this.loading = false;
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
