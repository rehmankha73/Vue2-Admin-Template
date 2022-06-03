import Vue from 'vue';
import VueRouter from 'vue-router';
import SignInView from './views/auth/SignIn';
import NotFound from './views/404.vue';
import Dashboard from './components/Dashboard';
import Home from './views/home.vue'

import {usersRouter} from './views/users/router';
import {classesRouter} from "@/views/classes/router";
import {studentsRouter} from "@/views/students/router";
import {teachersRouter} from "@/views/teachers/router";


Vue.use(VueRouter);

const routes = [
    {
        path: '/',
        component: Dashboard,
        children: [
            {
                path: '/',
                component: Home
            },
            ...usersRouter,
            ...studentsRouter,
            ...classesRouter,
            ...teachersRouter,
        ]
    },
    {
        name: 'SignIn',
        path: '/auth/sign-in',
        component: SignInView
    },
    {
        name: 'NotFound',
        path: '**',
        component: NotFound
    }
];

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
});

router.beforeEach((to, __, next) => {
    if (!localStorage.getItem('auth_token')) {
        if (to.path !== '/auth/sign-in') {
            next('/auth/sign-in');
        }
    }

    next();
});

export default router;
