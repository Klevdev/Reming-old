import { createRouter, createWebHistory } from 'vue-router';
import store from '../store';
import Home from '../views/Home.vue';


const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
        meta: {
            title: 'Главная страница',
            metaTags: [
                {
                    name: 'description',
                    content: 'The home page of our example app.'
                },
                {
                    property: 'og:description',
                    content: 'The home page of our example app.'
                }
            ]
        },
    },
    {
        path: '/about',
        name: 'About',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: function () {
            return import(/* webpackChunkName: "about" */ '../views/About.vue')
        },
        meta: {
            title: 'О приложении'
        }
    },
    {
        path: '/login',
        name: 'Log in',
        beforeEnter: (to, from, next) => {
            if (store.state.userLoggedIn) {
                next("/");
            } else {
                next();
            }
        },
        component: function () {
            return import('../views/Login.vue')
        },
        meta: {
            title: 'Авторизация'
        }
    },
    {
        path: '/signup',
        name: 'Sign up',
        beforeEnter: (to, from, next) => {
            if (store.state.userLoggedIn) {
                next("/");
            } else {
                next();
            }
        },
        component: function () {
            return import('../views/Signup.vue')
        },
        meta: {
            title: 'Регистрация'
        }
    },
    {
        path: '/editor',
        name: 'Editor',
        beforeEnter: (to, from, next) => {
            if (!store.state.userLoggedIn) {
                next("/login");
            } else {
                next();
            }
        },
        component: function () {
            return import('../views/Editor')
        },
        meta: {
            title: 'Создание набора'
        }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    document.title = `${to.meta.title}`;
    next();
});

export default router
