<template>
  <data-table
      :allow-add="true"
      :delete-handler="deleteService"
      :edit-handler="edit"
      :headers="headers"
      :loader="loadData"
      :view-handler="view"
      title="Teachers"
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

    <template #dateOfJoining="{ item }">
      {{ formatDate(item.date_of_joining) }}
    </template>

    <!--    <template #scopes="{ item }">-->
    <!--      {{ item.scopes.join(', ').substr(0, 80) + '...' }}-->
    <!--    </template>-->
  </data-table>
</template>

<script>
import dayjs from 'dayjs';
import DataTable from '../../components/DataTable';
import {TeachersService} from "@/services/teachers-service";

export default {
  components: {DataTable,},

  data: () => ({
    new_roll_no: '',
    items: [],
    loading: false,
    teachers_service: new TeachersService(),

    headers: [
      {
        text: 'Image',
        value: 'image',
        sortable: true,
        width: 150,
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
        text: 'Joining Date',
        value: 'date_of_joining',
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
    formatDate(date) {
      return dayjs(date).format('D MMM YYYY - hh:mm a');
    },

    addNew() {
      this.$router.push('/teacher');
    },
    edit(item) {
      this.$router.push(`/teacher?id=${item.id}`);
    },
    view(item) {
      this.$router.push(`/teacher-details?id=${item.id}`);
    },
    async deleteService(item) {
      await this.teachers_service.delete(item)
    },
    async loadData() {
      return await this.teachers_service.fetchAll()

    }
  }
};
</script>

<style scoped></style>