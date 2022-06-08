<template>
  <SimpleForm :onSubmit="submit" @done="$router.back()">
    <p class="span-2 form__title">{{ isEdit ? 'Update Class' : 'Create New Class' }}</p>

    <v-text-field
        v-model="class_data.room_no"
        :rules="[required('A Room # must be provided')]"
        class="span-2 mt-4"
        hint="Must be a unique Room #"
        label="Room #"
        outlined
        persistent-hint
        type="number"
    />

    <div
        class="d-flex span-2"
    >
      <v-select
          v-model="class_data.teacher_id"
          item-value="value" item-text="text"
          :rules="[required('Please select a teacher')]"
          :items="getTeacherDataItems()"
          label="Class In-charge Teacher"
          outlined
          hint="Select Teacher from the following"
          persistent-hint
      ></v-select>
    </div>

    <v-text-field
        v-model="class_data.title"
        :rules="[required('A title must be provided')]"
        class="span-2"
        hint="Must be a title"
        persistent-hint
        label="Title"
        outlined
    />

    <v-text-field
        v-model="class_data.section"
        :rules="[required('A section must be provided')]"
        class="span-2"
        hint="Must be a section like A,B,C"
        label="Section"
        outlined
        persistent-hint
    />

    <loading-dialog v-model="loading" message="Fetching Class Data"/>
  </SimpleForm>
</template>

<script>
import SimpleForm from '../../components/Form';
import {ClassesService} from "@/services/classes-service";
import LoadingDialog from '../../components/LoadingDialog';
import {required} from '@/utils/validators';
import {TeachersService} from "@/services/teachers-service";

export default {
  name: 'Form',
  components: {LoadingDialog, SimpleForm},

  data: () => ({
    image: null,
    isEdit: false,
    loading: false,
    showPassword: false,
    classes_service: new ClassesService(),
    teachers: new TeachersService(),
    confirmPassword: '',
    teacher_data_items: [],
    class_data: {
      room_no: '',
      teacher_id: '',
      title: '',
      section: '',
    },
  }),

  mounted() {
    this.loadClass();
    this.getTeachersData();
  },

  methods: {
    required,
    getTeacherDataItems() {
      let _data = [];
      this.teacher_data_items.forEach((t) => { _data.push({ value: t.id, text: t.name}) })
      return _data;
    },

    async getTeachersData() {
      this.teacher_data_items = await this.teachers.fetchAll();
    },

    async loadClass() {
      if (!this.$route.query.id) return;
      this.isEdit = true;
      this.loading = true;
      this.class_data = await this.classes_service.fetchOne(this.$route.query.id);
      this.loading = false;
    },

    async submit(context) {
      if (this.isEdit) {
        context.changeLoadingMessage('Updating Class');
        try {
          await this.classes_service.update(this.class_data, this.$route.query.id);
          return true
        } catch (e) {
          context.reportError({
            'title': 'Error while updating class',
            'description': e.message ? e.message : 'Something went wrong while updating class.'
          })
          return false
        }
      } else {
        context.changeLoadingMessage('Creating A New Class');
        try {
          await this.classes_service.create(this.class_data, this.getRandomId());
          return true
        } catch (e) {
          context.reportError({
            'title': 'Error while creating class',
            'description': e.message ? e.message : 'Something went wrong while creating class'
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
