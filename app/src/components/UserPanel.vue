<template>
    <div v-if="!userLoggedIn" class="guest-panel" >
        <router-link to="/login">Войти</router-link>
        <router-link to="/signup">Зарегистрироваться</router-link>
    </div>
    <div v-if="userLoggedIn" class="user-panel" :class="{'show-dropdown': !showDropDown}" @click="showDropDown = !showDropDown" >
        <img id="user-avatar" src="../assets/icons/user.svg" alt="default avatar">
        <div id="user-name">{{userName}}</div>
<!--        <button id="toggle-user-dropdown" :class="{arrowUp: showDropDown}"></button>-->
    </div>
    <ul v-if="userLoggedIn && showDropDown" class="dropdown">
        <li><router-link to="/mystats">Моя статистика</router-link></li>
        <li id="logout" @click="userLogOut">Выйти</li>
    </ul>
</template>

<script>
    import store from "../store";
    import {mapState} from 'vuex';
    import router from "../router";

    export default {
        name: "UserPanel",
        data() {
            return {
                showDropDown: false,
            }
        },
        computed: {
            ...mapState(['userLoggedIn', 'userName'])
        },
        created() {
        },
        methods: {
            async userLogOut() {
                const result = await store.dispatch('request', {
                    method: "POST",
                    path: "users/logout"
                });
                // if (result.hasOwnProperty("ok")) {
                store.commit("userLogOut");
                await router.push('/');
                // }
            }
        }
    }
</script>

<style scoped lang="scss">
    $panel-width: 250px;
    .login-button {
        color: black;
    }

    .user-panel, .guest-panel {
        &>*::selection {
            background: initial;
        }
        z-index: 100;
        justify-self: flex-end;
        width: $panel-width;
        height: 55px;
        padding: 0 20px;
        color: black;
        display: grid;
        grid-template-columns: 24px 1fr;
        place-items: center;
        gap: 15px;
        /*&.show-dropdown:hover {*/
        /*    border-bottom: 2px solid #4285F4;*/
        /*}*/
        &:hover {
            background-color: #F3F3F3;
            cursor: pointer;
        }
    }
    .guest-panel > :first-child {
        padding-right: 5px;
        border-right: 2px solid #666;
    }

    #user-avatar {
        width: 24px;
        height: 24px;
    }

    #user-name {
        width: 100%;
        max-height: 2.5em;
        text-align: left;
        overflow: hidden;
        text-overflow: ellipsis;
    }


    /*#toggle-user-dropdown {*/
    /*    width: 24px;*/
    /*    height: 24px;*/
    /*    margin-left: auto;*/
    /*    background: url("../assets/icons/triangle-arrow-down.png") center center no-repeat;*/
    /*    background-size: 12px 8px;*/
    /*    &.arrowUp {*/
    /*        transform: rotate(180deg);*/
    /*    }*/
    /*}*/

    #logout {
        color: red;
    }

    .dropdown {
        box-shadow: 0 5px 5px #2c3e5033;
        z-index: 90;
        position: absolute;
        display: block;
        width: $panel-width;
        top: 55px;
        right: 27.5px;
        margin: 0;
        list-style: none;
        border-radius: 0 0 3px 3px;
        background-color: #FAFAFA;

        & > li {
            text-align: left;
            display: block;
            width: 100%;
            padding: 7px calc(20px + 24px + 15px);
            &:hover {
                cursor: pointer;
                background-color: #F3F3F3;
            }
        }
        &>*::selection {
            background: initial;
            cursor: default;
        }
    }
</style>