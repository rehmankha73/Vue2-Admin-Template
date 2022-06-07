<template>

  <div class="drop mb-4" @drop="onDrop" @dragover.prevent>

    <input ref="file-input" name="image" style="display: none;" type="file" @change="onChange">
    <div v-if="!(image && image.url)" class="mx-4 cursor-pointer" style="margin-top: 80px"
         @click="$refs['file-input'].click();">
      + Select/Drop Image
    </div>


    <div v-else class="d-flex align-start" style="position: relative" v-bind:class="{ 'image': true }">
      <img :src="image.url" alt="" class="img"/>
      <button class="icon" @click="removeFile">X</button>
    </div>

  </div>
</template>

<script>
export default {
  name: "ImageUpload",
  props: {
    isEdit: {
      type: Boolean,
      default: false,
    },
    image_obj: {
      type: Object,
      default: () => {},
    }
  },

  data() {
    return {
      image: null,
    }
  },

  watch: {
    image: {
      handler(newVal) {
        console.log(newVal, 'file')
        this.$emit('uploadedImage', newVal)
      }, deep: true,
    },

    image_obj(newVal) {
      console.log(newVal, 'old image from  component')
      this.image = newVal;
    }
  },

  // mounted() {
  //   console.log(this.image.url, 'component')
  //   console.log(this.isEdit, 'component')
  //   if (this.isEdit) {
  //     this.image.url = this.image_obj.url;
  //   }
  // },

  methods: {
    // for image storage control
    onDrop: function (e) {
      e.stopPropagation();
      e.preventDefault();
      let files = e.dataTransfer.files;
      this.createFile(files[0]);
    },

    onChange(e) {
      let files = e.target.files;
      this.createFile(files[0]);
    },

    createFile(file) {
      this.image = {
        file: file,
        url: URL.createObjectURL(file),
        name: file.name,
        type: file.type,
        size: file.size
      };

      // let reader = new FileReader();
      // this.image = file;
      // let vm = this;
      //
      // reader.readAsDataURL(file);
      //
      // reader.onload = function (e) {
      //   vm.image = e.target.result;
      // }
    },

    removeFile() {
      this.image = '';
    },
  }
}
</script>

<style scoped>
p {
  font-weight: bold;
  text-align: left;
}

.icon {
  position: absolute;
  color: red;
  top: 0;
  right: 5px;
}

html, body {
  height: 100%;
  text-align: center;
}

.btn {
  background-color: #d3394c;
  border: 0;
  color: #fff;
  cursor: pointer;
  display: inline-block;
  font-weight: bold;
  padding: 15px 35px;
  position: relative;
}

.btn:hover {
  background-color: #722040;
}

input[type="file"] {
  position: absolute;
  opacity: 0;
  z-index: -1;
}

.align-center {
  text-align: center;
}

.helper {
  height: 100%;
  display: inline-block;
  vertical-align: middle;
  width: 0;
}

.hidden {
  display: none !important;
}

.hidden.image {
  display: inline-block !important;
}

.display-inline {
  display: inline-block;
  vertical-align: middle;
}

.img {
  border: 1px solid #f6f6f6;
  display: inline-block;
  height: 200px;
  width: 200px;
  margin-left: -2px;
  margin-top: -2px;
  object-fit: contain;
}

.drop {
  background-color: #f2f2f2;
  border: 2px dashed #ccc;
  border-radius: 2px;
  height: 200px;
  width: 200px;
}

.cursor-pointer {
  cursor: pointer;
}

</style>