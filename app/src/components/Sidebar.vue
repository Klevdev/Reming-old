<template>
    <nav :class="collapsed ? 'open' : 'collapsed'">
        <router-link to="/">Home</router-link>
        <router-link to="/login">Log In</router-link>
        <router-link to="/signup">Sign Up</router-link>
        <router-link to="/about">About</router-link>
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
    $sidebarWidth: 10vw;
    nav {
        background-color: #FAFAFA;
        /*border-top: 1px solid #AAA;*/
        /*box-shadow: 0 0 10px #2c3e5033;*/
        width: $sidebarWidth;
        height: calc(100vh - 55px);
        position: absolute;
        /*top: 0;*/
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: start;
        transition: left .3s ease-in-out;
    }
    .collapsed {
        left: -$sidebarWidth;
    }
    .open {
        left: 0;
    }
    nav > a {
        color: black;
        display: block;
        width: 100%;
        padding: 10px;
        text-align: left;
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