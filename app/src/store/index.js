import { createStore } from "vuex";
import router from "../router";

import {setCookie} from "../lib/cookies";

export default createStore({
    state() {
        return {
            userLoggedIn: false,
            userToken: '',
            userName: '',

            formHasError: false,

            popupMessage: null,
            popupType: null,
            popupShow: false,
            popupTimeoutId: null
        }
    },
    mutations: {
        popupShow(state, payload) {
            setTimeout(() => {
                state.popupShow = true;
                state.popupMessage = payload.message;
                state.popupType = payload.type;
                state.popupTimeoutId = setTimeout(() => {
                    this.commit('popupClose');
                }, 5000);
            }, state.popupShow ? 400 : 0);
            state.popupTimeoutId = null;
            if (state.popupShow) {
                this.commit('popupClose');
            }
        },
        popupClose(state) {
            clearTimeout(state.popupTimeoutId);
            state.popupTimeoutId = null;
            state.popupShow = false;
            state.popupAppearenceTimeoutId = setTimeout(() => {
                state.popupMessage = null;
                state.popupType = null;
            }, 400);
        },
        userLogIn(state, payload) {
            state.userLoggedIn = true;
            state.userToken = payload.auth;
            state.userName = payload.name;
            setCookie('auth', payload.auth);
            setCookie('name', payload.name);
            this.commit('popupShow',{
                type: 'success',
                message: `Добро пожаловать, ${payload.name}`
            });
        },
        userLogOut(state) {
            state.userLoggedIn = false;
            state.userToken = '';
            state.userName = '';
            setCookie('auth', '');
            setCookie('name', '');
        },
        formErrorOccurred(state) {
            state.formHasError = true;
        },
        formErrorSolved(state) {
            state.formHasError = false;
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

