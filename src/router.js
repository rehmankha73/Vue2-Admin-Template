import Vue from 'vue';
import VueRouter from 'vue-router';
import NotFound from './views/404.vue';
import Dashboard from './components/Dashboard';
import Home from './views/home.vue'
import UserProfile from "@/views/settings/UserProfile";

import {usersRouter} from './views/users/router';
import {classesRouter} from "@/views/classes/router";
import {studentsRouter} from "@/views/students/router";
import {teachersRouter} from "@/views/teachers/router";
import {authRouter} from "@/views/auth/router";


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
            {
                path: 'user-profile',
                name: 'UserProfile',
                component: UserProfile,
            },
            ...usersRouter,
            ...studentsRouter,
            ...classesRouter,
            ...teachersRouter,
        ]
    },
    ...authRouter,
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

const allow_routes = [
    '/auth/sign-up',
];

router.beforeEach((to, __, next) => {

    if (!localStorage.getItem('auth_token') && !localStorage.getItem('auth_user')) {

        if (allow_routes.includes(to.path)) {
            let move_to = '';

            move_to = allow_routes.filter((r) => {
                return r.path === to.path;
            })
            next(move_to)
        }

        if (to.path !== '/auth/sign-in' && !allow_routes.includes(to.path)) {
            next('/auth/sign-in')
        }
    }
    next();
});

export default router;