<template>
  <div>
    <custom-data-table
        :can_add_new_item="true"
        :can_show_item="true"
        :can_edit_item="true"
        :can_delete_item="true"

        :getDataFunction="loadData"
        :headers="headers"
        :per_page_items="10"
        :show_footer_option="true"
        title="Teachers"

        @AddNewItem="addNew"
        @showItem="view"
        @editItem="edit"
        @deleteItem="deleteService"
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

    </custom-data-table>

    <!--    <data-table-->
    <!--        :allow-add="true"-->
    <!--        :delete-handler="deleteService"-->
    <!--        :edit-handler="edit"-->
    <!--        :headers="headers"-->
    <!--        :loader="loadData"-->
    <!--        :view-handler="view"-->
    <!--        title="Teachers"-->
    <!--        @done="$router.back()"-->
    <!--        @add-new="addNew"-->
    <!--    >-->
    <!--      <template #image="{ item }">-->
    <!--        <v-avatar>-->
    <!--          <v-img-->
    <!--              :src="item.image"-->
    <!--              max-height="150"-->
    <!--              max-width="250"-->
    <!--          ></v-img>-->
    <!--        </v-avatar>-->
    <!--      </template>-->

    <!--      <template #date_of_joining="{ item }">-->
    <!--        {{ formatDate(item.date_of_joining) }}-->
    <!--      </template>-->

    <!--      <template #is_working="{ item }">-->
    <!--      <span>-->
    <!--          {{ item.is_working ? 'Working' : 'Left' }}-->
    <!--      </span>-->
    <!--      </template>-->

    <!--    </data-table>-->
  </div>
</template>

<script>
import dayjs from 'dayjs';
// import DataTable from '../../components/DataTable';
import {TeachersService} from "@/services/teachers-service";
import CustomDataTable from "@/components/CustomDataTable";

export default {
  components: {CustomDataTable},

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
        text: 'Working Status',
        value: 'is_working',
        width: 200
      },
      {
        text: 'Joining Date',
        value: 'date_of_joining',
        sortable: true,
        width: 200
      },
    ]
  }),
  async mounted() {
    this.items = await this.loadData()
  },
  methods: {
    formatDate(date) {
      return dayjs(date).format('D MMM YYYY - hh:mm a');
    },

    addNew() {
      console.log('AddNewItem')
      this.$router.push('/teacher');
    },

    edit(item) {
      console.log(item)
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