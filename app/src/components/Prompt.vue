<template>
    <div class="prompt-block">

    </div>
</template>

<script>
    import {mapState, mapMutations} from 'vuex';
    export default {
        name: "Prompt",
        computed: {
            ...mapState(['promptShow', 'promptMessage'])
        },
        data() {
            return {
            }
        },
        methods: {
            ...mapMutations(['promptClose']),
        }
    }
</script>

<style scoped lang="scss">
    .prompt-block {
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
</style>