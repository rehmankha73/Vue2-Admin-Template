<template>
  <v-card class="form v-card v-sheet theme--light">
    <v-form ref="form">
      <slot name="main"/>
    </v-form>

    <div class="form__actions">

      <slot :context="context" name="actions"/>

      <v-btn
          color="primary"
          type="button"
          @click="submit"
      >
        Submit
      </v-btn>
    </div>
    <loading-dialog v-model="loading" :message="loadingMessage"/>
    <error-dialog v-model="hasError" :message="errors"/>
  </v-card>
</template>

<script>
import LoadingDialog from "@/components/LoadingDialog";
import ErrorDialog from "@/components/ErrorDialog";

export default {
  name: 'RForm',
  components: {
    LoadingDialog,
    ErrorDialog
  },
  props: {
    onSubmit: Function,
    default: null,
  },
  data() {
    return {
      hasError: false,
      errors: {},
      loading: false,
      loadingMessage: '',
      context: {},
    }
  },

  mounted() {
    this.context.validate = this.$refs.form.validate
    this.context.setLoading = this.setLoading
    this.context.changeLoadingMessage = this.changeLoadingMessage
    this.context.errorReport = this.reportError
  },

  methods: {
    setLoading(loading) {
      this.loading = loading
    },

    changeLoadingMessage(message) {
      this.loadingMessage = message
    },

    reportError(error) {
      this.hasError = true
      this.errors = error
    },

    async submit() {
      console.log(this.$refs.form.validate());
      if (this.$refs.form.validate()) {
        console.log('validate')
        this.setLoading(true)
        if (await this.onSubmit(this.context)) {
          this.$refs.form.reset();
          this.$emit('done')
        } else {
          console.log('not validate')
        }
        this.setLoading(false)
      }
    }
  }

}
</script>

<style lang="sass" scoped>
.form
  width: 600px
  padding: 40px
  margin: 50px auto
  border-radius: 8px

  &__body
    display: grid
    max-width: 100%
    grid-column-gap: 20px
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr)

  &__actions
    display: flex
    margin-top: 30px
    justify-content: flex-end
</style>

<style lang="sass">
.span-2
  grid-column: 1 / 3

.form
  &__title
    font-weight: normal !important
    text-align: center !important
    font-size: 27px
    padding-bottom: 20px
    font-family: google-sans, sans-serif
</style>
