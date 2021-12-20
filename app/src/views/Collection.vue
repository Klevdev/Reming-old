<template>
    <section class="page-wrapper">
        <div class="page-header">
            <h1>{{this.collectionTitle}}</h1>
            <router-link :to="{name: 'MaterialPage', params: {id: collectionId}}" class="collection-material-link"/>
        </div>
        <div v-if="!materials.length" style="text-align: left">
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
        gap: 10px;
        & > h1 {
            text-align: left;
            width: max-content;
        }
        &:hover > .collection-material-link {
            display: inline-block;
        }
    }
    .collection-material-link {
        display: none;
        width: 20px;
        height: 20px;
        background-image: url("../assets/icons/description.svg");
        background-size: 20px 20px;
        background-repeat: no-repeat;
        background-position: center center;
    }
</style>