<template>
  <!--  :allow-add="getUser() ? getUser().scopes.includes('users:new') : false"-->
  <!--  :delete-handler="getUser() ? getUser().scopes.includes('users:delete') ?  service.delete : null : null"-->
  <!--  :edit-handler="getUser() ? getUser().scopes.includes('users:edit') ? edit : null : null"-->
  <data-table
      :allow-add="true"
      :delete-handler="deleteService"
      :edit-handler="edit"
      :headers="headers"
      :loader="loadData"
      title="Students"
      @done="$router.back()"
      @add-new="addNew"
  >
    <template #createdAt="{ item }">
      {{ formatDate(item.createdAt) }}
    </template>

    <template #image="{ item }">
      <v-img
          max-height="150"
          max-width="250"
          :src="item.image"
      ></v-img>
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

export default {
  components: {DataTable},

  mounted() {
  },

  data: () => ({
    items: [],
    loading: false,
    service: new StudentsService(),

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
        text: 'Address',
        value: 'address',
        sortable: true,
        width: 150
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
      this.$router.push('/student');
    },
    edit(item) {
      console.log(item)
      this.$router.push(`/student?id=${item.id}`);
    },
    async deleteService(item) {
      await this.service.delete(item.id)
    },
    async loadData() {
      console.log(await this.service.fetchAll(), 'data after api call')
      return this.service.fetchAll();
    }
  }
};
</script>

<style scoped></style>
