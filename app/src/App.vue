<template>
    <Header @toggle-sidebar="toggleSidebar()"/>
    <Sidebar :collapsed="sidebarCollapsed"/>
    <Popup/>
<!--    <button style="background-color: #A1C4FD;" @click="showpopup({message: 'А вы знали, что каждые 60 секунд в Африке проходит одна минута?', type: 'info'})">pop</button>-->
<!--    <button style="background-color: #E95252;" @click="showpopup({message: 'Ошибка стоп 0x0001235A', type: 'error'})">pop</button>-->
<!--    <button style="background-color: #3EAF7C;" @click="showpopup({message: 'Never gonna give you up, never gonna gonna let you down, never gonna turn around and desert you Never gonna give you up, never gonna gonna let you down, never gonna turn around and desert you Never gonna give you up, never gonna gonna let you down, never gonna turn around and desert you', type: 'success'})">pop</button>-->
    <router-view/>
</template>

<script>
    import Header from '@/components/Header';
    import Sidebar from '@/components/Sidebar';
    import Popup from '@/components/Popup';
    import store from "./store";
    import {getCookie} from "@/lib/cookies";

    export default {
        name: 'App',
        components: {
            Header,
            Sidebar,
            Popup
        },
        data() {
            return {
                sidebarCollapsed: false,
            }
        },
        methods: {
            toggleSidebar() {
                this.sidebarCollapsed = !this.sidebarCollapsed;
            },
            showpopup(payload) {
                store.commit('popupShow',payload)
            }
        },
        mounted() {
            let userAuthCookie = getCookie('auth');
            if (userAuthCookie !== '' && userAuthCookie !== 'undefined' && userAuthCookie !== undefined) {
                let userNameCookie = getCookie('name');
                if (userNameCookie === '' || userNameCookie === undefined) {
                    console.error('Missing username cookie');
                }
                store.commit('userLogIn', {auth: userAuthCookie, name: userNameCookie});
            }
        }
    }
</script>

<style lang="scss">

    @font-face {
        font-family: 'Rubik';
        src: url("../public/fonts/Rubik/Rubik-VariableFont_wght.ttf") format('truetype');
    }

    @font-face {
        font-family: 'Nunito Sans';
        src: url("../public/fonts/Nunito Sans/NunitoSans-Black.ttf") format('truetype');
        font-weight: bold;
    }

    body {
        background-color: #F3F3F3;
        overflow-x: hidden;
        margin-top: 75px; /*компенация хэдера*/
    }

    *:focus {
        outline: none;
    }

    #app {
        font-family: Rubik, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
    }

    a {
        color: #4285F4;

        &.router-link-exact-active {
            color: black;
            &:hover {
                color: black;
                cursor: default;
            }
        }
        &:hover {
            color: #A1C4FD;
        }
    }

    h1, h2, h3 {
        font-family: "Nunito Sans", sans-serif;
    }

    button, button[type='submit'], button[type='button'] {
        background-color: #4285F4;
        border: none;
        border-radius: 3px;
        padding: 7px 10px;
        transition: background-color .2s;

        &:hover, &:active {
            background-color: #A1C4FD;
        }
        &[disabled] {
            background-color: #DDD;
        }
    }

</style>