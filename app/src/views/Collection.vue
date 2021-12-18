<template>
    <h1>{{this.collectionTitle}}</h1>
    <div v-if="!materials.length">
        Коллекция пуста
    </div>
    <MaterialsList :materials="materials"/>
</template>

<script>

    import store from "../store";
    import MaterialsList from "../components/MaterialsList";

    export default {
        name: "Collection",
        components: {
            MaterialsList,
        },
        data() {
            return {
                collectionTitle: '',
                collectionId: this.$route.params.collectionId,
                materials: [],
            }
        },
        async created() {
            let data = await store.dispatch('request', {
                path: `materials/collections/${this.collectionId}`,
                method: 'GET'
            });
            this.collectionTitle = data.title;
            this.materials = data.materials;
        }
    }
</script>

<style scoped lang="scss">
    h1 {
        margin-left: 250px;
        text-align: left;
    }
</style>