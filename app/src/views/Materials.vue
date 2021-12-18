<template>
    <h1>Мои наборы</h1>
    <div v-if="!materials.length">
        У вас пока нет материалов. Но вы можете
        <router-link to="/editor">создать их</router-link>
    </div>
    <MaterialsList :materials="materials"/>
</template>

<script>

    import store from "../store";
    import MaterialsList from "../components/MaterialsList";

    export default {
        name: "Materials",
        components: {
            MaterialsList,
        },
        data() {
            return {
                materials: [],
            }
        },
        async created() {
            this.materials = await store.dispatch('request', {
                path: 'materials/personal',
                method: 'GET'
            });
        }
    }
</script>

<style scoped lang="scss">
    h1 {
        margin-left: 250px;
        text-align: left;
    }
</style>