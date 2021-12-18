<template>
    <section class="page-wrapper">
        <div class="page-header">
            <h1>{{this.collectionTitle}}</h1>
        </div>
        <div v-if="!materials.length">
            Коллекция пуста
        </div>
        <MaterialsList :materials="materials"/>
    </section>
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