<template>
    <section class="page-wrapper">
        <div class="section-header">
            <h1>Мои наборы</h1>
        </div>
        <div v-if="!materials.length" style="text-align: left">
            У вас пока нет материалов. Но вы можете
            <router-link to="/editor">создать их</router-link>
        </div>
        <MaterialsList :materials="materials"/>
        <div id="favorites" v-if="favorites.length">
            <div class="section-header">
                <h1>Избранное</h1>
            </div>
            <MaterialsList :materials="favorites"/>
        </div>
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
                favorites: []
            }
        },
        async created() {
            let res = await store.dispatch('request', {
                path: 'materials',
                method: 'GET',
                query: {
                    private: '1'
                }
            });
            if (res.hasOwnProperty('error')) {
                this.materials = [];
                this.$router.back();
            } else {
                this.materials = res.materials;
                this.pagesCount = res.pagesCount;
            }
            res = await store.dispatch('request', {
                path: 'users/favorites',
                method: 'GET',
            });
            if (res.hasOwnProperty('error')) {
                this.favorites = [];
                this.$router.back();
            } else {
                this.favorites = res;
            }
        }
    }
</script>

<style scoped lang="scss">
    .page-wrapper {
        margin-left: 250px;
    }
    .section-header {
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