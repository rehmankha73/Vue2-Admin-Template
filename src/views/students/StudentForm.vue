<template>
<!--    <SimpleForm :onSubmit="submit" @done="$router.back()">-->
  <r-form :onSubmit="submit" @done="$router.back()">
    <template #main>
      <p class="span-2 form__title">{{ isEdit ? 'Update Student' : 'Create New Student' }}</p>

      <image-upload
          :isFormSubmitted="isFormSubmitted"
          :image_obj="old_image"
          @uploadedImage="getUploadedImage"
      />

      <v-text-field
          readonly
          v-model="student.roll_no"
          :rules="[required('A roll_no must be provided')]"
          class="span-2 mt-4"
          hint="Must be a unique Roll #"
          label="Roll #"
          outlined
          persistent-hint
          type="number"
      />

      <div class="d-flex span-2">
        <v-select
            v-model="student.class_id"
            :items="getClassesItems()" :rules="[required('A class must be provided')]"
            hint="Select Class from the following"
            item-text="text"
            item-value="value"
            label="Class"
            outlined
            persistent-hint
        ></v-select>
      </div>

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

      <loading-dialog v-model="loading" message="Fetching Student Data"/>

    </template>
    <template #actions>
      <v-btn @click="showToast">show toast</v-btn>
    </template>

  </r-form>
<!--    </SimpleForm>-->
</template>

<script>
// import SimpleForm from '../../components/Form';
import RForm from '../../components/RForm';
import {StudentsService} from '@/services/students-service';
import {ClassesService} from "@/services/classes-service";
import LoadingDialog from '../../components/LoadingDialog';
import { required } from '@/utils/validators';
import { deleteObject, getDownloadURL, ref, uploadBytes, getStorage } from "firebase/storage";
import ImageUpload from "@/components/ImageUpload";
import { showToast } from '@/assets/toast';

export default {
  name: 'Form',
  components: {
    LoadingDialog,
    ImageUpload,
    // SimpleForm
    RForm,
  },

  data: () => ({
    image: null,
    old_image: null,
    isFormSubmitted: false,
    isEdit: false,
    loading: false,
    showPassword: false,
    students_service: new StudentsService(),
    classes_service: new ClassesService(),
    confirmPassword: '',
    class_data: [],
    student: {
      class_id: '',
      roll_no: '',
      image: {},
      name: '',
      email: '',
      phone: '',
      address: '',
    },
  }),

  mounted() {
    this.loadStudent();
    this.getClassesData();

    if (!this.isEdit) {
      this.student.roll_no = parseInt(this.$route.query.new_roll_no);
    }
  },

  methods: {
    required,
    showToast() {
      showToast( 'success', 'Student created successfully!')
    },

    getUploadedImage(_image_obj) {
      this.image = _image_obj.file;
    },

    getClassesItems() {
      let _data = [];
      this.class_data.forEach((c) => {
        _data.push({value: c.id, text: c.title})
      })
      return _data;
    },

    async getClassesData() {
      this.class_data = await this.classes_service.fetchAll();
    },

    async loadStudent() {
      if (!this.$route.query.id) return;
      this.isEdit = true;
      this.loading = true;
      this.student = await this.students_service.fetchOne(this.$route.query.id);
      this.old_image = {
        url: this.student.image
      };

      this.loading = false;
    },

    async submit(context) {
      const storage = getStorage();

      if (this.isEdit) {
        this.isFormSubmitted = true
        context.changeLoadingMessage('Updating Student');
        try {
          if (this.image) {
            await this.deleteImageFromFirebase(storage, this.old_image.url);
            await this.uploadImageToFirebase(storage, this.image, this.$route.query.id);
          } else {
            context.reportError({
              'title': 'Error!',
              'description': 'Image is required while creating student!'
            })
            return false
          }
          await this.students_service.update(this.student, this.$route.query.id);
          return true
        } catch (e) {
          context.reportError({
            'title': 'Error while updating Student',
            'description': e.message ? e.message : 'Something went wrong while updating student'
          })
          return false
        }
      } else {
        this.isFormSubmitted = true;
        context.changeLoadingMessage('Creating A New Student');
        try {
          let _id = this.getRandomId();

          // image uploads
          if (this.image) {
            await this.uploadImageToFirebase(storage, this.image, _id);
          } else {
            context.reportError({
              'title': 'Error while creating Student',
              'description': 'Image is required while creating student!'
            })
            return false
          }

          await this.students_service.create(this.student, _id);
          return true
        } catch (e) {
          context.reportError({
            'title': 'Error while creating Student',
            'description': e.message ? e.message : 'Something went wrong while creating student'
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
              this.student.image = url;
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