<template>
  <SimpleForm :onSubmit="submit" @done="$router.back()">
    <p class="span-2 form__title">{{ isEdit ? 'Update Teacher' : 'Create New Teacher' }}</p>

    <image-upload
        :isFormSubmitted="isFormSubmitted"
        :image_obj="old_image"
        @uploadedImage="getUploadedImage"
    />

    <v-text-field
        v-model="teacher.name"
        :rules="[required('A name must be provided')]"
        class="span-2"
        hint="Must be a authentic Name"
        label="Name"
        outlined
        persistent-hint
    />

    <v-text-field
        v-model="teacher.subject"
        :rules="[required('A subject must be provided')]"
        class="span-2"
        hint="Must be a Subject"
        label="Subject"
        outlined
        persistent-hint
    />

    <v-text-field
        v-model="teacher.email"
        :rules="[required('A email must be provided')]"
        class="span-2"
        hint="Must be a authentic and unique email/"
        label="Email"
        outlined
        persistent-hint
    />

    <v-text-field
        v-model="teacher.phone"
        :rules="[required('A Phone must be provided')]"
        class="span-2"
        hint="Must be a authentic Phone Number."
        label="Phone"
        outlined
        persistent-hint
    />

    <v-text-field
        v-model="teacher.address"
        :rules="[required('Address must be provided')]"
        class="span-2"
        hint="Must be a authentic address"
        label="Address"
        outlined
        persistent-hint
    />

    <v-checkbox
        class="span-2"
        v-model="teacher.is_working"
        label="Currently Working"
    ></v-checkbox>

    <div class="span-2 mt-2">
      <label for="date_of_joining" style="color:#9E9E9E">
        Date of Joining
        <v-text-field
            v-model="teacher.date_of_joining"
            :rules="[required('Date of joining is required!')]"
            id="date_of_joining"
            type="date"
            class="span-2"
            placeholder="Date of Joining" />
      </label>
    </div>

    <div v-if="!teacher.is_working" class="span-2 mt-4">
      <label for="date_of_leaving" style="color:#9E9E9E">
        Date of Leaving
        <v-text-field
            v-model="teacher.date_of_leaving"
            :rules="!teacher.is_working ? [required('Date of joining is required!')] : ''"
            id="date_of_leaving"
            type="date"
            class="span-2 "
            placeholder="Date of Leaving" />
      </label>
    </div>

    <loading-dialog v-model="loading" message="Fetching Teacher Data"/>
  </SimpleForm>
</template>

<script>
import SimpleForm from '../../components/Form';
import LoadingDialog from '../../components/LoadingDialog';
import {required} from '@/utils/validators';
import {deleteObject, getDownloadURL, getStorage, ref, uploadBytes} from "firebase/storage";
import {TeachersService} from "@/services/teachers-service";
import ImageUpload from "@/components/ImageUpload";

export default {
  name: 'Form',
  components: {ImageUpload, LoadingDialog, SimpleForm},

  data: () => ({
    image: null,
    old_image: null,
    isFormSubmitted: false,
    isEdit: false,
    loading: false,
    showPassword: false,
    teachers_service: new TeachersService(),
    confirmPassword: '',
    class_data: [],
    teacher: {
      image: {},
      name: '',
      email: '',
      phone: '',
      address: '',
      subject: '',
      is_working: true,
      date_of_joining: '',
      date_of_leaving: '',
    },
  }),

  mounted() {
    this.loadTeacher();
  },

  methods: {
    required,

    getUploadedImage(_image_obj) {
      this.image = _image_obj.file;
    },

    async loadTeacher() {
      if (!this.$route.query.id) return;
      this.isEdit = true;
      this.loading = true;
      this.teacher = await this.teachers_service.fetchOne(this.$route.query.id);
      this.old_image = {
        url: this.teacher.image
      };

      this.loading = false;
    },

    async submit(context) {
      const storage = getStorage();

      if (this.isEdit) {
        this.isFormSubmitted = true
        context.changeLoadingMessage('Updating Teacher');
        try {
          if(this.teacher.date_of_leaving && (this.teacher.date_of_joining > this.teacher.date_of_leaving)) {
            context.reportError({
              'title': 'Error',
              'description': "Invalid date, it is impossible to leave before join!",
            })
            return false
          }

          if (this.image) {
            await this.deleteImageFromFirebase(storage, this.old_image.url);
            await this.uploadImageToFirebase(storage, this.image, this.$route.query.id);
          } else {
            context.reportError({
              'title': 'Error!',
              'description': 'Image is required while creating teacher!'
            })
            return false
          }

          await this.teachers_service.update(this.teacher, this.$route.query.id);
          return true
        } catch (e) {
          context.reportError({
            'title': 'Error while updating teacher',
            'description': e.message ? e.message : 'Something went wrong while updating teacher',
          })
          return false
        }
      } else {
        this.isFormSubmitted = true
        context.changeLoadingMessage('Creating A New Teacher');
        try {
          if(this.teacher.date_of_leaving && (this.teacher.date_of_joining > this.teacher.date_of_leaving)) {
            context.reportError({
              'title': 'Error',
              'description': "Invalid date, it is impossible to leave before join!",
            })
            return false
          }

          let _id = this.getRandomId();

          // image uploads
          if (this.image) {
            await this.uploadImageToFirebase(storage, this.image, _id);
          } else {
            context.reportError({
              'title': 'Error!',
              'description': 'Image is required while creating student!'
            })
            return false
          }

          await this.teachers_service.create(this.teacher, _id);
          return true
        } catch (e) {
          context.reportError({
            'title': 'Error while creating Teacher',
            'description': e.message ? e.message : 'Something went wrong while creating teacher'
          })
          return false
        }
      }
    },

    async uploadImageToFirebase(storage, _file, _id) {
      const storageRef = ref(storage, _id+'_'+_file.name);

      await uploadBytes(storageRef, _file).then(async (snapshot) => {
        console.log(snapshot, 'snapshot')

        await getDownloadURL(storageRef)
            .then((url) => {
              console.log(url, 'url')
              this.teacher.image = url;
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

.date-type-style {
  border: 1px solid #9E9E9E;
  color: #9E9E9E;
  width: 100%;
  padding: 15px 5px;
  border-radius:5px;
}

.date-type-style:focus {
  border-color: #1976D2;
  outline-color: #1976D2;
}

p {
  font-weight: bold;
  text-align: left;
}
</style>