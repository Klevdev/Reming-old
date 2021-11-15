<template>
    <div v-if="!userLoggedIn">
        <router-link class="login-button" to="/login">Войти</router-link>
<!--        <router-link to="/signup">Зарегистрироваться</router-link>-->
    </div>
    <div v-if="userLoggedIn" class="user-panel">
        <img id="user-avatar" src="../assets/icons/user.svg" alt="default avatar">
        <div id="user-name">{{userName}}</div>
        <button id="toggle-user-dropdown" @click="showDropDown = !showDropDown" :class="{arrowUp: showDropDown}"></button>
        <ul v-if="showDropDown" class="dropdown">
            <li>Профиль</li>
            <li id="logout" @click="userLogOut">Выйти</li>
        </ul>
    </div>
</template>

<script>
    import store from "../store";
    import {mapState, mapActions} from 'vuex';

    export default {
        name: "UserPanel",
        data() {
            return {
                showDropDown: false
            }
        },
        computed: {
            ...mapState(['userLoggedIn', 'userName'])
        },
        created() {
        },
        methods: {
            ...mapActions(['userLogOut'])
        }
    }
</script>

<style scoped lang="scss">
    $panel-width: 200px;
    .login-button {
        background-color: #4285F4;
        border: none;
        border-radius: 3px;
        padding: 7px 10px;
        transition: background-color .2s;
        color: black;

        &:hover, &:active {
            background-color: #A1C4FD;
        }
    }

    .user-panel {
        width: $panel-width;
        background-color: #FAFAFA;
        border: 1px solid black;
        border-radius: 3px;
        padding: 7px 10px;
        color: black;
        display: flex;
        align-items: center;
        gap: 10px;
    }

    #user-avatar {
        width: 24px;
        height: 24px;
    }

    #user-name {
    }

    #toggle-user-dropdown {
        width: 24px;
        height: 24px;
        border: none;
        margin-left: auto;
        background: url("../assets/icons/dropDown.png") center center no-repeat;
        background-size: 12px 8px;
        &.arrowUp {
            transform: rotate(180deg);
        }
    }

    #logout {
        color: red;
        &:hover {
            cursor: pointer;
        }
    }

    .dropdown {
        border: 1px solid black;
        position: absolute;
        display: block;
        width: $panel-width;
        top: 30px;
        right: 50px;
        list-style: none;
        background-color: #FAFAFA;
        border-radius: 0 0 3px 3px;
        border-top: none;

        & > li {
            display: block;
            width: 100%;
            padding: 7px 10px;
        }
    }
</style>