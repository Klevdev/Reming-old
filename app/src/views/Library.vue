<template>
    <section class="page-wrapper">
        <div class="section-header">
            <h1>Библиотека</h1>
        </div>
        <div class="section-header">
            <h2>Последние добавленные</h2>
        </div>
        <div v-if="!materialsRecent.length" style="text-align: left">
            Здесь ничего нет :(
            <br>
            ...но вы могли бы <router-link to="/editor">добавить</router-link> сюда что-то своё
        </div>
        <MaterialsList :materials="materialsRecent" :action-on-last="{text: 'Найти больше', route: {name: 'Search', query: {sort: 'tc', desc: true}}}"/>
        <div v-if="materialsPopular.length" class="section-header">
            <h2>Популярные материалы</h2>
        </div>
        <MaterialsList v-if="materialsPopular.length" :materials="materialsPopular" :action-on-last="{text: 'Найти больше', route: {name: 'Search', query: {sort: 'vws', desc: true}}}"/>
    </section>
</template>

<script>
    import store from "../store";
    import MaterialsList from "../components/MaterialsList";
    import Pagination from "../components/Pagination";

    export default {
        name: "Library",
        components: {
            MaterialsList,
            Pagination
        },
        data() {
            return {
                materialsRecent: [],
                materialsPopular: [],
            }
        },
        async created() {
            const resRecent = await store.dispatch('request', {
                path: 'materials',
                method: 'GET',
                query: {
                    perPage: 9,
                    sort: 'tc',
                    desc: true
                }
            });
            if (resRecent.hasOwnProperty('error')) {
                this.materialsRecent = [];
                this.$router.back();
                return;
            } else {
                this.materialsRecent = resRecent.materials;
            }

            const resPopular = await store.dispatch('request', {
                path: 'materials',
                method: 'GET',
                query: {
                    perPage: 4,
                    sort: 'vws',
                    desc: true
                }
            });
            if (resPopular.hasOwnProperty('error')) {
                this.materialsPopular = [];
                this.$router.back();
            } else {
                this.materialsPopular = resPopular.materials;
            }
        },
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
        & > h1, & > h2 {
            text-align: left;
            width: max-content;
        }
        & > h2 {
            margin-top: 50px;
        }
    }

</style>