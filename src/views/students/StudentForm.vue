<template>
  <SimpleForm :onSubmit="submit" @done="$router.back()">
    <p class="span-2 form__title">{{ isEdit ? 'Update Student' : 'Create New Student' }}</p>

    <div class="drop mb-4" @drop="onDrop" @dragover.prevent>
      <input name="image" type="file" ref="file-input" @change="onChange" style="display: none;">
      <div v-if="!image" class="mx-4 cursor-pointer" style="margin-top: 80px" @click="$refs['file-input'].click();">
        + Select/Drop Image
      </div>

      <div v-else class="d-flex align-start" v-bind:class="{ 'image': true }" style="position: relative">
        <img :src="student.image" alt="" class="img"/>
        <button class="icon" @click="removeFile">X</button>
      </div>
    </div>

    <v-text-field
        disabled
        v-model="student.roll_no"
        :rules="[required('A roll_no must be provided')]"
        class="span-2 mt-4"
        hint="Must be a unique Roll #"
        label="Roll #"
        outlined
        persistent-hint
        type="number"
    />

    <div
        class="d-flex span-2"
    >
      <v-select
          v-model="student.class_id"
          item-value="value" item-text="text"
          :items="getClassesItems()"
          label="Class"
          outlined
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
  </SimpleForm>
</template>

<script>
import SimpleForm from '../../components/Form';
import {StudentsService} from '@/services/students-service';
import {ClassesService} from "@/services/classes-service";
import LoadingDialog from '../../components/LoadingDialog';
import {required} from '@/utils/validators';
import {deleteObject, getDownloadURL, getStorage, ref, uploadBytes} from "firebase/storage";

export default {
  name: 'Form',
  components: {LoadingDialog, SimpleForm},

  data: () => ({
    image: null,
    isEdit: false,
    loading: false,
    showPassword: false,
    service: new StudentsService(),
    classes: new ClassesService(),
    confirmPassword: '',
    class_data: [],
    student: {
      class_id: '',
      roll_no: '',
      image: '',
      name: '',
      email: '',
      phone: '',
      address: '',
    },

  }),

  computed: {

  },

  mounted() {
    this.loadStudent();
    this.getClassesData();
    if (!this.isEdit) {
      this.student.roll_no = parseInt(this.$route.query.new_roll_no);
    }
  },

  methods: {
    required,

    getClassesItems() {
      let _data = [];
      this.class_data.forEach((c) => { _data.push({ value: c.id, text: c.title}) })
      return _data;
    },

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
        vm.student.image = e.target.result;
      }
      console.log(this.student)
    },
    removeFile() {
      this.image = '';
    },

    async getClassesData() {
      this.class_data = await this.classes.fetchAll();
    },

    async uploadImageToFirebase(storage, _file) {
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
    },

    async deleteImageFromFirebase(storage, file_url) {
      const desertRef = ref(storage, file_url);

      deleteObject(desertRef).then(() => {
        // File deleted successfully
      }).catch((error) => {
        console.log(error, 'error')
      });
    },

    async loadStudent() {
      if (!this.$route.query.id) return;
      this.isEdit = true;
      this.loading = true;
      this.student = await this.service.fetchOne(this.$route.query.id);
      this.image = this.student.image;
      this.loading = false;
    },

    async submit(context) {
      const storage = getStorage();

      if (this.isEdit) {
        context.changeLoadingMessage('Updating Student');
        try {
          if (this.image) {
            await this.deleteImageFromFirebase(storage, this.student.image);
            await this.uploadImageToFirebase(storage, this.image);
          }
          await this.service.update(this.student, this.$route.query.id);
          return true
        } catch (e) {
          console.log(e)
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
          if (this.image) {
            await this.uploadImageToFirebase(storage, this.image);
          }

          await this.service.create(this.student, this.getRandomId());
          return true
        } catch (e) {
          console.log(e.response)
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
