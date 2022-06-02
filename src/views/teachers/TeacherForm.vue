<template>
  <SimpleForm :onSubmit="submit" @done="$router.back()">
    <p class="span-2 form__title">{{ isEdit ? 'Update Teacher' : 'Create New Teacher' }}</p>

    <div class="drop mb-4" @drop="onDrop" @dragover.prevent>
      <input name="image" type="file" ref="file-input" @change="onChange" style="display: none;">
      <div v-if="!teacher.image" class="mx-4 cursor-pointer" style="margin-top: 80px" @click="$refs['file-input'].click();">
        + Select/Drop Image
      </div>

      <div v-else class="d-flex align-start" v-bind:class="{ 'image': true }" style="position: relative">
        <img :src="teacher.image" alt="" class="img"/>
        <button class="icon" @click="removeFile">X</button>
      </div>
    </div>

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
        label="Is Working"
    ></v-checkbox>


    <div class="span-2 mt-2">
      <label for="date_of_joining" style="color:#9E9E9E">
        Date of Joining
        <input
            v-model="teacher.date_of_joining"
            id="date_of_joining"
            type="date"
            class="span-2 date-type-style"
            placeholder="Date of Joining" />
      </label>
    </div>

    <div v-if="!teacher.is_working" class="span-2 mt-4">
      <label for="date_of_leaving" style="color:#9E9E9E">
        Date of Leaving
        <input
            v-model="teacher.date_of_leaving"
            id="date_of_leaving"
            type="date"
            class="span-2 date-type-style"
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

export default {
  name: 'Form',
  components: {LoadingDialog, SimpleForm},

  data: () => ({
    image: null,
    old_image_url: null,
    isEdit: false,
    loading: false,
    showPassword: false,
    teachers_service: new TeachersService(),
    confirmPassword: '',
    class_data: [],
    teacher: {
      image: '',
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
        vm.teacher.image = e.target.result;
      }
      console.log(this.teacher)
    },

    removeFile() {
      this.image = '';
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

    async loadTeacher() {
      if (!this.$route.query.id) return;
      this.isEdit = true;
      this.loading = true;
      this.teacher = await this.teachers_service.fetchOne(this.$route.query.id);
      console.log(this.teacher,'teacher')
      this.old_image_url = this.teacher.image;
      this.loading = false;
    },

    async submit(context) {
      const storage = getStorage();

      if (this.isEdit) {
        context.changeLoadingMessage('Updating Teacher');
        try {
          if(this.teacher.date_of_joining > this.teacher.date_of_leaving) {
            console.log('Invalid date, it is impossible to leave before join!')
            return ;
          }

          if (this.image) {
            await this.deleteImageFromFirebase(storage, this.old_image_url);
            await this.uploadImageToFirebase(storage, this.image, this.$route.query.id);
          }

          await this.teachers_service.update(this.teacher, this.$route.query.id);
          return true
        } catch (e) {
          console.log(e)
          context.reportError({
            'title': 'Error while creating Teacher',
            'description': e.response.data.error
          })
          return false
        }
      } else {
        context.changeLoadingMessage('Creating A New Teacher');
        try {
          if(this.teacher.date_of_joining > this.teacher.date_of_leaving) {
            console.log('Invalid date, it is impossible to leave before join!')
            return ;
          }

          let _id = this.getRandomId();
          // image uploads
          if (this.image) {
            await this.uploadImageToFirebase(storage, this.image, _id);
          }

          this.teacher.date_of_joining = new Date(this.teacher.date_of_joining);
          this.teacher.date_of_leaving = new Date(this.teacher.date_of_leaving);

          await this.teachers_service.create(this.teacher, _id);
          return true
        } catch (e) {
          console.log(e.response)
          context.reportError({
            'title': 'Error while creating Teacher',
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

.icon {
  position: absolute;
  color:red;
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

.cursor-pointer{
  cursor: pointer;
}

</style>
