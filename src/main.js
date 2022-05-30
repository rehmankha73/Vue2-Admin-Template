import Vue from 'vue';
import App from './App.vue';
import vuetify from './plugins/vuetify';
import router from './router';
import axios from "axios";
Vue.config.productionTip = false;
import './assets/style.sass';
import vueFilePond from "vue-filepond";
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";

// Create component
const FilePond = vueFilePond(
    FilePondPluginFileValidateType,
    FilePondPluginImagePreview
);


Vue.prototype.$axios = axios
axios.defaults.baseURL = 'http://127.0.0.1:8000/api/'
// axios.defaults.baseURL = ''

axios.interceptors.request.use(
    config => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.common["Authorization"] = token;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);
axios.interceptors.response.use(
    response => {
        if (response.status === 200 || response.status === 201) {
            return Promise.resolve(response);
        } else {
            return Promise.reject(response);
        }
    },
    error => {
        if (error.response.status) {
            switch (error.response.status) {
                case 401:
                    localStorage.removeItem('auth_token')
                    localStorage.removeItem('auth_user')

                    break;
            }
            return Promise.reject(error.response);
        }
    }
);


new Vue({
    vuetify,
    router,
    FilePond,
    render: (h) => h(App)
}).$mount('#app');
