<template>
    <div class="popup-block" :class="`${popupProps.type} ${popupShow ? 'shown' : ''}`">
        <div class="message">{{popupProps.message}}</div>
        <button id="close-btn" @click="popupClose"></button>
        <router-link v-if="popupProps.actionRoute" class="action" :to="popupProps.actionRoute">{{popupProps.actionText}}</router-link>
    </div>
</template>

<script>
    import {mapState, mapMutations} from 'vuex';
    export default {
        name: "Popup",
        computed: {
            ...mapState(['popupShow', 'popupProps'])
        },
        data() {
            return {
                // popupShow: true,
                // popupProps: {
                //     type: 'info',
                //     message: "Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing",
                //     actionRoute: {name: 'Login'},
                //     actionText: "Войти"
                // },
            }
        },
        methods: {
            ...mapMutations(['popupClose']),
        }
    }
</script>

<style scoped lang="scss">
    .popup-block {
        z-index: 70;
        width: 350px;
        min-height: max-content;
        color: #222;
        position: fixed;
        bottom: 25px;
        right: -400px;
        display: grid;
        grid-template-columns: 1fr max-content;
        grid-auto-rows: max-content;
        gap: 10px;
        padding-left: 35px;
        padding-bottom: 10px;
        transition: right .4s ease-in-out;
        background-color: #fff;
        border: 1px solid #DDD;
        box-shadow: 0 0 10px #DDD, 0 20px 20px #DDD;
        background-size: 20px 20px;
        background-position: .5em .5em;
        background-repeat: no-repeat;

        &.shown {
            right: 25px;
        }

        &.success {
            background-image: url("../assets/icons/success.svg");
        }
        &.info {
            background-image: url("../assets/icons/info.svg");
        }
        &.error {
            background-image: url("../assets/icons/error.svg");
        }
    }

    .message {
        font-size: .9em;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        text-align: left;
        padding-top: 10px;
    }

    .action {
        font-size: .9em;
        text-align: left;
    }

    #close-btn {
        background: url("../assets/icons/cross-black.svg") no-repeat center center;
        background-size: 10px 10px;
        padding: 0;
        place-self: flex-start;
        display: grid;
        place-items: center;
        width: 35px;
        height: 35px;
        &:hover {
            color: #555;
            cursor: pointer;
        }
    }

    .success {
        border-left: 3px solid #3EAF7C;
    }
    
    .error {
        border-left: 3px solid #E95252;
    }
    
    .info {
        border-left: 3px solid #A1C4FD;
    }
</style>