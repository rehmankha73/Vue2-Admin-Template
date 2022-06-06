<template>
  <div id="background">
    <v-card class="sign-in" elevation="10">
      <img alt="Logo" class="sign-in__logo" src="../../assets/logo.png"/>

      <h1 class="sign-in__title">Sign Up</h1>
      <p class="sign-in__message">
        Sign up with details! don't worry, you can also update your profile later!
      </p>



      <v-form ref="form">
        <v-text-field
            v-model="user.name"
            :rules="[required()]"
            label="Your Name"
            outlined
        />

        <v-text-field
            v-model="user.email"
            :rules="[required(), email()]"
            label="Your Email"
            outlined
        />

        <v-text-field
            v-model="user.phone"
            :rules="[required()]"
            label="Your Phone #"
            outlined
            type="number"
        />

        <v-text-field
            v-model="user.password"
            :rules="[required()]"
            :type="showPassword ? 'text' : 'password'"
            class="span-2"
            label="Password"
            outlined
        />

        <v-text-field
            v-model="confirmPassword"
            :rules="[(v) => (v && v === user.password) || 'Passwords does not match']"
            :type="showPassword ? 'text' : 'password'"
            class="span-2"
            label="Confirm Password"
            outlined
        />

        <v-checkbox
            v-model="showPassword"
            label="Show Password"
            style="margin-top: -15px"
        />

        <v-btn
            color="primary"
            dark
            elevation="0"
            height="45px"
            width="100%"
            @click="signUp"
        >
          Authenticate
          <v-icon small style="margin-left: 5px">mdi-arrow-right</v-icon>
        </v-btn>
      </v-form>
    </v-card>
    <loading-dialog v-model="loading" message="Please wait..."/>
    <error-dialog v-model="error" :error="errorVal"/>
  </div>
</template>

<script>
import {email, required} from '@/utils/validators';
import LoadingDialog from '../../components/LoadingDialog';
import ErrorDialog from '../../components/ErrorDialog';
import {auth} from '@/firebase_config';
import {createUserWithEmailAndPassword, signInWithEmailAndPassword} from "firebase/auth";
import {UsersService} from "@/services/users-service";

export default {
  name: 'SignIn',
  components: {ErrorDialog, LoadingDialog},

  data: () => ({
    users_service: new UsersService(),
    error: false,
    errorVal: {},
    loading: false,
    showPassword: false,
    confirmPassword: '',
    sign_in_user_id: '',
    user: {
      name: '',
      email: '',
      phone: '',
      password: '',
    }
  }),

  methods: {
    email,
    required,
    async signUp() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        // create new auth user in firebase
        await this.createNewAuthUserInFirebase();

        // Storing new user firebase database
        await this.createNewUserInDatabase();

        const _new_user = await this.users_service.fetchOne(this.sign_in_user_id);

        // sign in newly created user
        await this.signUpIntoSystem(_new_user);

        this.loading = false;
      }
    },

    async createNewAuthUserInFirebase() {
      try {
        await createUserWithEmailAndPassword(auth, this.user.email, this.user.password)
            .then(async (userCredential) => {
              // Signed in
              const user = userCredential.user;
              this.sign_in_user_id = user.uid;
            })
      } catch (e) {
        this.error = true;
        this.errorVal = {
          title: 'Something went wrong while registering please try again!',
        };
        this.loading = false;
      }
    },
    async createNewUserInDatabase() {
      await this.users_service.create(this.user, this.sign_in_user_id);
    },

    async signUpIntoSystem(_new_user) {
      try {
        await signInWithEmailAndPassword(auth, _new_user.email, _new_user.password)
            .then(async (userCredential) => {
              // Signed in
              const user = userCredential.user;

              localStorage.setItem('auth_token', user.accessToken)
              localStorage.setItem('fb_auth_user', JSON.stringify(user))
              localStorage.setItem('auth_user', JSON.stringify(_new_user))
              await this.$router.push('/')
            })
      } catch (e) {
        this.error = true;
        this.errorVal = {
          title: 'Error while signing in',
          description: 'Email or Password incorrect!'
        };
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
