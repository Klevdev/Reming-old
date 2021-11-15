import { createStore } from "vuex";

import {setCookie} from "../lib/cookies";

export default createStore({
    state() {
        return {
            userLoggedIn: false,
            userToken: '',
            userName: '',
            formHasError: false
        }
    },
    mutations: {
        userLogIn(state, payload) {
            state.userLoggedIn = true;
            state.userToken = payload.auth;
            state.userName = payload.name;
            setCookie('auth', payload.auth);
            setCookie('name', payload.name);
        },
        // userLogOut(state) {
        //     state.userLoggedIn = false;
        //     state.userToken = 0;
        //     state.userName = '';
        //     setCookie('auth', 0);
        //     setCookie('name', '');
        // },
        formErrorOccurred(state) {
            console.log("-");
            state.formHasError = true;
        },
        formErrorSolved(state) {
            console.log("+");
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
            }
        },
    }
});

