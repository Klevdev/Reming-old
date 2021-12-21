<template>
    <section class="page-wrapper">
        <div class="page-header">
            <h1>Мои наборы</h1>
        </div>
        <div v-if="!materials.length" style="text-align: left">
            У вас пока нет материалов. Но вы можете
            <router-link to="/editor">создать их</router-link>
        </div>
        <MaterialsList :materials="materials"/>
    </section>
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
            if (this.materials.hasOwnProperty('error')) {
                this.$router.back();
            }
        }
    }
</script>

<style scoped lang="scss">
    .page-wrapper {
        margin-left: 250px;
    }
    .page-header {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        gap: 50px;
        & > h1 {
            text-align: left;
            width: max-content;
        }
    }
</style>