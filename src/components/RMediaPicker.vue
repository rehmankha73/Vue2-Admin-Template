<template>
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
        >
          <img
              :alt="file.name"
              :src="file.url"
              class="image-preview"
          />

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
</template>

<script>
export default {
  name: "RMediaPicker",
  data() {
    return {
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
    onFileChange(event) {
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
          name: _files[i].name,
          size: _files[i].size,
        }
        this.files.push(file)
      }
    },

    removeImage(index) {
      if(this.old_files && this.old_files.length > 0) {
        this.removed_files.push(this.files[index]);
      }
      this.files.splice(index, 1)
    }
  },
  mounted() {
    if(this.old_files && this.old_files.length > 0) {
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
  width: 100%;
  height: 220px;
  border: 1px solid lightgray
}

.icon {
  position: absolute; right: -10px;
}

.border-b {
  border-bottom: 1px solid lightgray;
}

.scroll {
  overflow-x: scroll
}

.image-preview {
  max-width: 200px;
  height: 100px;
  object-fit: cover;
}
</style>