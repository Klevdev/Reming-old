<template>
    <div class="animation-wrapper" :class="this.$store.state.loadingAnimationPlaying ? 'shown' : 'hidden'">
        <div class="animation">Загрузка</div>
    </div>
</template>

<script>
    import store from "../store";

    export default {
        name: "Loading",
        data() {
            return {

            }
        }

    }
</script>

<style scoped lang="scss">
    .animation-wrapper {
        z-index: 80;
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: #DDDDDDDD;
    }

    .hidden {
        display: none;

        & > .animation::after {
            content: "";
            animation-play-state: paused;
        }
    }

    .shown {
        display: grid;
        place-items: center;

        & > .animation::after {
            content: "";
            animation-play-state: running;
        }
    }

    @keyframes animate {
        0% {
            content: "";
        }
        25% {
            content: ".";
        }
        50% {
            content: "..";
        }
        75% {
            content: "...";
        }
    }

    .animation {
        position: fixed;
        &::after {
            animation: animate 2s infinite;
        }
    }
</style>