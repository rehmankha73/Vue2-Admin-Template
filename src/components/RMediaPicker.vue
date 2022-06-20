<template>
  <div>
    <section class="outer">
      <div class="picker"
           @drop="onFileChange"
           @dragover.prevent
      >
        <section class="d-flex justify-space-between my-2 mx-2 pb-4 border-b">
          <v-btn
              v-if="files.length > 0"
              color="primary"
              elevation="2"
              small
              @click="$refs.files.click()"
          >
            +
          </v-btn>
          <h3>Uploaded filed: {{ uploaded_files }}</h3>
          <input ref="files" class="d-none" multiple type="file" @change="onFileChange"/>
        </section>

        <div v-if="files.length > 0" class="mx-2 px-2 d-flex flex-row scroll"
        >
        <span
            v-for="(file, key) in files"
            :key="key"
            class="mx-2 py-2"
            style="position: relative"
            @click="showPreview(key)"
        >
          <img
              :alt="file.name"
              :src="!file.thumbnail_url ? file.url : file.thumbnail_url"
              class="cursor-pointer file-preview"
          />

          <v-icon
              v-if="file.thumbnail_url"
              large
              style="position: absolute;top: 55px; right: 65px; color: white; font-size: 100px; cursor: pointer"
          >
            mdi-play
          </v-icon>

          <v-btn
              class="icon"
              color="red"
              dark
              fab
              x-small
              @click="removeImage(key)"
          >
            X
          </v-btn>
        </span>
        </div>
        <div v-else class="d-flex flex-column justify-center align-center">
          <h1 style="margin-top: 10px;margin-bottom: 10px; color: lightgray">Drags/Paste your files here</h1>
          <v-btn
              color="primary"
              elevation="2"
              small
              @click="$refs.files.click()"
          >
            Add Files
          </v-btn>
        </div>
      </div>

    </section>

    <v-dialog
        v-model="dialog"
        :overlay-opacity="0.8"
        width="88%"
        style="position: relative"
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
export default {
  name: "RMediaPicker",
  data() {
    return {
      dialog: false,
      selected_file: 0,
      uploaded_files: 0,
      files: [],
      removed_files: [],
    }
  },
  props: {
    old_files: {
      type: Array,
      default: () => [],
    }
  },
  watch: {
    files: {
      handler(newVal) {
        this.uploaded_files = newVal.length
        this.$emit('uploadedFiles', this.files)
      }, deep: true,
    },
    removed_files: {
      handler() {
        this.$emit('removedFiles', this.removed_files)
      }, deep: true,
    }
  },
  methods: {
    closeModal() {
      if (this.files[this.selected_file].thumbnail_url) {
        document.getElementById(this.selected_file).pause();
      }
      this.dialog = false
    },
    showPreview(key) {
      console.log(key)
      this.selected_file = key
      this.dialog = true
    },
    async onFileChange(event) {
      event.stopPropagation();
      event.preventDefault();
      let _files =
          event.target.files ||
          event.dataTransfer.files
      this.uploaded_files = _files.length
      for (let i = 0; i < _files.length; i++) {
        const file = {
          file: _files[i],
          url: URL.createObjectURL(_files[i]),
          type: _files[i].type,
          name: _files[i].name,
          size: _files[i].size,
        }

        // if file is video then
        if (file.type.includes("video")) {
          try {
            file.thumbnail = await this.generateThumbnail(_files[i]);
            file.thumbnail_url = URL.createObjectURL(file.thumbnail);
          } catch (e) {
            console.log(e, 'error while creating thumbnail')
          }
        }

        this.files.push(file)
      }
    },


    async generateThumbnail(item) {
      const binaryData = [];
      binaryData.push(item);
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      const video = document.createElement("video");
      let video_url = URL.createObjectURL(new Blob(binaryData))
      video.setAttribute("src", video_url);
      video.load();

      let thumbnail = await new Promise((resolve) => {
        video.onloadedmetadata = async () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          video.currentTime = video.duration / 2;
          await video.play();
          context.drawImage(video, 0, 0);
          video.pause();
          const blob = await new Promise((resolve) => {
            return canvas.toBlob(function (blob) {
              resolve(blob);
            });
          });
          resolve(blob);
        };
      });

      return thumbnail;
    },

    removeImage(index) {
      if (this.old_files && this.old_files.length > 0) {
        this.removed_files.push(this.files[index]);
      }
      this.files.splice(index, 1)
    }
  },
  mounted() {
    if (this.old_files && this.old_files.length > 0) {
      this.files = this.old_files
    }
  }
}
</script>

<style scoped>
.outer {
  padding: 16px;
}

.picker {
  padding-bottom: 10px;
  width: 100%;
  max-height: 320px;
  border: 1px solid lightgray
}

.icon {
  position: absolute;
  right: -10px;
}

.border-b {
  border-bottom: 1px solid lightgray;
}

.scroll {
  overflow-x: scroll
}

.file-preview {
  max-width: 250px;
  height: 200px;
  object-fit: cover;
}

.cursor-pointer {
  cursor: pointer;
}
</style>