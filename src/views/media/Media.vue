<template>
  <div>
    <v-card>
      <v-overlay :value="loading">
        <v-progress-circular
            indeterminate
            size="64"
        ></v-progress-circular>
      </v-overlay>

      <div style="padding:20px 20px 10px 20px">
        <div class="d-flex flex-row justify-space-between">
          <h4>Multiple Media Picker with horizontal scrollbar</h4>
          <v-btn
              :disabled="loading"
              class="ml-4"
              color="primary"
              elevation="2"
              small
              @click="submitFiles"
          >
            <v-progress-circular
                v-if="loading"
                class="mr-2"
                color="white"
                indeterminate
                size="15"
            ></v-progress-circular>
            {{ isEdit ? 'Update & upload files' : 'Upload Files' }}
          </v-btn>
        </div>

        <span v-if="isEdit" class="">
          <v-icon color="yellow">
            mdi-alert
          </v-icon>
          Note: Please make sure to press update button to save changes!
        </span>
      </div>

      <RMediaPicker
          v-if="isEdit ? (!!old_files) : true "
          :formErrors="formErrors"
          :hasError="hasError"
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
      hasError: false,
      formErrors: null,
      stored_files: null,
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
    },

    getRemovedFiles(_files) {
      this.removed_files = _files
    },

    async loadData() {
      if (!this.$route.query.id) return;
      this.isEdit = true;
      this.loading = true;
      const _data = await this.media_service.fetchOne(this.$route.query.id);
      this.old_files = _data.files
      this.uploaded_files = this.old_files
      this.stored_files = this.old_files.map((f) => {
        f.is_uploaded = true
        return f
      })
      this.loading = false;
    },

    async submitFiles() {
      this.loading = true
      if (this.files.length > 0) {

        if (this.isEdit) {
          // logic for updating
          this.uploaded_files = await this.getUploadedFilesData(this.files);
          let _payload = {files: this.uploaded_files}
          await this.media_service.update(_payload, this.$route.query.id);

          // logic for deleting
          if (this.removed_files.length > 0) {
            for (let i = 0; i < this.removed_files.length; i++) {
              if (this.removed_files[i].thumbnail_url) {
                await this.deleteImageFromFirebase(this.removed_files[i].thumbnail_url)
              }
              await this.deleteImageFromFirebase(this.removed_files[i].url)
            }
          }

          showToast('success', 'File(s) has been updated successfully!')
        } else {
          this.uploaded_files = await this.getUploadedFilesData(this.files);
          let _payload = {files: this.uploaded_files}
          await this.media_service.create(_payload, this.getRandomId());
          showToast('success', this.uploaded_files.length + ' file(s) has been uploaded/updated successfully!')
        }

        this.loading = false
        this.uploaded_files = []
        await this.$router.push('/media')

      } else {
        this.hasError = true
        this.formErrors = 'Please add at least one file to upload!'
        showToast('error', 'Please add at least one file to upload!')
        this.loading = false;
      }

    },

    async getUploadedFilesData(files) {
      let _data = [];
      for (let i = 0; i < files.length; i++) {
        let item = await this.uploadFile(!files[i].thumbnail_url ? 'image' : 'video', files[i])
        _data.push(item)
      }
      return _data
    },

    async uploadFile(fileType, file) {
      if (fileType === 'image') {
        if (!file.is_uploaded) {
          // storing image and returning stored_url to store it in database
          try {
            const storageRef = ref(getStorage(), file.name + '_' + this.getCurrentDataTime());
            await uploadBytes(storageRef, file.file);
            let stored_url = await getDownloadURL(storageRef)
            return {url: stored_url, name: file.name}
          } catch (e) {
            showToast('error', "Error while uploading image!")
          }
        }
        return {url: file.url, name: file.name}


      } else {
        if (!file.is_uploaded) {
          // storing video & thumbnail file and returning url, thumbnail_url to store in database
          try {
            // video uploading to storage
            let urlStorageRef = ref(getStorage(), file.name + '_' + this.getCurrentDataTime());
            await uploadBytes(urlStorageRef, file.file);
            let stored_url = await getDownloadURL(urlStorageRef)

            // thumbnail uploading to storage
            let thumbStorageRef = ref(getStorage(), file.name + '_' + this.getCurrentDataTime());
            await uploadBytes(thumbStorageRef, file.thumbnail);
            let stored_thumbnail_url = await getDownloadURL(thumbStorageRef)

            return {name: file.name, url: stored_url, thumbnail_url: stored_thumbnail_url}
          } catch (e) {
            showToast('error', "Error while uploading video!")
          }
        }
        return {name: file.name, url: file.url, thumbnail_url: file.thumbnail_url}
      }
    },

    async deleteImageFromFirebase(file_url) {
      try {
        await deleteObject(ref(getStorage(), file_url))
      } catch (error) {
        showToast('error', error)
      }
    }
    ,

    getCurrentDataTime() {
      let today = new Date();
      return today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds() + '_' + today.getDate() + '_' + (today.getMonth() + 1) + '_' + today.getFullYear();
    }
    ,
    getRandomId() {
      return Math.random().toString(36).substr(2, 9);
    }
    ,
  }
}
</script>

<style scoped>

</style>