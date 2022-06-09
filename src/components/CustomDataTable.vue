<template>
  <v-card>
    <v-card-title class="d-flex align-start">
      <span class="title text-center text-sm-left">
        {{ title }}
      </span>

      <v-spacer/>

      <div class="search-bar">
        <v-text-field
            v-model="search"
            dense
            label="Search"
            placeholder="Search here..."
            solo
        ></v-text-field>
      </div>

      <slot name="additional_actions"/>

      <v-btn
          v-if="can_add_new_item"
          color="primary"
          @click="$emit('AddNewItem')"
      >
        <v-icon class="v-btn__pre-icon" small>mdi-plus</v-icon>
        Add
      </v-btn>

      <v-btn icon style="margin-left: 10px" @click="refreshData">
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </v-card-title>

    <v-card-text>
      <v-data-table
          :footer-props="getFooterOptions"
          :headers="headers"
          :items="items"
          :items-per-page="per_page_items"
          :loading="loading"
          :search="search"
          class="elevation-0"
          item-key="name"
      >
        <template #item="{ item }">
          <tr v-if="$vuetify.breakpoint.smAndUp">
            <td v-for="(head, key) in headers.filter( h => h.value !== 'actions')" :key="key">
              <slot :item="item" :name="head.value">{{ item[head.value] }}</slot>
            </td>

            <td v-if="can_show_item || can_edit_item || can_delete_item" class="d-flex">
              <slot :item="item" name="actions">
                <v-icon
                    v-if="can_show_item"
                    class="mr-2"
                    color="blue"
                    small
                    @click="$emit('showItem', item)"
                >
                  mdi-eye
                </v-icon>

                <v-icon
                    v-if="can_edit_item"
                    class="mr-2"
                    color="green"
                    small
                    @click="$emit('editItem', item)"
                >
                  mdi-pencil
                </v-icon>

                <v-icon
                    v-if="can_delete_item"
                    color="red"
                    small
                    @click="deleteItem(item)"
                >
                  mdi-delete
                </v-icon>
              </slot>
            </td>
          </tr>

          <tr v-else class="v-data-table__mobile-table-row">
            <td v-for="(head, key) in headers.filter(h => h.value !== 'actions')" :key="key"
                class="v-data-table__mobile-row">
                <span class="v-data-table__mobile-row__header">
                  {{ head.text }}
                </span>

              <slot :item="item" :name="head.value" class="v-data-table__mobile-row__cell">
                {{ item[head.value] }}
              </slot>
            </td>

            <td v-if="can_show_item || can_edit_item || can_delete_item" class="v-data-table__mobile-row">
                <span class="v-data-table__mobile-row__header">
                  Actions
                </span>

              <div>
                <slot :item="item" name="actions">
                  <v-icon
                      v-if="can_show_item"
                      class="mr-2"
                      color="blue"
                      small
                      @click="$emit('showItem', item)"
                  >
                    mdi-eye
                  </v-icon>

                  <v-icon
                      v-if="can_edit_item"
                      class="mr-2"
                      color="green"
                      small
                      @click="$emit('editItem', item)"
                  >
                    mdi-pencil
                  </v-icon>

                  <v-icon
                      v-if="can_delete_item"
                      color="red"
                      small
                      @click="deleteItem(item)"
                  >
                    mdi-delete
                  </v-icon>
                </slot>
              </div>
            </td>
          </tr>
        </template>

      </v-data-table>
    </v-card-text>

  </v-card>
</template>

<script>

export default {
  props: {
    title: {
      type: String,
      required: true,
    },

    per_page_items: {
      type: Number,
      default: 5,
    },

    show_footer_option: {
      type: Boolean,
      default: false,
    },

    can_add_new_item: {
      type: Boolean,
      default: false,
    },

    can_show_item: {
      type: Boolean,
      default: false,
    },

    can_edit_item: {
      type: Boolean,
      default: false,
    },

    can_delete_item: {
      type: Boolean,
      default: false,
    },

    headers: {
      type: Array,
      default: () => {
      },
    },

    getDataFunction: {
      type: Function,
      default: () => {
      },
    },

    // editHandler: {
    //   type: Function,
    //   default: () => {},
    // },
    //
    // deleteHandler: {
    //   type: Function,
    //   default: () => {},
    // },
    //
    // showHandler: {
    //   type: Function,
    //   default: () => {},
    // },
  },

  data() {
    return {
      loading: false,
      search: '',
      calories: '',
      items: [],
    }
  },

  computed: {
    getFooterOptions() {
      return {
        showFirstLastPage: true,
      }
    }
  },
  async mounted() {
    this.checkActionsInHeader();
    await this.loadData();
  },
  methods: {
    checkActionsInHeader() {
      const arr = this.headers.filter(h => h.value === 'actions')
      if (arr.length < 1) {
        this.headers.push({
          text: 'Actions',
          value: 'actions',
          sortable: false,
        });
      }
    },

    deleteItem(item) {
      console.log(item)
      if (confirm('Are you sure!')) {
        this.items.splice(this.items.indexOf(item), 1)
        this.$emit('deleteItem', item)
      }
    },

    async loadData() {
      this.loading = true;

      this.items = await this.getDataFunction();

      this.loading = false;
    },

    async refreshData() {
      this.loading = true;

      this.items = await this.getDataFunction();

      this.loading = false;
    },
  },
}
</script>
<style scoped>
.title {
  font-size: 20px;
  font-weight: bold
}

.search-bar {
  width: 400px;
  margin-right: 20px;
}
</style>

<style lang="sass" scoped>
.data-table
  &__header
    font-size: 25px
    font-family: google-sans, sans-serif
</style>