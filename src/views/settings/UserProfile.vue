<template>
  <v-card class="span-2">
    <v-toolbar
        color="light blue"
        dark
        flat
    >
      <v-toolbar-title>User Profile Settings</v-toolbar-title>
    </v-toolbar>
    <v-tabs
        color="blue"
        vertical
    >
      <v-tab>
        <v-icon left>
          mdi-account
        </v-icon>
        Profile Options
      </v-tab>
      <v-tab>
        <v-icon left>
          mdi-lock
        </v-icon>
        Change Password
      </v-tab>

      <v-tab-item>
        <v-card flat>
          <v-card-text>
            <SimpleForm :onSubmit="updateProfile" @done="reloadData">
              <p class="span-2 form__title">Update User Profile</p>

              <image-upload
                  :image_obj="old_image"
                  @uploadedImage="getUploadedImage"
              />

              <v-text-field
                  v-model="user.name"
                  :rules="[required('A display name must be provided')]"
                  class="span-2"
                  hint="Must be a valid username"
                  label="Display Name"
                  outlined
                  persistent-hint
              />

              <v-text-field
                  v-model="user.phone"
                  :rules="[required('Phone must be provided')]"
                  class="span-2"
                  hint="Must be a valid phone #"
                  label="Phone"
                  outlined
                  persistent-hint
              />

              <v-text-field
                  v-model="user.email"
                  :rules="[required('Email must be provided')]"
                  class="span-2"
                  hint="Must be a unique email"
                  label="Email"
                  outlined
                  persistent-hint
                  readonly
              />

              <loading-dialog v-model="loading" message="Fetching User Profile Data"/>
            </SimpleForm>
          </v-card-text>
        </v-card>
      </v-tab-item>

      <v-tab-item>
        <v-card flat>
          <v-card-text>
            <SimpleForm :onSubmit="updatePassword">
              <p class="span-2 form__title">Update User Password</p>

              <v-text-field
                  v-model="oldPassword"
                  :rules="[required('A old password should match with current user password')]"
                  :type="showPassword ? 'text' : 'password'"
                  class="span-2"
                  label="Old Password"
                  outlined
              />

              <v-text-field
                  v-model="user.password"
                  :rules="[required('A strong password (minimum 8 characters) is required!')]"
                  :type="showPassword ? 'text' : 'password'"
                  class="span-2"
                  label="New Password"
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

              <loading-dialog v-model="loading" message="Loading..."/>
            </SimpleForm>
          </v-card-text>
        </v-card>
      </v-tab-item>
    </v-tabs>
  </v-card>
</template>

<script>
import SimpleForm from '../../components/Form';
import LoadingDialog from '../../components/LoadingDialog';
import {required} from '@/utils/validators';
import {deleteObject, getDownloadURL, getStorage, ref, uploadBytes} from "firebase/storage";
import {auth} from '@/firebase_config';
import {signInWithEmailAndPassword, updatePassword} from "firebase/auth";
import {getUser} from '@/utils/local';
import {UsersService} from "@/services/users-service";
import ImageUpload from "@/components/ImageUpload";

export default {
  name: 'Form',
  components: {ImageUpload, LoadingDialog, SimpleForm},

  data: () => ({
    users_service: new UsersService(),
    image: null,
    old_image: null,
    loading: false,
    showPassword: false,
    oldPassword: '',
    confirmPassword: '',
    new_created_user: '',
    user: {
      image: {},
      name: '',
      email: '',
      phone: '',
      password: '',
    },
  }),

  mounted() {
    this.loadUser();
  },

  methods: {
    required,

    getUploadedImage(_image_obj) {
      this.image = _image_obj.file;
    },

    loadUser() {
      this.loading = true;
      this.user = getUser();
      this.old_image = {
        url: this.user.image ? this.user.image : '',
      };
      this.user.password = '';
      this.$forceUpdate();
      this.loading = false;
    },

    async updateProfile(context) {
      const storage = getStorage();
      context.changeLoadingMessage('Updating User Profile');
      // Updating user profile
      try {
        if (this.image) {

          if (this.old_image && this.old_image.url) {
            await this.deleteImageFromFirebase(storage, this.old_image.url);
          }
          await this.uploadImageToFirebase(storage, this.image, auth.currentUser.uid);
        }

        await this.users_service.update(this.user, auth.currentUser.uid);

        return true
      } catch (e) {
        context.reportError({
          'title': 'Error while updating User',
          'description': 'Something went wrong while updating user.',
        })
        return false
      }
    },

    async updatePassword(context) {

      context.changeLoadingMessage('Updating User Password!, please wait...');

        if(this.oldPassword === this.user.password) {
          context.reportError({
            'title': "Error.",
            'description': "Old password & New password couldn't be same.",
          })
          return false;
        }

        // Sign in user with email & password
        try {
          const userCredential = await signInWithEmailAndPassword(auth, this.user.email, this.oldPassword)
          const user = userCredential.user;

          // Updating password in firebase
          try {
            await updatePassword(auth.currentUser, this.user.password);

            await this.users_service.update(this.user, auth.currentUser.uid);

            this.db_user = await this.users_service.fetchOne(user.uid);

            localStorage.clear()

            localStorage.setItem('auth_token', user.accessToken)
            localStorage.setItem('fb_auth_user', JSON.stringify(user))
            localStorage.setItem('auth_user', JSON.stringify(this.db_user))

          } catch (error) {
            context.reportError({
              'title': 'Ops! Something went wrong.',
              'description': 'Error occur while updating user password!',
            })
            return false;
          }

        } catch (e) {
          console.log(e)
          context.reportError({
            'title': "Error.",
            'description': "Old password doesn't match, Please double check it",
          })
          return false;
        }

        return true
    },

    async reloadData() {
      localStorage.removeItem('auth_user');
      localStorage.setItem('auth_user', JSON.stringify(await this.users_service.fetchOne(auth.currentUser.uid)));

      await this.loadUser()
    },

    async uploadImageToFirebase(storage, _file, _id) {
      const storageRef = ref(storage, _id + '_' + _file.name);

      await uploadBytes(storageRef, _file).then(async (snapshot) => {
        console.log(snapshot, 'snapshot')

        await getDownloadURL(storageRef)
            .then((url) => {
              console.log(url, 'url')
              this.user.image = url;
            })
            .catch((error) => {
              console.log(error, 'error')
            });

      }).catch(e => {
        console.log(e)
      });
    },

    async deleteImageFromFirebase(storage, file_url) {
      const desertRef = ref(storage, file_url);

      deleteObject(desertRef).then(() => {
        // File deleted successfully
      }).catch((error) => {
        console.log(error, 'error')
      });
    },
  }
};
</script>

<style scoped>
p {
  font-weight: bold;
  text-align: left;
}
</style>

