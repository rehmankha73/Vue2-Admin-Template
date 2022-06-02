<template>
  <div>
    <v-card :loading="dataLoading" class="mx-auto pa-6" max-width="800">
      <v-card-title style="color: blue;">Class Details</v-card-title>

      <v-col class="d-flex py-0">
        <v-card-text><b>Room #:</b>{{ class_data.room_no }}</v-card-text>
      </v-col>

      <v-col class="d-flex py-0">
        <v-card-text><b>Title:</b>{{ class_data.title }}</v-card-text>
        <v-card-text><b>Section:</b>{{ class_data.section }}</v-card-text>
      </v-col>
    </v-card>
  </div>
</template>
<script>
import {ClassesService} from "@/services/classes-service";

export default {
  data() {
    return {
      dataLoading: true,
      class_data: {},
      classes: new ClassesService(),
    }
  },
  methods: {
    async loadData() {
      try {
        this.dataLoading = true
        this.class_data = await this.classes.fetchOne(this.$route.query.id);
      } catch (e) {
        console.log(e)
      }
      this.dataLoading = false
    }
  },
  mounted() {
    this.loadData()
  }
}
</script>