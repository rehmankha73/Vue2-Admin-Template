<template>
  <!--  :allow-add="getUser() ? getUser().scopes.includes('users:new') : false"-->
  <!--  :delete-handler="getUser() ? getUser().scopes.includes('users:delete') ?  students_service.delete : null : null"-->
  <!--  :edit-handler="getUser() ? getUser().scopes.includes('users:edit') ? edit : null : null"-->
  <data-table
      :allow-add="true"
      :delete-handler="deleteService"
      :edit-handler="edit"
      :headers="headers"
      :loader="loadData"
      :view-handler="view"
      title="Students"
      @done="$router.back()"
      @add-new="addNew"
  >
    <template #createdAt="{ item }">
      {{ formatDate(item.createdAt) }}
    </template>


    <template #image="{ item }">
      <v-avatar>
        <v-img
            :src="item.image"
            max-height="150"
            max-width="250"
        ></v-img>
      </v-avatar>
    </template>

    <!--    <template #scopes="{ item }">-->
    <!--      {{ item.scopes.join(', ').substr(0, 80) + '...' }}-->
    <!--    </template>-->
  </data-table>
</template>

<script>
import dayjs from 'dayjs';
import {StudentsService} from '@/services/students-service';
import DataTable from '../../components/DataTable';
import {getUser} from '@/utils/local';
import {ClassesService} from "@/services/classes-service";

export default {
  components: {DataTable},

  mounted() {
  },

  data: () => ({
    new_roll_no: '',
    items: [],
    loading: false,
    students_service: new StudentsService(),
    classes: new ClassesService(),

    headers: [
      {
        text: 'Roll #',
        value: 'roll_no',
        sortable: true,
        width: 150,
      },
      {
        text: 'Image',
        value: 'image',
        sortable: true,
        width: 150
      },
      {
        text: 'Name',
        value: 'name',
        sortable: true,
        width: 150
      },
      {
        text: 'Email',
        value: 'email',
        sortable: true,
        width: 200
      },
      {
        text: 'Phone',
        value: 'phone',
        sortable: true,
        width: 200
      },
      {
        width: 180,
        text: 'Created At',
        value: 'createdAt'
      }
    ]
  }),

  methods: {
    getUser,
    formatDate(date) {
      return dayjs(date).format('D MMM YYYY - hh:mm a');
    },

    addNew() {
      this.$router.push(`/student?new_roll_no=${this.new_roll_no}`);
    },
    edit(item) {
      this.$router.push(`/student?id=${item.id}`);
    },
    view(item) {
      this.$router.push(`/student-details?id=${item.id}`);
    },
    async deleteService(item) {
      await this.students_service.delete(item)
    },
    async loadData() {
      let _data = await this.students_service.fetchAll();

      let roll_no_array = []
      _data.forEach(s => roll_no_array.push((s.roll_no)));
      this.new_roll_no = _data.length > 0 ? parseInt(Math.max(...roll_no_array)) + 1 : 1;

      _data.sort(function (x, y) {
        return parseInt(x.roll_no) - parseInt(y.roll_no);
      });

      return _data
    }
  }
};
</script>

<style scoped></style>
