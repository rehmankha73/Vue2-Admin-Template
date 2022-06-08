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
            <SimpleForm :onSubmit="updatePassword" @done="reloadData">
              <p class="span-2 form__title">Update User Password</p>

              <v-text-field
                  class="span-2"
                  :rules="[required('A old password should match with current user password')]"
                  v-model="oldPassword"
                  :type="showPassword ? 'text' : 'password'"
                  label="Old Password"
                  outlined
              />

              <v-text-field
                  class="span-2"
                  :rules="[required('A strong password (minimum 8 characters) is required!')]"
                  v-model="user.password"
                  :type="showPassword ? 'text' : 'password'"
                  label="New Password"
                  outlined
              />

              <v-text-field
                  class="span-2"
                  v-model="confirmPassword"
                  :rules="[(v) => (v && v === user.password) || 'Passwords does not match']"
                  :type="showPassword ? 'text' : 'password'"
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
import {updatePassword} from "firebase/auth";
import {getUser} from '@/utils/local';
import {UsersService} from "@/services/users-service";
import ImageUpload from "@/components/ImageUpload";

export default {
  name: 'Form',
  components: {ImageUpload,LoadingDialog, SimpleForm},

  data: () => ({
    users_service: new UsersService(),
    image: null,
    old_image: null,
    loading: false,
    showPassword: false,
    confirmPassword: '',
    oldPassword: '',
    auth_user: '',
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
      console.log(this.user.image, 'load')

      this.old_image = {
        url: this.user.image ? this.user.image : '',
      };

      console.log(this.old_image, 'old_image')

      // this.old_image = {
      //   ...this.old_image
      // }

      this.user.password = '';

      this.$forceUpdate();
      this.loading = false;
    },

    async updateProfile(context) {
      const storage = getStorage();

      context.changeLoadingMessage('Updating User Profile');
      try {

        if (this.image) {
          console.log(this.image,'image')
          console.log(this.old_image.url, 'old_image');
          if(this.old_image && this.old_image.url) {
            await this.deleteImageFromFirebase(storage, this.old_image.url);
          }

          await this.uploadImageToFirebase(storage, this.image, auth.currentUser.uid);
        }

        console.log(this.user, 'final user')
        await this.users_service.update(this.user, auth.currentUser.uid);

        return true
      } catch (e) {
        context.reportError({
          'title': 'Error while creating User',
          'description': e.message,
        })

        return false
      }
    },

    async updatePassword(context) {
      context.changeLoadingMessage('Updating User Profile');
      try {
        let _local_user = getUser();
        if(this.oldPassword !== _local_user.password) {
          context.reportError({
            'title': "Old password doesn't match, Please double check it",
            'description': "Old password doesn't match, Please double check it",
          })

          return ;
        }

          // Updating password in firebase
          try {
            await updatePassword(auth.currentUser, this.user.password);
            console.log('firebase auth password changed...');
            await this.$router.push('/')
          } catch (error) {
            console.log(error, error.message)
            context.reportError({
              'title': 'Something went wrong while updating user!',
              'description': error.message,
            })
          }

        await this.users_service.update(this.user, auth.currentUser.uid);

        return true
      } catch (e) {
        context.reportError({
          'title': 'Error while creating User',
          'description': e.message,
        })

        return false
      }
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

