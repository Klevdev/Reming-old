<template>
    <Header @toggle-sidebar="toggleSidebar()"/>
    <Sidebar :collapsed="sidebarCollapsed"/>
    <Popup/>
    <Prompt/>
    <Loading/>
    <router-view :key="$route.fullPath"/>
</template>

<script>
    import Header from '@/components/Header';
    import Sidebar from '@/components/Sidebar';
    import Popup from '@/components/Popup';
    import Prompt from '@/components/Prompt';
    import Loading from '@/components/Loading';
    import store from "./store";

    export default {
        name: 'App',
        components: {
            Header,
            Sidebar,
            Popup,
            Prompt,
            Loading
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
        },
        created() {
            store.commit('userLogIn', false);
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
        /*background-color: #333;*/
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
        transition: color .2s;

        &.router-link-exact-active {
            color: black;
            &:hover {
                color: black;
                cursor: default;
            }
        }
        &:hover {
            color: #A1C4FD;;
            cursor: pointer;
        }
    }

    h1, h2, h3 {
        font-family: "Nunito Sans", sans-serif;
    }

    button, button[type='submit'], button[type='button'] {
        color: #FFFFFF;
        background-color: #4285F4;
        border: none;
        border-radius: 3px;
        padding: 10px;
        transition: background-color .2s;

        &:hover, &:active {
            cursor: pointer;
            background-color: #A1C4FD;
        }
        &[disabled] {
            background-color: #DDD;
        }

        &.danger {
            background-color: #E95252;
            &:hover, &:active {
                background-color: #FF5555;
            }
        }
    }
</style>