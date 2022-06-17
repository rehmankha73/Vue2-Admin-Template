<template>
  <div>
    <r-data-table
        :can_add_new_item="true"
        :can_filter="true"
        :can_edit_item="true"
        :can_delete_item="true"

        :getDataFunction="loadData"
        :headers="headers"
        :per_page_items="10"
        :show_footer_option="true"
        title="Media"

        @AddNewItem="addNew"
        @editItem="edit"
        @deleteItem="deleteItem"
    >
      <template #files="{ item }">
        <v-avatar v-for="(image, key) in item.files" :key="key" style="margin-right: 10px; margin-top: 10px;margin-bottom: 10px">
          <v-img
              :alt="image.name"
              :src="image.url"
              max-height="150"
              max-width="250"
          ></v-img>
        </v-avatar>
      </template>

    </r-data-table>
  </div>
</template>

<script>
import dayjs from 'dayjs';
import { MediaService } from "@/services/media-service";
import RDataTable from "@/components/RDataTable";

export default {
  name: "MediaIndex",
  components: {
    RDataTable
  },

  data: () => ({
    loading: false,
    media_service: new MediaService(),

    headers: [
      {
        text: 'ID',
        value: 'id',
        sortable: true,
        width: 100
      },
      {
        text: 'Media Items',
        value: 'files',
        sortable: true,
      },
    ]
  }),
  methods: {
    formatDate(date) {
      return dayjs(date).format('D MMM YYYY - hh:mm a');
    },

    addNew() {
      this.$router.push('/media-picker');
    },

    edit(item) {
      this.$router.push(`/media-picker?id=${item.id}`);
    },

    async deleteItem(item) {
      await this.media_service.delete(item)
    },

    async loadData() {
      return await this.media_service.fetchAll()
    }
  }
};
</script>

<style scoped></style>