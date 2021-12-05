<template>
    <h1>Библиотека</h1>
    <div v-if="!sets.length">
        Здесь ничего нет :(
        <br>
        ...но вы могли бы <router-link to="/editor">добавить</router-link> сюда что-то своё
    </div>
    <section class="sets-wrapper">
        <div class="set" v-for="set in sets">
            <router-link class="set-link" :to="'/material/'+set._id">
                <div style="min-height: 100%">
                    <h3>{{set.title}}</h3>
                    <div class="description">{{set.description}}</div>
                </div>
                <router-link class="start-btn" :to="'/study/'+set._id">►</router-link>
            </router-link>
        </div>
    </section>
</template>

<script>
    import store from "../store";

    export default {
        name: "Library",
        data() {
            return {
                sets: [],
            }
        },
        async beforeMount() {
            this.sets = await store.dispatch('request', {
                path: 'materials/public',
                method: 'GET'
            });
        }
    }
</script>

<style scoped lang="scss">
    .sets-wrapper {
        width: 1100px;
        margin: 0 auto;
        padding: 20px 0;
        display: grid;
        grid-template-columns: repeat(5, 200px);
        /*grid-auto-rows: 200px;*/
        column-gap: 20px;
        place-items: center;
        row-gap: 10px;
    }
    .set {
        padding: 15px;
        text-align: left;
        /*border: 1px solid #AAAAAA;*/
        border-radius: 5px;
        box-shadow: 0 0 10px #2c3e5033, 0 20px 20px #2c3e5011;
        width: 200px;
        height: 150px;
        background-color: #FAFAFA;
        transition: border .2s;
        &:hover {
            box-shadow: 0 10px 25px #2c3e5033, 0 20px 20px #2c3e5011;
        }
    }
    .set-link {
        color: inherit;
        &:hover > .start-btn {
            opacity: 100%;
        }
    }
    .description {
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .start-btn {
        opacity: 0;
        position: relative;
        left: 135px;
        bottom: 30px;
        padding: 10px 10px 10px 12px;
        color: white;
        font-size: 1em;
        background-color: #3EAF7C;
        border-radius: 50%;
        width: 35px;
        height: 35px;
        transition: background-color .2s, opacity .1s;
        &:hover {
            cursor: pointer;
            background-color: #4EBF8C;
        }
    }
</style>