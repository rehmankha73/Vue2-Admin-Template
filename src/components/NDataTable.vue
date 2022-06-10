<template>
  <v-card>
    <br>
    <v-card-title :class="$vuetify.breakpoint.smAndDown ? 'd-flex flex-column' : ''">
      <span :class="$vuetify.breakpoint.smAndDown ? 'data-table__header mb-2' : 'data-table__header'"
      >{{ title }}</span>
      <v-spacer/>

      <div
          :style="$vuetify.breakpoint.smAndDown ? 'width: 400px; max-width: 100%; margin-bottom: 10px' : 'width: 400px; margin-right: 20px; max-width: 100%'">
        <v-text-field
            v-model="search"
            solo
            label="Search anything..."
            dense
            hide-details
        />
      </div>
      <slot name="primary-action"/>
      <v-btn
          v-if="allowAdd && !$vuetify.breakpoint.smAndDown"
          color="primary"
          elevation="0"
          @click="$emit('add-new')"
      >
        <v-icon class="v-btn__pre-icon" small>mdi-plus</v-icon>&nbsp; Add New
      </v-btn>
      <v-btn
          v-else-if="allowAdd"
          color="primary"
          elevation="0"
          width="100%"
          class="mb-2"
          @click="$emit('add-new')"
      >
        <v-icon class="v-btn__pre-icon" small>mdi-plus</v-icon>&nbsp; Add New
      </v-btn>

      <v-btn v-if="!$vuetify.breakpoint.smAndDown" id="refresh" class="refresh" icon style="margin-left: 15px"
             @click="loadData">
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
      <v-btn v-else outlined id="refresh" class="refresh" color="primary" elevation="0" width="100%" @click="loadData">
        <v-icon small class="mr-2">mdi-refresh</v-icon>
        Reload
      </v-btn>

      <v-btn v-if="allowFilters" icon style="margin-left: 10px">
        <v-icon @click="$emit('filter')">mdi-filter</v-icon>
      </v-btn>
    </v-card-title>

    <v-data-table
        :loading="loading"
        :items="items"
        :headers="headersValue"
        :search="search"
        height="calc(100vh - 270px)"
    >
      <template v-slot:item="{ item }">
        <tr v-if="$vuetify.breakpoint.smAndUp">
          <td
              v-for="(elem, key) of headers.filter(h => h.value !== 'actions')"
              :key="key"
              :class="`text-${elem.align === 'right' ? 'end' : 'start'}`"
          >
            <slot :name="elem.value" :item="item">{{ item[elem.value] }} {{ elem }}</slot>
          </td>

          <td
              v-if="viewHandler || editHandler || deleteHandler"
              class="text-end"
          >
            <slot name="extra-actions" :item="item"/>

            <v-icon v-if="viewHandler" small @click="viewHandler(item)">
              mdi-eye
            </v-icon>
            <v-icon
                v-if="editHandler"
                small
                @click="editHandler(item)"
                color="green"
            >
              mdi-pencil
            </v-icon>
            <v-icon
                v-if="deleteHandler"
                small
                @click="onDelete(item)"
                color="red"
            >
              mdi-delete
            </v-icon>
          </td>
        </tr>
        <tr v-else class="v-data-table__mobile-table-row">
          <td
              v-for="(elem, key) of headers.filter(h => h.value !== 'actions')"
              :key="key"
              :class="`v-data-table__mobile-row text-${elem.align === 'right' ? 'end' : 'start'}`"
          >
            <div class="v-data-table__mobile-row__header">{{ elem.text }}</div>
            <slot class="v-data-table__mobile-row__cell" :name="elem.value" :item="item">{{ item[elem.value] }}</slot>
          </td>

          <td
              v-if="viewHandler || editHandler || deleteHandler"
              class="v-data-table__mobile-row text-end" style="text-align: right"
          >
            <div class="v-data-table__mobile-row__header">Action</div>
            <div class="v-data-table__mobile-row__cell">
              <slot name="extra-actions" :item="item"/>

              <v-icon v-if="viewHandler" small @click="viewHandler(item)">
                mdi-eye
              </v-icon>
              <v-icon
                  v-if="editHandler"
                  small
                  color="green"
                  @click="editHandler(item)"
              >
                mdi-pencil
              </v-icon>
              <v-icon
                  v-if="deleteHandler"
                  small
                  color="red"
                  @click="onDelete(item)"
              >
                mdi-delete
              </v-icon>
            </div>
          </td>
        </tr>
      </template>
    </v-data-table>

    <error-dialog v-model="error" :error="errorValue"/>
  </v-card>
</template>

<script>
import ErrorDialog from './ErrorDialog';

export default {
  name: 'DataTable',
  components: {ErrorDialog},
  props: {
    allowAdd: {
      type: Boolean,
      default: true
    },

    allowFilters: {
      type: Boolean,
      default: false
    },

    title: {
      type: String,
      default: null
    },

    loader: {
      type: Function,
      required: true
    },

    headers: {
      type: Array,
      required: true
    },

    editHandler: {
      type: Function,
      default: null
    },

    viewHandler: {
      type: Function,
      default: null
    },

    deleteHandler: {
      type: Function,
      default: null
    },
    deleteMessage: {
      type: String,
      default: 'This item will be deleted. Are you sure?'
    }
  },

  emits: ['add-new'],

  mounted() {
    const arr = this.headers.filter(h => h.value === 'actions')
    this.headersValue = [...this.headers];
    if (arr.length < 1 && (this.editHandler || this.deleteHandler || this.viewHandler)) {
      this.headersValue.push({
        text: 'Actions',
        align: 'right',
        search: false,
        sortable: false
      });
    }

    this.loadData();
  },

  data: () => ({
    search: '',
    items: [],
    error: false,
    loading: false,
    errorValue: {},
    headersValue: []
  }),

  methods: {
    async loadData() {
      this.loading = true;
      try {
        this.items = await this.loader();
        this.loading = false;
      } catch (e) {
        this.loading = false;
        this.errorValue = {
          title: 'Error while loading data',
          description: e?.response?.data?.error ?? 'Some Error occurred'
        }
        this.error = true;
      }
    },

    async onDelete(item) {
      if (confirm(this.deleteMessage)) {
        try {
          this.loading = true;
          await this.deleteHandler(item);
          this.loading = false;
          this.items.splice(this.items.indexOf(item), 1);
        } catch (e) {
          window.console.log(e);
        }
      }
    },

    // performAction(callback) {
    //   return callback({
    //     changeLoadingStatus: (status) => (this.loading = status)
    //   });
    // }
  }
};
</script>

<style lang="sass" scoped>
.data-table

  &__header
    font-size: 25px
    font-family: google-sans, sans-serif
</style>