<template>
    <nav :class="collapsed ? 'open' : 'collapsed'">
<!--        <router-link to="/">Главная</router-link>-->
        <router-link class="menu-item library" to="/library">Библиотека</router-link>
        <router-link class="menu-item editor" to="/editor">Конструктор</router-link>
        <router-link class="menu-item mymaterials" to="/mymaterials">Мои наборы</router-link>
        <router-link class="menu-item about" to="/about">О сайте</router-link>
    </nav>
</template>

<script>
    export default {
        name: "Sidebar",
        props: {
            collapsed: Boolean,
        }
    }
</script>

<style lang="scss" scoped>
    $collapsedWidth: 80px;
    $openedWidth: 230px;
    nav {
        &>*::selection {
            background: initial;
        }
        z-index: 90;
        background-color: #FAFAFA;
        /*border-top: 1px solid #AAA;*/
        box-shadow: 0 0 10px #2c3e5033;
        height: calc(100vh - 55px);
        position: fixed;
        top: 55px;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: start;
        transition: width .3s ease-in-out;
    }
    .collapsed {
        width: $collapsedWidth;
    }
    .open {
        width: $openedWidth;
    }

    .menu-item.library {
        background-image: url("../assets/icons/book.svg");
    }
    .menu-item.editor {
        background-image: url("../assets/icons/edit-black.svg");
    }
    .menu-item.mymaterials {
        background-image: url("../assets/icons/set-black.svg");
    }
    .menu-item.about {
        background-image: url("../assets/icons/about.svg");
    }

    .menu-item {
        background-repeat: no-repeat;
        overflow: hidden;
        white-space: nowrap;
        /*transition: color .3s .3s ease-in-out;*/

        .open > & {
            color: black;
            display: block;
            width: 100%;
            height: min-content;
            padding: 20px 20px 20px 70px;
            text-align: left;
            background-size: 20px 20px;
            background-position: 30px center;
        }
        .collapsed > & {
            color: black;
            display: block;
            width: 100%;
            padding: 20px 0 20px 0;
            text-align: left;
            color: rgba(0, 0, 0, 0) !important;
            background-size: 20px 20px;
            background-position: 30px center;
        }
        &:hover {
            color: #4285F4;
            background-color: #F3F3F3;
        }
        &.router-link-exact-active {
            font-weight: bold;
            color: initial;
            background-color: #F3F3F3;
        }
    }
</style>