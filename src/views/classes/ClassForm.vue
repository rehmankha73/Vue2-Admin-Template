<template>
  <SimpleForm :onSubmit="submit" @done="$router.back()">
    <p class="span-2 form__title">{{ isEdit ? 'Update Class' : 'Create New Class' }}</p>

    <v-text-field
        v-model="class_data.room_no"
        :rules="[required('A room_no must be provided')]"
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
          :items="getTeacherDataItems()"
          label="Class In-charge Teacher"
          outlined
      ></v-select>
    </div>

    <v-text-field
        v-model="class_data.title"
        :rules="[required('A title must be provided')]"
        class="span-2"
        hint="Must be a title"
        label="Title"
        outlined
        persistent-hint
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
    classes: new ClassesService(),
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
      console.log(this.teacher_data_items)
    },

    async loadClass() {
      if (!this.$route.query.id) return;
      this.isEdit = true;
      this.loading = true;
      this.class_data = await this.classes.fetchOne(this.$route.query.id);
      this.loading = false;
    },

    async submit(context) {
      if (this.isEdit) {
        context.changeLoadingMessage('Updating Class');
        try {
          await this.classes.update(this.class_data, this.$route.query.id);
          return true
        } catch (e) {
          console.log(e)
          context.reportError({
            'title': 'Error while creating Class',
            'description': e.response.data.error
          })

          return false
        }
      } else {

        context.changeLoadingMessage('Creating A New Class');
        try {

          console.log(this.class_data)
          await this.classes.create(this.class_data, this.getRandomId());
          return true
        } catch (e) {
          console.log(e.response)
          context.reportError({
            'title': 'Error while creating Class',
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
