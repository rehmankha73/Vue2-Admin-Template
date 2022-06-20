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
      <template #files="{ item }">
        <div
            style="display: flex; flex-direction: row; justify-content: start; align-items: start; margin-top: 10px; margin-bottom: 10px">
          <div v-for="(file, key) in item.files" :key="key"
               style="margin-right:10px; height: 150px; width:150px; position: relative"
               @click="showPreview(key, item)">
            <img
                :alt="file.name"
                :src="!file.thumbnail_url ? file.url : file.thumbnail_url"
                style="margin-right: 10px; height: 150px; width: 150px"
            />
            <v-icon
                v-if="file.thumbnail_url"
                large
                style="position: absolute;top: 30px; right: 30px; color: white; font-size: 100px; cursor: pointer"
            >
              mdi-play
            </v-icon>
            <!--            <video-->
            <!--                v-else-->
            <!--                style=" height:100%; width: 150px; object-fit: cover"-->
            <!--                :poster="file.thumbnail_url"-->
            <!--                :src="file.url"-->
            <!--                class="file-preview"-->
            <!--                controls-->
            <!--            ></video>-->
          </div>
        </div>
      </template>

    </r-data-table>

    <v-dialog
        v-model="dialog"
        :overlay-opacity="0.8"
        width="88%"
        style="position: relative;"
    >

      <v-card color="black" style="padding-top: 80px;padding-bottom: 80px; width: 100%">
        <v-btn
            class="icon"
            color="red"
            dark
            fab
            style="position: absolute; right: 15px; cursor: pointer; z-index: 1"
            x-small
            @click="closeModal()"
        >
          X
        </v-btn>
        <v-carousel v-model="selected_file" hide-delimiter-background hide-delimiters>
          <v-carousel-item
              v-for="(file, i) in files"
              :key="i"
              class="mx-auto"
          >
            <img
                v-if="file && !file.thumbnail_url"
                :alt="file.name"
                :src="file.url"
                style="height: 100%; width: 800px"
            />

            <video
                v-else
                :id="i"
                :src="file.url"
                controls
                style="height: 100%; width: 100%"
            ></video>

          </v-carousel-item>
        </v-carousel>
      </v-card>
    </v-dialog>
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
    files: null,
    dialog: false,
    selected_file: 0,
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
    closeModal() {
      if (this.files[this.selected_file].thumbnail_url) {
        document.getElementById(this.selected_file).pause();
      }
      this.dialog = false
      this.files = null
    },
    showPreview(key, item) {
      this.files = item.files
      this.selected_file = key
      this.dialog = true
    },
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