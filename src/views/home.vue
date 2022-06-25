<template>
  <div>
    <div class="dashboard-cards">
      <stat-card :loading="gamesLoading" color="secondary" filter title="Card 1" value="Notification"/>
      <stat-card :loading="loading" color="purple" title="Card 2"
                 value="User"/>
      <stat-card :loading="loading" color="green" title="Card 3" value="Recently Logged in User"/>
      <stat-card :loading="loading" color="pink" title="Card 4" value="New Notification"/>
    </div>

    <v-btn class="mt-10" @click="notifyMe">
      Click me to notify
    </v-btn>

  </div>
</template>

<script>

import StatCard from "@/components/dashboard/StatCard";
import {DashboardService} from "@/services/dashboard-service";

export default {
  name: 'Home',
  components: {StatCard},
  data: () => ({
    loading: false,
    gamesLoading: false,
    loadingDialog: false,
    dashboardCards: {},
    service: new DashboardService(),
  }),
  methods: {
    notifyMe() {
      if (Notification.permission !== "granted")
        Notification.requestPermission();
      else {
        let notification = new Notification('This is a test notifications',
            { body: 'Test', icon: '../assets/logo.png', badge: '../assets/logo.png'},
        );
        notification.onclick = function (event) {
          if(window.location.href === 'http://localhost:8080/') {
            event.preventDefault()
            return;
          }
          event.preventDefault();
          window.open('http://localhost:8080', '_blank')
        }
      }
    }
  }
};
</script>

<style scoped>
.dashboard-cards {
  display: grid;
  grid-template-columns: 1fr;
  grid-row-gap: 10px;
  grid-column-gap: 10px;
  margin-bottom: 30px;
}

.dashboard-graphs {
  display: grid;
  grid-template-columns: 1fr;
  grid-row-gap: 10px;
  grid-column-gap: 10px;
  margin-bottom: 30px;
}

.dashboard-graphs-one {
  display: grid;
  grid-template-columns: 1fr;
  grid-row-gap: 10px;
  grid-column-gap: 10px;
  margin-bottom: 30px;
}

@media screen and (min-width: 580px) {
  .dashboard-cards {
    grid-template-columns: 1fr 1fr;
  }

  .dashboard-graphs {
    grid-template-columns: 1fr 1fr;
  }

  .dashboard-graphs-one {
    grid-template-columns: 1fr 1fr;
  }
}

@media screen and (min-width: 1000px) {
  .dashboard-cards {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }

  .dashboard-graphs {
    grid-template-columns: 1fr 2fr;
  }

  /*.dashboard-graphs-one {*/
  /*  grid-template-columns: 2fr 1fr;*/
  /*}*/
}

</style>
