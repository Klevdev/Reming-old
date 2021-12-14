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
                if (item.id === payload.id) {
                    state.recentMaterials.splice(i, 1);
                }
            }

            state.recentMaterials.unshift(payload);
            if (state.recentMaterials.length >= 5) {
                state.recentMaterials.pop();
            }
            localStorage.setItem('recentMaterials', JSON.stringify(state.recentMaterials));
        }
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
        async sendSet(context, set) {
            const res = await fetch('http://localhost:3000/set/new', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    auth: context.state.userToken,
                    ...set
                }),
            });
            let response = await res.json();
            if (response.hasOwnProperty('error')) {
                console.error(res.error);
                context.commit('popupShow',{
                    type: 'error',
                    message: res.error
                });
            } else {
                await router.push('/');
            }
        },
        async getUserSets(context) {
            const path = 'http://localhost:3000/set/myall';
            const query = `?auth=${context.state.userToken}`;
            const res = await fetch(path+query, {
                method: 'GET',
                headers: {},
            });
            let response = await res.json();
            if (response.hasOwnProperty('error')) {
                context.commit('popupShow',{
                    type: 'error',
                    message: res.error
                });
            } else {
                return response;
            }
        },
        async getSet(context, id) {
            const path = 'http://localhost:3000/set/view';
            const query = `?auth=${context.state.userToken}&id=${id}`;
            const res = await fetch(path+query, {
                method: 'GET',
                headers: {},
            });
            let response = await res.json();
            if (response.hasOwnProperty('error')) {
                this.commit('popupShow',{
                    type: 'error',
                    message: `Ошибка: ${response.error}`
                });
            } else {
                return response;
            }
        },
        async getSetCards(context, id) {
            const path = 'http://localhost:3000/set/cards';
            const query = `?auth=${context.state.userToken}&id=${id}`;
            const res = await fetch(path+query, {
                method: 'GET',
                headers: {},
            });
            let response = await res.json();
            if (response.hasOwnProperty('error')) {
                this.commit('popupShow',{
                    type: 'error',
                    message: `Ошибка: ${response.error}`
                });
            } else {
                return response;
            }
        },
        async saveStudyCards(context, params) {
            const path = 'http://localhost:3000/set/saveStudy';
            const res = await fetch(path, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    auth: context.state.userToken,
                    setId: params.setId,
                    cards: params.cards
                })
            });
            let response = await res.json();
            if (response.hasOwnProperty('error')) {
                this.commit('popupShow',{
                    type: 'error',
                    message: `Ошибка: ${response.error}`
                });
            } else {
                context.commit('popupShow', {
                    type: 'success',
                    message: 'Результат записан'
                });
                router.go(-1);
            }
        },
        async deleteSet(context, id) {
            const path = 'http://localhost:3000/set';
            const query = `?auth=${context.state.userToken}&id=${id}`;
            const res = await fetch(path+query, {
                method: 'DELETE',
                headers: {},
            });
            let response = await res.json();
            if (response.hasOwnProperty('error')) {
                this.commit('popupShow',{
                    type: 'error',
                    message: `Ошибка: ${response.error}`
                });
            } else {
                this.commit('popupShow',{
                    type: 'success',
                    message: `Набор удалён`
                });
            }
        },
    }
});

