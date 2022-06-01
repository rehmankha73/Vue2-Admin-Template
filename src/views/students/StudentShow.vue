<template>
  <div>
    <v-card :loading="dataLoading" class="mx-auto pa-6" max-width="800">
      <v-card-title style="color: blue;">Student Details</v-card-title>

      <v-col v-if="student.image" class="d-flex">
        <v-card-text>
          <v-img
              :src="student.image"
              height="200"
              width="200"
          >
          </v-img>
        </v-card-text>
      </v-col>

      <v-col class="d-flex py-0">
        <v-card-text><b>Roll#:</b>{{ student.roll_no }}</v-card-text>
      </v-col>

      <v-col class="d-flex py-0">
        <v-card-text><b>Name:</b>{{ student.name }}</v-card-text>
        <v-card-text><b>Class:</b> 1-B</v-card-text>
      </v-col>

      <v-col class="d-flex py-0">
        <v-card-text><b>Email:</b>{{ student.email }}</v-card-text>
        <v-card-text><b>Phone#:</b>{{ student.phone }}</v-card-text>
      </v-col>

      <v-col class="d-flex py-0">
        <v-card-text><b>Address:</b>{{ student.address }}</v-card-text>
      </v-col>

    </v-card>
  </div>
</template>
<script>
import {StudentsService} from "@/services/students-service";

export default {
  data() {
    return {
      dataLoading: true,
      student: {},
      service: new StudentsService(),
    }
  },
  methods: {
    async loadData() {
      try {
        this.dataLoading = true
        this.student = await this.service.fetchOne(this.$route.query.id);
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