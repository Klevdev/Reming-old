import { createStore } from "vuex";
import router from "../router";

export default createStore({
    state() {
        return {
            userLoggedIn: false,
            userName: undefined,
            userToken: '',

            formHasError: false,

            popupShow: false,
            popupProps: {},
            popupTimeoutId: null,

            loadingAnimationPlaying: false,

            recentMaterials: null,
            favorites: [],
        }
    },
    mutations: {
        popupShow(state, payload) {
            if (state.popupShow) {
                this.commit('popupClose');
            }
            setTimeout(() => {
                state.popupShow = true;
                state.popupProps.message = payload.message;
                state.popupProps.type = payload.type;
                state.popupProps.actionRoute = payload.actionRoute;
                state.popupProps.actionText = payload.actionText;
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
                state.popupProps = {};
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
            this.dispatch('favoritesFetch')
        },
        userLogOut(state) {
            localStorage.removeItem('user');
            state.userLoggedIn = false;
            state.userName = undefined;
            state.userToken = '';
            // this.commit('popupShow',{
            //     type: 'success',
            //     message: 'Вы вышли из профиля'
            // });
            this.commit('emptyRecentMaterials');
            state.favorites = [];
            router.push({name: 'Home'});
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
        removeFromRecentMaterials(state, payload) {
            for (let i = 0; i < state.recentMaterials.length; i++) {
                let item = state.recentMaterials[i];
                if (item._id === payload._id) {
                    state.recentMaterials.splice(i, 1);
                }
            }
            localStorage.setItem('recentMaterials', JSON.stringify(state.recentMaterials));
        },
        emptyRecentMaterials(state) {
            state.recentMaterials = null;
            localStorage.removeItem('recentMaterials');
        },
    },
    actions: {
        async request(context, params) {
            /*
                params = {method, path, body}
            */
            context.state.loadingAnimationPlaying = true;
            const uri = "http://localhost:3000/" + params.path;
            try {
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
                if (res.status !== 200) {
                    console.error(response.error);
                    context.commit('popupShow',{
                        type: 'error',
                        message: response.error
                    });
                    if (res.status === 401) {
                        // я не знаю как мне лучше сделать это при текущем устройстве
                        // context.commit('userLogOut');
                    }
                }
                context.state.loadingAnimationPlaying = false;
                return response;
            } catch (e) {
                context.state.loadingAnimationPlaying = false;
                console.error(e);
                context.commit('popupShow',{
                    type: 'error',
                    message: 'Произошла ошибка запроса. Возможно сервер недоступен'
                });
                return {error: 'Failed to fetch'};
            }
        },
        async favoritesFetch(context) {
            if (!context.state.userLoggedIn) {
                return;
            }
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
                // context.commit('popupShow',{
                //     type: 'success',
                //     message: 'Материал удалён из избранного'
                // });
            }
            await context.dispatch('favoritesFetch');
        },
    }
});

