<template>
  <div>
    <v-card>
      <v-overlay :value="loading">
        <v-progress-circular
            indeterminate
            size="64"
        ></v-progress-circular>
      </v-overlay>

      <v-card-title>

        <div class="d-flex flex-row justify-space-between">
          <h4>Multiple Media Picker with horizontal scrollbar</h4>

          <v-btn
              :disabled="loading"
              class="ml-4"
              color="primary"
              elevation="2"
              small
              @click="uploadFiles"
          >
            <v-progress-circular
                v-if="loading"
                class="mr-2"
                color="white"
                indeterminate
                size="15"
            ></v-progress-circular>
            Upload Files
          </v-btn>
        </div>
      </v-card-title>

      <RMediaPicker
          v-if="isEdit ? (!!old_files) : true "
          :old_files="old_files"
          @removedFiles="getRemovedFiles"
          @uploadedFiles="getFiles"
      />
    </v-card>
  </div>
</template>

<script>
import RMediaPicker from "@/components/RMediaPicker";
import {MediaService} from "@/services/media-service";
import {showToast} from "@/assets/toast";
import {deleteObject, getDownloadURL, getStorage, ref, uploadBytes} from "firebase/storage";

export default {
  name: "Media",
  components: {
    RMediaPicker
  },
  data() {
    return {
      files: [],
      removed_files: [],
      uploaded_files: [],
      old_files: null,
      isEdit: false,
      loading: false,
      media_service: new MediaService(),
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    getFiles(_files) {
      this.files = _files
      console.log(_files, 'from components')
    },

    getRemovedFiles(_files) {
      this.removed_files = _files
      console.log(_files, 'removed file from comp')
    },

    async deleteImageFromFirebase(file_url) {
      try {
        await deleteObject(ref(getStorage(), file_url));
        console.log('File deleted successfully')
      } catch (error) {
        console.log(error, 'error')
      }
    },

    async loadData() {
      if (!this.$route.query.id) return;
      this.isEdit = true;
      this.loading = true;
      const _data = await this.media_service.fetchOne(this.$route.query.id);
      this.old_files = _data.files
      this.loading = false;
    },

    async uploadFiles() {
      this.loading = true

      if (this.isEdit) {
        let _id = this.$route.query.id
        this.uploaded_files = await this.getUploadedFilesData(_id);
        let _payload = {files: this.uploaded_files}
        await this.media_service.update(_payload, _id);


        if (this.removed_files.length > 0) {
          for (let i = 0; i < this.removed_files.length; i++) {
            console.log(this.removed_files[i], 'r_file')
            await this.deleteImageFromFirebase(this.removed_files[i].url)
          }
        }

      } else {
        if (this.files.length > 0) {
          let _id = this.getRandomId();
          this.uploaded_files = await this.getUploadedFilesData(_id);
          let _payload = {files: this.uploaded_files}
          await this.media_service.create(_payload, _id);
        } else {
          showToast('error', 'Please add at least one file to upload!'
          )
        }
      }

      this.loading = false
      showToast('success', this.uploaded_files.length + ' file(s) has been uploaded successfully!')
      this.uploaded_files = []
    },

    async getUploadedFilesData(_id,) {
      let _data = [];
      for (let i = 0; i < this.files.length; i++) {
        const storage = getStorage();
        const storageRef = ref(storage, _id + '_' + this.files[i].name);
        let _url = this.files[i].url;
        if (!_url.startsWith('https')) {
          try {
            await uploadBytes(storageRef, this.files[i].file);
            this.files[i].url = await getDownloadURL(storageRef)
            let obj = {
              url: this.files[i].url,
              name: this.files[i].name,
            }
            _data.push(obj)
          } catch (e) {
            showToast('error', e)
          }
        } else {
          let obj = {
            url: this.files[i].url,
            name: this.files[i].name,
          }
          _data.push(obj)
        }
      }
      return _data
    },

    getRandomId() {
      return Math.random().toString(36).substr(2, 9);
    }
  }
}
</script>

<style scoped>

</style>