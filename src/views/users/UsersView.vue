<template>
<!--  :allow-add="getUser() ? getUser().scopes.includes('users:new') : false"-->
<!--  :delete-handler="getUser() ? getUser().scopes.includes('users:delete') ?  service.delete : null : null"-->
<!--  :edit-handler="getUser() ? getUser().scopes.includes('users:edit') ? edit : null : null"-->
  <data-table
    :loader="loadData"
    :headers="headers"
    title="Users"
    @add-new="addNew"
    @done="$router.back()"
    :allow-add="true"
    :delete-handler="deleteService"
    :edit-handler="edit"
  >
    <template #createdAt="{ item }">
      {{ formatDate(item.createdAt) }}
    </template>

<!--    <template #scopes="{ item }">-->
<!--      {{ item.scopes.join(', ').substr(0, 80) + '...' }}-->
<!--    </template>-->
  </data-table>
</template>

<script>
import dayjs from 'dayjs';
import { UsersService } from '@/services/users-service';
import DataTable from '../../components/DataTable';
import {getUser} from '@/utils/local';

export default {
  components: { DataTable },

  mounted() {},

  data: () => ({
    items: [],
    loading: false,
    service: new UsersService(),

    headers: [
      {
        text: 'ID',
        value: 'id',
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
      this.$router.push('/user');
    },
    edit(item) {
      this.$router.push(`/user?id=${item.id}`);
    },
    async deleteService(item) {
      await this.service.delete(item)
    },
    async loadData() {
      console.log(await this.service.fetchAll(),'data after api call')
      return this.service.fetchAll();
    }
  }
};
</script>

<style scoped></style>
