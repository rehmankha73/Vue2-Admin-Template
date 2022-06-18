<template>
  <div>
    <v-card :loading="dataLoading" class="mx-auto pa-6" max-width="800">
      <v-card-title style="color: blue;">Teacher Details</v-card-title>

      <v-col v-if="teacher.image" class="d-flex">
        <v-card-text>
          <v-img
              :src="teacher.image"
              style="height:200px; width:200px; object-fit: contain"
          >
          </v-img>
        </v-card-text>
      </v-col>

      <v-col class="d-flex py-0">
        <v-card-text><b>Name:</b>{{ teacher.name }}</v-card-text>
        <v-card-text><b>Subject:</b>{{ teacher.subject }}</v-card-text>
      </v-col>

      <v-col class="d-flex py-0">
        <v-card-text><b>Email:</b>{{ teacher.email }}</v-card-text>
        <v-card-text><b>Phone#:</b>{{ teacher.phone }}</v-card-text>
      </v-col>

      <v-col class="d-flex py-0">
        <v-card-text><b>Address:</b>{{ teacher.address }}</v-card-text>
      </v-col>

      <v-col class="d-flex py-0">
        <v-card-text><b>Status:</b>{{ teacher.is_working ? 'Working' : 'Have Left' }}</v-card-text>
        <v-card-text><b>Joining Date:</b>{{ teacher.date_of_joining }}</v-card-text>
        <v-card-text v-if="!teacher.is_working"><b>Leaving Date:</b>{{ teacher.date_of_leaving }}</v-card-text>
      </v-col>

    </v-card>
  </div>
</template>
<script>

import {TeachersService} from "@/services/teachers-service";
import {showToast} from "@/assets/toast";

export default {
  data() {
    return {
      dataLoading: true,
      teacher: {},
      teachers_service: new TeachersService(),
    }
  },
  methods: {
    async loadData() {
      try {
        this.dataLoading = true
        this.teacher = await this.teachers_service.fetchOne(this.$route.query.id);
      } catch (e) {
        showToast('error', e)
      }
      this.dataLoading = false

    }
  },
  mounted() {
    this.loadData()
  }
}
</script>