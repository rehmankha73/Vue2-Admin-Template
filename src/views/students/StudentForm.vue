<template>
  <SimpleForm :onSubmit="submit" @done="$router.back()">
    <p class="span-2 form__title">{{ isEdit ? 'Update Student' : 'Create New Student' }}</p>

    <v-img
        v-if="student.image"
        max-height="150"
        max-width="250"
        :src="student.image"
    ></v-img>

    <br>

    <v-file-input
        ref="file"
        counter
        show-size
        @change="uploadImage"
    ></v-file-input>

    <v-text-field
        v-model="student.roll_no"
        :rules="[required('A roll_no must be provided')]"
        class="span-2"
        hint="Must be a unique Roll #"
        label="Roll #"
        outlined
        persistent-hint
        type="number"
    />

    <v-text-field
        v-model="student.name"
        :rules="[required('A name must be provided')]"
        class="span-2"
        hint="Must be a authentic Name"
        label="Name"
        outlined
        persistent-hint
    />

    <v-text-field
        v-model="student.email"
        :rules="[required('A email must be provided')]"
        class="span-2"
        hint="Must be a authentic and unique email/"
        label="Email"
        outlined
        persistent-hint
    />

    <v-text-field
        v-model="student.phone"
        :rules="[required('A Phone must be provided')]"
        class="span-2"
        hint="Must be a authentic Phone Number."
        label="Phone"
        outlined
        persistent-hint
    />

    <v-text-field
        v-model="student.address"
        :rules="[required('Address must be provided')]"
        class="span-2"
        hint="Must be a authentic address"
        label="Address"
        outlined
        persistent-hint
    />

    <!--    <file-pond-->
    <!--        ref="pond"-->
    <!--        accepted-file-types="image/jpeg, image/png"-->
    <!--        label-idle="Drop files here..."-->
    <!--        name="test"-->
    <!--        server="/api"-->
    <!--        v-bind:allow-multiple="true"-->
    <!--        :files="myFiles"-->
    <!--        :init="handleFilePondInit"-->
    <!--    />-->

    <loading-dialog v-model="loading" message="Fetching Student Data"/>
  </SimpleForm>
</template>

<script>
import SimpleForm from '../../components/Form';
import {StudentsService} from '@/services/students-service';
import LoadingDialog from '../../components/LoadingDialog';
import {required} from '@/utils/validators';
import {getDownloadURL, getStorage, ref, uploadBytes} from "firebase/storage";
// import * as FilePond from 'filepond';

export default {
  name: 'Form',
  // components: {LoadingDialog, SimpleForm, FilePond},
  components: {LoadingDialog, SimpleForm},

  data: () => ({
    myFile: null,
    isEdit: false,
    loading: false,
    showPassword: false,
    service: new StudentsService(),
    confirmPassword: '',
    student: {
      roll_no: '',
      image: '',
      name: '',
      email: '',
      phone: '',
      address: '',
    },

  }),

  mounted() {
    this.loadStudent();
  },

  methods: {
    handleFilePondInit() {
      console.log("FilePond has initialized");

    },
    required,
    async uploadImage(e) {
      this.myFile = e;
    },

    async loadStudent() {
      if (!this.$route.query.id) return;
      this.isEdit = true;
      this.loading = true;
      this.student = await this.service.fetchOne(this.$route.query.id);
      this.loading = false;
    },

    async submit(context) {
      if (this.isEdit) {
        context.changeLoadingMessage('Updating Student');
        try {
          if(this.myFile) {

          }



          console.log(this.student.id)
          await this.service.update(this.student, this.$route.query.id);
          return true
        } catch (e) {
          context.reportError({
            'title': 'Error while creating Student',
            'description': e.response.data.error
          })

          return false
        }
      } else {

        context.changeLoadingMessage('Creating A New Student');
        try {

          // image uploads
          if (this.myFile) {
            let _file = this.myFile;
            const storage = getStorage();
            const storageRef = ref(storage, _file.name);

            await uploadBytes(storageRef, _file).then(async (snapshot) => {
              console.log(snapshot, 'snapshot')

              await getDownloadURL(storageRef)
                  .then((url) => {
                    console.log(url, 'url')
                    this.student.image = url;
                  })
                  .catch((error) => {
                    console.log(error, 'error')
                  });

            }).catch(e => {
              console.log(e)
            });
          }

          console.log(this.student)
          await this.service.create(this.student, this.getRandomId());
          return true
        } catch (e) {
          console.log(e)
          context.reportError({
            'title': 'Error while creating Student',
            'description': e.response.data.error
          })

          return false
        }
      }
    },

    getRandomId() {
      return Math.random().toString(36).substr(2, 9);
    }
  }
};
</script>

<style scoped>
p {
  font-weight: bold;
  text-align: left;
}
</style>
