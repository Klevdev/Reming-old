<template>
    <button :type="type">{{label}}</button>
</template>

<script>
    export default {
        name: "Button",
        props: {
            type: {
                type: String,
                default: 'text'
            },
            label: {
                type: String,
                default: 'Push me'
            },
        },
    }
</script>

<style lang="scss" scoped>
</style>