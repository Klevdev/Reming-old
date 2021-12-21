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
        transition: opacity .3s;
    }

    .hidden {
        z-index: -100;
        opacity: 0;

        & > .animation::after,
        & > .animation::before {
            animation-play-state: paused;
        }
    }

    .shown {
        display: grid;
        place-items: center;
        opacity: 1;

        & > .animation::after,
        & > .animation::before {
            animation-play-state: running;
        }
    }

    @keyframes card {
        0% {
            transform: scale(1, 1);
        }
        25% {
            transform: scale(-1, 1);
        }
        50% {
            transform: scale(-1, -1);
        }
        75% {
            transform: scale(1, -1);
        }
    }

    @keyframes ellipsis {
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
        position: absolute;
        top: 48%;
        left: 48%;

        &::before {
            --width: 6.5em;
            --height: 3.7em;
            content: "";
            position: absolute;
            left: calc(48% - var(--width)/2.1);
            top: calc(48% - var(--height)/2);
            display: inline-block;
            width: var(--width);
            height: var(--height);
            border: 2px solid #2c3e50;
            border-radius: 5px;
            animation-name: card;
            animation-duration: 2.5s;
            animation-iteration-count: infinite;
        }

        &::after {
            content: "";
            position: absolute;
            animation-name: ellipsis;
            animation-duration: 2s;
            animation-iteration-count: infinite;
        }
    }
</style>