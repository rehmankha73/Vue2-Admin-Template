<template>
  <SimpleForm :onSubmit="submit" @done="$router.back()">

    <p class="span-2 form__title">{{ isEdit ? 'Update User' : 'Create New User' }}</p>

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
        :readonly="isEdit"
        :rules="[required('Email must be provided')]"
        class="span-2"
        hint="Must be a unique email"
        label="Email"
        outlined
        persistent-hint
    />

    <v-text-field
        v-if="!isEdit"
        v-model="user.password"
        :rules="[required('A strong password (minimum 8 characters) is required!')]"
        :type="showPassword ? 'text' : 'password'"
        class="span-2"
        label="New Password"
        outlined
    />

    <v-text-field
        v-if="!isEdit"
        v-model="confirmPassword"
        :rules="[(v) => (v && v === user.password) || 'Passwords does not match']"
        :type="showPassword ? 'text' : 'password'"
        class="span-2"
        label="Confirm Password"
        outlined
    />

    <v-checkbox
        v-if="!isEdit"
        v-model="showPassword"
        label="Show Password"
        style="margin-top: -15px"
    />

    <loading-dialog v-model="loading" message="Fetching User Data"/>
  </SimpleForm>
</template>

<script>
import SimpleForm from '../../components/Form';
import {UsersService} from '@/services/users-service';
import LoadingDialog from '../../components/LoadingDialog';
import {required} from '@/utils/validators';
import {deleteObject, getDownloadURL, getStorage, ref, uploadBytes} from "firebase/storage";
import {createUserWithEmailAndPassword} from "firebase/auth";
import {auth} from '@/firebase_config'
import {getUser} from '@/utils/local';
import ImageUpload from "@/components/ImageUpload";

export default {
  name: 'Form',
  components: {ImageUpload, LoadingDialog, SimpleForm},

  data: () => ({
    is_mounted: false,
    image: null,
    old_image: null,
    isEdit: false,
    loading: false,
    users_service: new UsersService(),
    auth_user: '',
    showPassword: false,
    confirmPassword: '',
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
    this.auth_user = getUser() ? getUser() : null;

  },

  methods: {
    required,

    getUploadedImage(_image_obj) {
      this.image = _image_obj.file;
    },

    async loadUser() {
      if (!this.$route.query.id) return;
      this.isEdit = true;
      this.loading = true;
      this.user = await this.users_service.fetchOne(this.$route.query.id);
      this.old_image = {
        url: this.user.image
      };

      this.loading = false;
    },

    async submit(context) {
      const storage = getStorage();

      if (this.isEdit) {
        context.changeLoadingMessage('Updating User');
        try {
          if (this.image) {
            await this.deleteImageFromFirebase(storage, this.old_image.url);
            await this.uploadImageToFirebase(storage, this.image, this.$route.query.id);
          }

          await this.users_service.update(this.user, this.$route.query.id);
          return true
        } catch (e) {
          context.reportError({
            'title': 'Error while creating User',
            'description': e.message
          })

          return false
        }
      } else {

        context.changeLoadingMessage('Creating A New User');
        try {
          if (this.user.password !== this.confirmPassword) {
            context.reportError({
              'title': "Password doesn't match",
            })
            return true;
          }

          try {
            const credentials = await createUserWithEmailAndPassword(auth, this.user.email, this.user.password)
            // Signed in
            this.auth_user = credentials.user;

          } catch (e) {
            context.reportError({
              'title': "Something went wrong while creating new user, please try later!",
              'description': e.message,
            })
          }

          if (this.image) {
            await this.uploadImageToFirebase(storage, this.image, this.auth_user.uid);
          }

          await this.users_service.create(this.user, this.auth_user.uid);
          return true
        } catch (e) {
          context.reportError({
            'title': 'Error while creating User',
            'description': e.message
          })

          return false
        }
      }
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
        console.log(error, 'error from deleteImage')
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