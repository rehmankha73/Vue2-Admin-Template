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
                size="15"
                indeterminate
                color="white"
            ></v-progress-circular>
            Upload Files
          </v-btn>
        </div>
      </v-card-title>

      <RMediaPicker
          @uploadedFiles="getFiles"
      />
    </v-card>
  </div>
</template>

<script>
import RMediaPicker from "@/components/RMediaPicker";
import { MediaService } from "@/services/media-service";
import {getDownloadURL, getStorage, ref, uploadBytes} from "firebase/storage";
import {showToast} from "@/assets/toast";

export default {
  name: "Media",
  components: {
    RMediaPicker
  },
  data() {
    return {
      files: [],
      uploaded_files: [],
      loading: false,
      media_service: new MediaService(),
    }
  },
  methods: {
    getFiles(_files) {
      console.log(_files,'files')
      this.files = _files
    },

    async uploadFiles() {
      if(this.files.length > 0) {
        this.loading = true
        const storage = getStorage();
        console.log(this.files, 'array')
        let _id = this.getRandomId()

        for(let i = 0; i < this.files.length; i++) {
          const storageRef = ref(storage, _id+'_'+this.files[i].name);

          await uploadBytes(storageRef, this.files[i]).then(async (snapshot) => {
            console.log(snapshot, 'snapshot')

            await getDownloadURL(storageRef)
                .then((url) => {
                  console.log(url, 'url')
                  this.uploaded_files.push(url)
                })
                .catch((error) => {
                  showToast( 'error', error)
                });

          }).catch(e => {
            showToast( 'error', e)
          });
        }
        console.log(this.uploaded_files, 'urls in array')
        const _data = {
          files: this.uploaded_files
        }
        await this.media_service.create(_data, _id);
        this.loading = false
        showToast( 'success', this.uploaded_files.length + ' file(s) has been uploaded successfully!')
        this.uploaded_files = []
      } else {
        showToast( 'error', 'Please add at least one file to upload!')
      }
    },

    getRandomId() {
      return Math.random().toString(36).substr(2, 9);
    }
  }
}
</script>

<style scoped>

</style>