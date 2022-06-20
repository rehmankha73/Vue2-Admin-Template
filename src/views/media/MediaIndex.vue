<template>
  <div>
    <r-data-table
        :can_add_new_item="true"
        :can_delete_item="true"
        :can_edit_item="true"
        :can_filter="true"

        :getDataFunction="loadData"
        :headers="headers"
        :per_page_items="10"
        :show_footer_option="true"
        title="Media"

        @AddNewItem="addNew"
        @deleteItem="deleteItem"
        @editItem="edit"
    >
      <template #files="{ item }" >
        <div style="display: flex; flex-direction: row; justify-content: start; align-items: start; margin-top: 10px; margin-bottom: 10px">
          <div v-for="(file, key) in item.files" :key="key" style="margin-right:10px; height: 150px; width:150px; ">
            <img
                style="margin-right: 10px; height: 150px; width: 150px"
                v-if="file && !file.thumbnail_url"
                :alt="file.name"
                :src="file.url"
            />
            <video
                v-else
                style=" height:100%; width: 150px; object-fit: cover"
                :poster="file.thumbnail_url"
                :src="file.url"
                class="file-preview"
                controls
            ></video>
          </div>
        </div>
      </template>

    </r-data-table>
  </div>
</template>

<script>
import dayjs from 'dayjs';
import {MediaService} from "@/services/media-service";
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
        width: 200
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