<template>
  <SimpleForm :onSubmit="submit" @done="$router.back()">

    <p class="span-2 form__title">{{ isEdit ? 'Update User' : 'Create New User' }}</p>

    <div class="drop mb-4" @drop="onDrop" @dragover.prevent>
      <input ref="file-input" name="image" style="display: none;" type="file" @change="onChange">
      <div v-if="!user.image" class="mx-4 cursor-pointer" style="margin-top: 80px"
           @click="$refs['file-input'].click();">
        + Select/Drop Image
      </div>

      <div v-else class="d-flex align-start" style="position: relative" v-bind:class="{ 'image': true }">
        <img :src="user.image" alt="" class="img"/>
        <button class="icon" @click="removeFile">X</button>
      </div>
    </div>

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
        :readonly="isEdit"
        v-model="user.email"
        :rules="[required('Email must be provided')]"
        class="span-2"
        hint="Must be a unique email"
        label="Email"
        outlined
        persistent-hint
    />

    <v-text-field
        :readonly="isEdit"
        v-model="user.password"
        :type="showPassword ? 'text' : 'password'"
        dense
        label="Password"
        outlined
    />

    <v-text-field
        :readonly="isEdit"
        v-model="confirmPassword"
        :rules="[(v) => (v && v === user.password) || 'Passwords does not match']"
        :type="showPassword ? 'text' : 'password'"
        dense
        label="Confirm Password"
        outlined
    />

    <v-checkbox
        v-if="auth_user.email === user.email"
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
import { getUser } from '@/utils/local';

export default {
  name: 'Form',
  components: {LoadingDialog, SimpleForm},

  data: () => ({
    image: null,
    old_image_url: null,
    isEdit: false,
    loading: false,
    showPassword: false,
    users_service: new UsersService(),
    confirmPassword: '',
    auth_user: '',
    user: {
      image: '',
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
    async loadUser() {
      if (!this.$route.query.id) return;
      this.isEdit = true;
      this.loading = true;
      this.user = await this.users_service.fetchOne(this.$route.query.id);
      this.confirmPassword = this.user.password
      this.loading = false;
    },

    async submit(context) {
      const storage = getStorage();

      if (this.isEdit) {
        context.changeLoadingMessage('Updating User');
        try {
          if (this.image) {
            await this.deleteImageFromFirebase(storage, this.old_image_url);
            await this.uploadImageToFirebase(storage, this.image, this.$route.query.id);
          }

          await this.users_service.update(this.user, this.$route.query.id);
          return true
        } catch (e) {
          context.reportError({
            'title': 'Error while creating User',
            'description': e.response.data.error
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

          await createUserWithEmailAndPassword(auth, this.user.email, this.user.password)
              .then((userCredential) => {
                // Signed in
                this.auth_user = userCredential.user;
              })
              .catch((error) => {
                console.log(error)
              });

          if (this.image) {
            await this.uploadImageToFirebase(storage, this.image, this.auth_user.uid);
          }

          await this.users_service.create(this.user, this.auth_user.uid);
          return true
        } catch (e) {
          context.reportError({
            'title': 'Error while creating User',
            'description': e.response.data.error
          })

          return false
        }
      }
    },

    getRandomId() {
      return Math.random().toString(36).substr(2, 9);
    },

    // for image storage control
    onDrop: function (e) {
      e.stopPropagation();
      e.preventDefault();
      let files = e.dataTransfer.files;
      this.createFile(files[0]);
    },

    onChange(e) {
      let files = e.target.files;
      this.createFile(files[0]);
    },

    createFile(file) {
      let reader = new FileReader();
      this.image = file;
      let vm = this;

      reader.readAsDataURL(file);

      reader.onload = function (e) {
        vm.user.image = e.target.result;
      }
      console.log(this.user)
    },

    removeFile() {
      this.image = '';
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

.icon {
  position: absolute;
  color: red;
  top: 0;
  right: 5px;
}

html, body {
  height: 100%;
  text-align: center;
}

.btn {
  background-color: #d3394c;
  border: 0;
  color: #fff;
  cursor: pointer;
  display: inline-block;
  font-weight: bold;
  padding: 15px 35px;
  position: relative;
}

.btn:hover {
  background-color: #722040;
}

input[type="file"] {
  position: absolute;
  opacity: 0;
  z-index: -1;
}

.align-center {
  text-align: center;
}

.helper {
  height: 100%;
  display: inline-block;
  vertical-align: middle;
  width: 0;
}

.hidden {
  display: none !important;
}

.hidden.image {
  display: inline-block !important;
}

.display-inline {
  display: inline-block;
  vertical-align: middle;
}

.img {
  border: 1px solid #f6f6f6;
  display: inline-block;
  height: 200px;
  width: 200px;
  margin-left: -2px;
  margin-top: -2px;
  object-fit: contain;
}

.drop {
  background-color: #f2f2f2;
  border: 2px dashed #ccc;
  border-radius: 2px;
  height: 200px;
  width: 200px;
}

.cursor-pointer {
  cursor: pointer;
}

</style>

