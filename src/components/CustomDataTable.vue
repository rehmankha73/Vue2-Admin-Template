<template>
  <v-card>
    <v-card-title class="d-flex align-start">
      <span class="title">
        {{ title }}
      </span>

      <v-spacer/>

      <div class="search-bar">
        <v-text-field
            v-model="search"
            label="Search"
            placeholder="Search here..."
            solo
            dense
        ></v-text-field>
      </div>

      <v-btn
          v-if="can_add_new_item"
          color="primary"
          @click="$emit('AddNewItem')"
      >
        <v-icon class="v-btn__pre-icon" small>mdi-plus</v-icon>
        Add
      </v-btn>

      <v-btn @click="refreshData" icon style="margin-left: 10px">
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </v-card-title>

    <v-card-text>
      <v-data-table
          :headers="headers"
          :items="items"
          :items-per-page="per_page_items"
          :search="search"
          :loading="loading"
          :footer-props="getFooterOptions"
          item-key="name"
          class="elevation-0"
      >
        <template #item="{ item }">
          <tr>
            <td v-for="(head, key) in headers.filter( h => h.value !== 'actions')" :key="key">
              <slot :name="head.value" :item="item">{{ item[head.value] }}</slot>
            </td>

            <td class="d-flex text-center" v-if="can_show_item || can_edit_item || can_delete_item">
              <slot name="actions" :item="item">
                <v-icon
                    v-if="can_show_item"
                    color="blue"
                    small
                    class="mr-2"
                    @click="$emit('showItem', item)"
                >
                  mdi-eye
                </v-icon>

                <v-icon
                    v-if="can_edit_item"
                    color="green"
                    small
                    class="mr-2"
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
      default: () => {},
    },

    getDataFunction: {
      type: Function,
      default: () => {},
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
      desserts: [
        {
          name: 'Frozen Yogurt',
          calories: 159,
          fat: 6.0,
          carbs: 24,
          protein: 4.0,
          iron: '1%',
        },
        {
          name: 'Ice cream sandwich',
          calories: 237,
          fat: 9.0,
          carbs: 37,
          protein: 4.3,
          iron: '1%',
        },
        {
          name: 'Eclair',
          calories: 262,
          fat: 16.0,
          carbs: 23,
          protein: 6.0,
          iron: '7%',
        },
        {
          name: 'Cupcake',
          calories: 305,
          fat: 3.7,
          carbs: 67,
          protein: 4.3,
          iron: '8%',
        },
        {
          name: 'Gingerbread',
          calories: 356,
          fat: 16.0,
          carbs: 49,
          protein: 3.9,
          iron: '16%',
        },
        {
          name: 'Jelly bean',
          calories: 375,
          fat: 0.0,
          carbs: 94,
          protein: 0.0,
          iron: '0%',
        },
        {
          name: 'Lollipop',
          calories: 392,
          fat: 0.2,
          carbs: 98,
          protein: 0,
          iron: '2%',
        },
        {
          name: 'Honeycomb',
          calories: 408,
          fat: 3.2,
          carbs: 87,
          protein: 6.5,
          iron: '45%',
        },
        {
          name: 'Donut',
          calories: 452,
          fat: 25.0,
          carbs: 51,
          protein: 4.9,
          iron: '22%',
        },
        {
          name: 'KitKat',
          calories: 518,
          fat: 26.0,
          carbs: 65,
          protein: 7,
          iron: '6%',
        },
      ],
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
      if(arr.length < 1) {
        this.headers.push({
          text: 'Actions',
          value: 'actions',
          sortable: false,
        });
      }
    },

    deleteItem(item) {
      console.log(item)
      if(confirm('Are you sure!')) {
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

.search-bar{
  width:400px;
  margin-right: 20px;
}
</style>

<style lang="sass" scoped>
.data-table
  &__header
    font-size: 25px
    font-family: google-sans, sans-serif
</style>