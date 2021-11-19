<template>
    <div class="popup-block" :class="`${popupType} ${popupShow ? 'shown' : ''}`">
        <div class="popup-icon" :class="popupType" v-if="popupType === 'success'">✓</div>
        <div class="popup-icon" :class="popupType" v-if="popupType === 'error'">!</div>
        <div class="popup-icon" :class="popupType" v-if="popupType === 'info'">i</div>
        <div class="message-block">
            {{popupMessage}}
        </div>
        <button id="close-btn" @click="popupClose">✕</button>
    </div>
</template>

<script>
    import {mapState, mapMutations} from 'vuex';
    export default {
        name: "Popup",
        computed: {
            ...mapState(['popupShow', 'popupMessage', 'popupType'])
        },
        data() {
            return {
            }
        },
        methods: {
            ...mapMutations(['popupClose']),
        }
    }
</script>

<style scoped lang="scss">
    .popup-block {
        width: 300px;
        min-height: 5em;
        color: #222;
        position: fixed;
        bottom: -200px;
        right: 25px;
        padding: .5em 1em;
        border-radius: 5px;
        display: grid;
        place-items: center;
        grid-template-columns: 2em 1fr 25px;
        gap: 10px;
        transition: bottom .4s ease-in-out;

        &.shown {
            bottom: 10px;
        }
    }

    .popup-icon {
        font-weight: bold;
        display: grid;
        place-items: center;
        border: 2px solid #222;
        border-radius: 50%;
        height: 1.8em;
        width: 1.8em;
        user-select: none;
    }

    .message-block {
        font-size: .8em;
        height: 80%;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        text-align: left;
    }

    #close-btn {
        font-size: 1em;
        position: relative;
        bottom: .4em;
        left: .8em;
        padding: 0;
        place-self: flex-start;
        display: grid;
        place-items: center;
        border: none;
        width: 25px;
        height: 25px;
        background: none;
        &:hover {
            color: #555;
            cursor: pointer;
        }
    }

    .success {
        background-color: #3EAF7C;
    }
    
    .error {
        background-color: #E95252;
    }
    
    .info {
        background-color: #A1C4FD;
    }
</style>