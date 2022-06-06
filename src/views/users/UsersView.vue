<template>
  <data-table
      :allow-add="true"
      :view-handler="showService"
      :edit-handler="edit"
      :headers="headers"
      :loader="loadData"
      title="Users"
      @done="$router.back()"
      @add-new="addNew"
  >
    <template #image="{ item }">
      <v-avatar>
        <v-img
            :src="item.image"
            max-height="150"
            max-width="250"
        ></v-img>
      </v-avatar>
    </template>

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
import {UsersService} from '@/services/users-service';
import DataTable from '../../components/DataTable';
import {getUser} from '@/utils/local';

export default {
  components: {DataTable},

  data: () => ({
    items: [],
    loading: false,
    user_service: new UsersService(),

    headers: [
      {
        text: 'Image',
        value: 'image',
        sortable: true,
        width: 200
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
      this.$router.push('/user');
    },
    edit(item) {
      this.$router.push(`/user?id=${item.id}`);
    },
    async deleteService(item) {
      await this.user_service.delete(item)
    },
    async showService(item) {
      await this.user_service.fetchOne(item)
    },

    async loadData() {
      return this.user_service.fetchAll();
    }
  }
};
</script>

<style scoped></style>
