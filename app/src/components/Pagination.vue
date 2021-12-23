<template>
    <div class="pagination">
        <div class="page">
            <router-link :to="getRoute(curPage > 1 ? curPage  - 1 : 1)">&lt;&lt;</router-link>
        </div>
        <div class="page" v-for="page in pages" :class="{'current': page == curPage}">
            <router-link v-if="page !== '...'" :to="getRoute(page)">{{page}}</router-link>
            <div v-else>...</div>
        </div>
        <div class="page">
            <router-link :to="getRoute(curPage < pagesCount ? curPage + 1 : pagesCount)">&gt;&gt;</router-link>
        </div>
    </div>
</template>

<script>
    import router from '../router';

    const nearestPagesShown = 2;

    export default {
        name: "Pagination",
        props: {
            pagesCount: Number,
        },
        data() {
            return {
                curPage: this.$route.query.page ? parseInt(this.$route.query.page) : 1,
                pages: [],
            }
        },
        created() {
            // for (let i = 1; i <= this.pagesCount; i++) {
            //     this.pages.push(i);
            // }
            // if (this.pagesCount > maxPages) {
            //     this.pages.splice(Math.ceil(maxPages/2), Math.floor(this.pagesCount - maxPages/2));
            //     this.pages[maxPages/2 +1] = '...';
            // }
            let flag = false;

            this.pages.push(1);
            for (let pageNum = 2; pageNum <= this.pagesCount - 1; pageNum++) {
                if (pageNum >= this.curPage - nearestPagesShown && pageNum <= this.curPage + nearestPagesShown) {
                    this.pages.push(pageNum);
                    flag = false;
                } else if (!flag) {
                    flag = true;
                    this.pages.push('...');
                }
            }
            if (this.pagesCount > 1) {
                this.pages.push(this.pagesCount);
            }
        },
        methods: {
            getRoute(page) {
                if (page === "...") return {};
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
        width: 3em;
        height: 3em;
        transition: box-shadow .2s;
        user-select: none;
        & > a,
        & > div {
            display: grid;
            place-items: center;
            width: 100%;
            height: 100%;
        }
        &.current > a  {
            background-color: #4285F4;
            color: #fff;
        }
        &:not(.current) > a:hover {
            color: #4285F4;
            cursor: pointer;
            box-shadow: 0 0 10px #2c3e5033, 0 20px 20px #2c3e5011;
        }
    }
</style>