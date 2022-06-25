<template>
  <div>
    <v-app-bar app color="primary" dark elevate-on-scroll>
      <v-app-bar-nav-icon @click="drawer = !drawer"/>

      <v-card-title>School Management System!</v-card-title>
      <v-spacer/>

      <profile-popup/>
    </v-app-bar>
    <v-main class="main-bg">
      <v-container>
        <router-view/>
      </v-container>
    </v-main>
    <v-navigation-drawer v-model="drawer" app>
      <img alt="logo" class="logo" height="70" src="../assets/logo.png"/>
      <v-divider/>
      <template v-for="(route, key) in routes">
        <v-list-item
            v-if="route.isVisible"
            :key="key"
            :to="route.to"
            active-class="route--active"
            class="route"
            color="#da57a7"
            dense
            exact
        >
          <v-list-item-icon>
            <v-icon v-text="route.icon"/>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title v-text="route.title"/>
          </v-list-item-content>
        </v-list-item>
        <v-divider v-else-if="route.isDivider" :key="key" style="margin: 10px 20px"/>
      </template>
    </v-navigation-drawer>
  </div>
</template>

<script>
import ProfilePopup from "./ProfilePopup";
import {getUser} from "@/utils/local";
import {required} from "@/utils/validators";

export default {
  name: 'Dashboard',
  components: {ProfilePopup},
  data: () => ({
    drawer: true,
    user: {},
    developMode: false,
    developModeDialog: false,
    message: null,
    developModeData: null,
    loading: false,
  }),
  methods: {
    getUser,
    required,
  },
  computed: {
    routes() {
      return [
        {
          to: '/',
          title: 'Dashboard',
          icon: 'mdi-view-dashboard-variant',
          isVisible: true
        },
        {
          to: '/users',
          title: 'Users',
          icon: 'mdi-account-group',
          isVisible: true
        },
        {isDivider: true},
        {
          to: '/classes',
          title: 'Classes',
          icon: 'mdi-book',
          isVisible: true
        },
        {
          to: '/students',
          title: 'Students',
          icon: 'mdi-account-school',
          isVisible: true
        },
        {
          to: '/teachers',
          title: 'Teachers',
          icon: 'mdi-account-tie',
          isVisible: true
        },
        {isDivider: true},
        {
          to: '/user-profile',
          title: 'Profile Settings',
          icon: 'mdi-account-cog',
          isVisible: true
        },
        {
          to: '/media',
          title: 'Media',
          icon: 'mdi-image-multiple',
          isVisible: true
        },
      ];
    }
  },

};
</script>

<style lang="sass" scoped>
.logo
  display: block
  margin: 5px auto
  border-radius: 10px

.route
  margin: 5px
  text-align: left
  overflow: hidden
  border-radius: 4px
  font-size: 20px !important
  font-family: "Roboto", sans-serif

  i
    font-size: 20px

  &--active i
    color: inherit

  &--active
    color: #495db7

.main-bg
  background: linear-gradient(to bottom, #1976d2 300px, white 300px)
</style>
