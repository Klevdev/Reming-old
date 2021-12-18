<template>
    <div class="page-header">
        <h1>Библиотека</h1>
<!--        <div class="search">-->
<!--            <input v-model="searchText" type="text" placeholder="Поиск" @input="searchDropdownShown = !searchDropdownShown" />-->
<!--            <button type="button" @click="search"></button>-->
<!--            <div class="dropdown">-->
<!--            </div>-->
<!--        </div>-->
    </div>
    <div v-if="!materials.length">
        Здесь ничего нет :(
        <br>
        ...но вы могли бы <router-link to="/editor">добавить</router-link> сюда что-то своё
    </div>
    <MaterialsList :materials="materials"/>
</template>

<script>
    import store from "../store";
    import MaterialsList from "../components/MaterialsList";

    export default {
        name: "Library",
        components: {
            MaterialsList,
        },
        data() {
            return {
                materials: [],
                // materialsShown: [],
                // searchText: null,
                // searchParams: [],
            }
        },
        async beforeMount() {
            this.materials = await store.dispatch('request', {
                path: 'materials/public',
                method: 'GET'
            });
            // this.materials.forEach(material => this.materialsShown.push(material._id));
        },
        methods: {
            // search() {}
        }
    }
</script>

<style scoped lang="scss">
    .page-header {
        margin-left: 250px;
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

    .search {
        display: flex;
        flex-direction: row;
        /*gap: 10px;*/

        & > input {
            min-width: 200px;
            width: 100%;
            background-color: #FFFFFF;
            border: 1px solid #4285F4;
            border-radius: 3px 0 0 3px;
            padding: 7px 10px;
            transition: background-color .2s, border-color .2s;

            &:focus, &:active {
                border-color: #A1C4FD;
            }
        }
        & > button {
            height: 40px;
            width: 40px;
            background-image: url("../assets/icons/search-white.svg");
            background-position: center center;
            background-repeat: no-repeat;
            background-size: 15px 15px;
        }

        & > .dropdown {

        }
    }

</style>