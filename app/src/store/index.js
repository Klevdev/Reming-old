import { createStore } from "vuex";
import router from "../router";

export default createStore({
    state() {
        return {
            userLoggedIn: false,
            userName: undefined,
            userToken: '',

            formHasError: false,

            popupMessage: null,
            popupType: null,
            popupShow: false,
            popupTimeoutId: null,

            recentMaterials: null,
            favorites: null,
        }
    },
    mutations: {
        popupShow(state, payload) {
            if (state.popupShow) {
                this.commit('popupClose');
            }
            setTimeout(() => {
                state.popupShow = true;
                state.popupMessage = payload.message;
                state.popupType = payload.type;
                state.popupTimeoutId = setTimeout(() => {
                    this.commit('popupClose');
                }, 5000);
            }, 400);
            // state.popupTimeoutId = null; // Я не знаю зачем это здесь было
        },
        popupClose(state) {
            clearTimeout(state.popupTimeoutId);
            state.popupTimeoutId = null;
            state.popupShow = false;
            setTimeout(() => {
                state.popupMessage = null;
                state.popupType = null;
            }, 400);
        },
        userLogIn(state, payload) {
            // payload: {name, token}|false
            let user;
            if (payload) {
                localStorage.setItem('user', JSON.stringify({
                    name: payload.name,
                    token: payload.token
                }));
                user = payload;
            } else {
                if (localStorage.getItem('user') === null) return;
                user = JSON.parse(localStorage.getItem('user'));
            }

            state.userLoggedIn = true;
            state.userToken = user.token;
            state.userName = user.name;

            this.commit('popupShow',{
                type: 'success',
                message: `Добро пожаловать, ${state.userName}`
            });
        },
        userLogOut(state) {
            localStorage.removeItem('user');
            state.userLoggedIn = false;
            state.userName = undefined;
            state.userToken = '';
            this.commit('popupShow',{
                type: 'success',
                message: 'Вы вышли из профиля'
            });
        },
        formErrorOccurred(state) {
            state.formHasError = true;
        },
        formErrorSolved(state) {
            state.formHasError = false;
        },
        updateRecentMaterials(state, payload) {
            if (!state.recentMaterials) {
                state.recentMaterials = localStorage.getItem('recentMaterials') ? JSON.parse(localStorage.getItem('recentMaterials')) : [];
            }
            if (payload === null) return;

            for (let i = 0; i < state.recentMaterials.length; i++) {
                let item = state.recentMaterials[i];
                if (item._id === payload._id) {
                    state.recentMaterials.splice(i, 1);
                }
            }

            state.recentMaterials.unshift(payload);
            if (state.recentMaterials.length >= 5) {
                state.recentMaterials.pop();
            }
            localStorage.setItem('recentMaterials', JSON.stringify(state.recentMaterials));
        },
    },
    actions: {
        async request(context, params) {
            /*
                params = {method, path, body}
            */
            const uri = "http://localhost:3000/" + params.path;
            const res = await fetch(uri, {
                method: params.method,
                headers: {
                    'x-access-token': context.state.userToken,
                    'Content-Type': 'application/json',
                },
                credentials: 'same-origin',
                body: params.hasOwnProperty("body") ? params.body : undefined
            });
            let response = await res.json();
            if (response.hasOwnProperty('error')) {
                console.error(res.error);
                context.commit('popupShow',{
                    type: 'error',
                    message: response.error
                });
            }
            return response;
        },
        async favoritesFetch(context) {
            const res = await context.dispatch('request',{
                path: `users/favorites`,
                method: 'GET',
            });
            if (!res.hasOwnProperty('error')) {
                context.state.favorites = res;
            }
        },
        async favoritesAdd(context, materialId) {
            const res = await context.dispatch('request',{
                path: `users/favorites/${materialId}`,
                method: 'POST',
            });
            if (!res.hasOwnProperty('error')) {
                context.state.favorites.push(res);
                context.commit('popupShow',{
                    type: 'success',
                    message: 'Материал добавлен в избранное'
                });
            }
        },
        async favoritesRemove(context, materialId) {
            const res = await context.dispatch('request',{
                path: `users/favorites/${materialId}`,
                method: 'DELETE',
            });
            if (!res.hasOwnProperty('error')) {
                context.state.favorites = context.state.favorites.filter(item => item._id !== materialId);
                context.commit('popupShow',{
                    type: 'success',
                    message: 'Материал удалён из избранного'
                });
            }
        },
    }
});

