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
        beforeEnter: async (to, from, next) => {
            await router.push({name: 'Library'});
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
                store.commit('popupShow',{
                    type: 'error',
                    message: 'Выйдите из аккаунта чтобы авторизироваться'
                });
                router.go(-1);
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
                store.commit('popupShow',{
                    type: 'error',
                    message: 'Выйдите из аккаунта чтобы зарегистрироваться'
                });
                router.go(-1);
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
        path: '/materials/public',
        name: 'Library',
        // beforeEnter: (to, from, next) => {},
        component: function () {
            return import('../views/Library')
        },
        meta: {
            title: 'Мои наборы'
        }
    },
    {
        path: '/editor/set/:id?',
        name: 'EditorSet',
        props: true,
        beforeEnter: (to, from, next) => {
            if (!store.state.userLoggedIn) {
                store.commit('popupShow',{
                    type: 'info',
                    message: 'Для доступа к разделу необходимо войти в аккаунт'
                });
                next("/login");
            } else {
                next();
            }
        },
        component: function () {
            return import('../views/EditorSet')
        },
        meta: {
            title: 'Конструктор наборов'
        }
    },
    {
        path: '/editor/collection/:id?',
        name: 'EditorCollection',
        props: true,
        beforeEnter: (to, from, next) => {
            if (!store.state.userLoggedIn) {
                store.commit('popupShow',{
                    type: 'info',
                    message: 'Для доступа к разделу необходимо войти в аккаунт'
                });
                next("/login");
            } else {
                next();
            }
        },
        component: function () {
            return import('../views/EditorCollection')
        },
        meta: {
            title: 'Конструктор коллекций'
        }
    },
    {
        path: '/editor',
        name: 'Editor',
        beforeEnter: (to, from, next) => {
            if (!store.state.userLoggedIn) {
                store.commit('popupShow',{
                    type: 'info',
                    message: 'Для доступа к разделу необходимо войти в аккаунт'
                });
                next("/login");
            } else {
                next();
            }
        },
        component: function () {
            return import('../views/Editor')
        },
        meta: {
            title: 'Конструктор материалов'
        }
    },
    {
        path: '/materials/personal',
        name: 'MyMaterials',
        beforeEnter: (to, from, next) => {
            if (!store.state.userLoggedIn) {
                store.commit('popupShow',{
                    type: 'info',
                    message: 'Для доступа к разделу необходимо войти в аккаунт'
                });
                next("/login");
            } else {
                next();
            }
        },
        component: function () {
            return import('../views/Materials')
        },
        meta: {
            title: 'Мои материалы'
        }
    },
    {
        path: '/materials/:id',
        name: 'MaterialPage',
        component: function () {
            return import('../views/MaterialPage')
        },
        meta: {
            title: 'Страница материала'
        }
    },
    {
        path: '/materials/collections/:collectionId',
        name: 'Collection',
        component: function () {
            return import('../views/Collection')
        },
        meta: {
            title: 'Коллекция материалов'
        }
    },
    {
        path: '/study/:setId',
        name: 'StudyPage',
        props: true,
        // beforeEnter: (to, from, next) => {
        //     if (!store.state.userLoggedIn) {
        //         store.commit('popupShow',{
        //             type: 'info',
        //             message: 'Для доступа к разделу необходимо войти в аккаунт'
        //         });
        //         next("/login");
        //     } else {
        //         next();
        //     }
        // },
        component: function () {
            return import('../views/Study')
        },
        meta: {
            title: 'Прохождение материала'
        }
    },
    {
        path: '/mystats',
        name: 'MyStats',
        // props: route => ({ setId: route.query.setId}),
        beforeEnter: (to, from, next) => {
            if (!store.state.userLoggedIn) {
                store.commit('popupShow',{
                    type: 'info',
                    message: 'Для доступа к разделу необходимо войти в аккаунт'
                });
                next("/login");
            } else {
                next();
            }
        },
        component: function () {
            return import('../views/Stats')
        },
        meta: {
            title: 'Моя статистика'
        }
    },
    // {
    //     // will match everything
    //     path: '*',
    //     component: {template: "<h1>404</h1>"}
    // }

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
