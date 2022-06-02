<template>
  <data-table
      :allow-add="true"
      :allow-filters="true"
      :delete-handler="deleteService"
      :edit-handler="edit"
      :headers="headers"
      :loader="loadData"
      :view-handler="view"
      title="Classes Data"
      @done="$router.back()"
      @add-new="addNew"
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
import DataTable from '../../components/DataTable';
import {getUser} from '@/utils/local';
import {ClassesService} from "@/services/classes-service";

export default {
  components: {DataTable},

  mounted() {
  },

  data: () => ({
    items: [],
    loading: false,
    classes: new ClassesService(),

    headers: [
      {
        text: 'Room #',
        value: 'room_no',
        sortable: true,
        width: 150
      },
      {
        text: 'Class Name',
        value: 'title',
        sortable: true,
        width: 150,
      },
      {
        text: 'Class Section',
        value: 'section',
        sortable: true,
        width: 150,
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
      this.$router.push('/class');
    },
    edit(item) {
      this.$router.push(`/class?id=${item.id}`);
    },
    view(item) {
      this.$router.push(`/class-details?id=${item.id}`);
    },
    async deleteService(item) {
      await this.classes.delete(item)
    },
    async loadData() {
      return await this.classes.fetchAll()
    }
  }
};
</script>

<style scoped></style>
