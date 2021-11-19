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
            state.popupTimeoutId = null;
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
        // userLogOut(state) {
        //     state.userLoggedIn = false;
        //     state.userToken = 0;
        //     state.userName = '';
        //     setCookie('auth', 0);
        //     setCookie('name', '');
        // },
        formErrorOccurred(state) {
            state.formHasError = true;
        },
        formErrorSolved(state) {
            state.formHasError = false;
        }
    },
    actions: {
        async userLogOut(context) {
            const res = await fetch('http://localhost:3000/user/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // mode: 'cors',
                // credentials: 'omit',
                body: JSON.stringify({
                    auth: context.state.userToken
                }),
            });
            let response = await res.json();
            if (response.hasOwnProperty('error')) {
                console.error('WTF');
            } else {
                context.state.userLoggedIn = false;
                context.state.userToken = '';
                context.state.userName = '';
                setCookie('auth', '');
                setCookie('name', '');
                await router.push('/');
            }
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
            // console.log(id);
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
            // console.log(params.setId, params.cards);
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
    }
});

