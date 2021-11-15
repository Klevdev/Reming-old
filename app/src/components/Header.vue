<template>
    <header>
        <button id="sideBarToggle" @click="toggleSidebar"></button>
        <div id="logo"></div>
        <div id="user-panel"><user-panel></user-panel></div>
    </header>
</template>

<script>
import UserPanel from '@/components/UserPanel.vue';
export default {
    name: 'Header',
    components: {UserPanel},
    methods: {
        toggleSidebar() {
            this.$emit('toggle-sidebar');
            // console.log("AAAAAAAAAAAAA");
        },
        // checkCookie() {
        //     console.log("!")
        //     return function() {
        //         let currentCookie = document.cookie;
        //         if (currentCookie !== lastCookie) {
        //             // something useful like parse cookie, run a callback fn, etc.
        //             this.userName = document.cookie.split("=")[1];
        //             lastCookie = currentCookie; // store latest cookie
        //         }
        //     }
        // },
    },
    data() {
        return {
            userName: ""
        }
    },

    created() {
        if (document.cookie) this.userName = document.cookie.split("=")[1];
        // this.checkCookie();
        // window.setInterval(this.checkCookie, 1000); // run every 100 ms
    }
}
</script>

<style lang="scss" scoped>

    header {
        background-color: #FAFAFA;
        width: 100vw;
        height: 55px;
        /*border-bottom: 1px solid black;*/
        display: grid;
        gap: 50px;
        place-items: center;
        grid-template-rows: 1fr;
        grid-template-columns: 25px 100px 1fr 200px;
        box-shadow: 0 0 10px #2c3e5033;
        padding: 0 50px;
    }

    #sideBarToggle {
        grid-column: 1;
        width: 25px;
        height: 25px;
        background: url('../assets/icons/burger.svg') no-repeat center center;
        background-size: contain;
        border: none;
        &:hover {
            cursor: pointer;
        }
    }

    #logo {
        grid-column: 2;
        width: calc(2*42px);
        height: calc(2*24px);
        background: url('../assets/logo.png') no-repeat center center;
        background-size: contain;
    }

    #user-panel {
        grid-column: 4;
    }
</style>