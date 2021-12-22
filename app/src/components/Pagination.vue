<template>
    <div class="pagination">
        <router-link class="page" :to="getRoute(1)">&lt;&lt;</router-link>
<!--        TODO: Сделать так чтобы выводились не все страницы (maxPages)-->
        <router-link class="page" v-for="page in pagesCount*10" :to="getRoute(page)" :class="{'current': page == curPage}">{{page}}</router-link>
        <router-link class="page" :to="getRoute(pagesCount)">&gt;&gt;</router-link>
    </div>
</template>

<script>
    import router from '../router';

    const maxPages = 5;

    export default {
        name: "Pagination",
        props: {
            pagesCount: Number,
        },
        data() {
            return {
                curPage: this.$route.query.page
            }
        },
        methods: {
            getRoute(page) {
                return {
                    name: this.$route.name,
                    query: {
                        ...this.$route.query,
                        page: page
                    }
                }
            }
        }
    }
</script>

<style scoped lang="scss">
    .pagination {
        position: fixed;
        bottom: 25px;
        left: 250px;
        display: flex;
        flex-direction: row;
        gap: 10px;
    }
    .page {
        box-shadow: 0 0 10px #DDD, 0 20px 20px #DDD;
        border: 1px solid #DDD;
        background-color: #FFF;
        display: grid;
        place-items: center;
        width: 3em;
        height: 3em;
        transition: box-shadow .2s;
        &.current  {
            background-color: #4285F4;
            color: #fff;
        }
        &:not(.current):hover {
            color: #4285F4;
            cursor: pointer;
            box-shadow: 0 0 10px #2c3e5033, 0 20px 20px #2c3e5011;
        }
    }
</style>