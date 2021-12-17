<template>
    <h1>Моя статистика прохождений</h1>
    <section class="wrapper">
        <div :class="`material ${material.type}`" v-for="material in materials">
            <h2><router-link :to="'/material/'+material._id">{{material.title}}</router-link></h2>
            <div class="studies" :style="`height:${getMaxHeight(material)*25}px`">
                <div class="entry" v-for="study in material.studies">
                    <div class="entry-correct-bar" :style="`height:${study.correctCount * 20 }px`"></div>
                    <div class="entry-incorrect-bar" :style="`height:${study.incorrectCount * 20 }px`"></div>
                    <div class="entry-correct-count">{{study.correctCount}}</div>
                    <div class="entry-incorrect-count">{{study.incorrectCount}}</div>
                    <div class="entry-time">{{new Date(study.time).toLocaleDateString("ru-RU")}}</div>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
    import store from "../store";

    export default {
        name: "Stats",
        data() {
            return {
                materials: [],
            }
        },
        async created() {
            this.materials = await store.dispatch('request', {
                    path: 'studies',
                    method: 'GET'
                });
        },
        methods: {
            getMaxHeight(material) {
                let maxCor = Math.max(...material.studies.map(item => item.correctCount));
                let maxIncor = Math.max(...material.studies.map(item => item.correctCount));
                // console.log(Math.max(maxCor, maxIncor))
                return Math.max(maxCor, maxIncor);
            }
        }

    }
</script>

<style scoped lang="scss">

    h1 {
        margin-left: 250px;
        text-align: left;
    }
    h2 {
        text-align: left;
        padding-left: 35px;
        & > a {
            color: inherit;
        }
    }

    .wrapper {
        margin-left: 250px;
        padding: 20px 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
        justify-content: flex-start;
        align-items: flex-start;
    }

    .material.set > h2 {
        background-position: left center;
        background-size: 25px 25px;
        background-repeat: no-repeat;
        background-image: url("../assets/icons/set-black.svg");
    }

    .material {
        padding: 15px;
        text-align: left;
        box-shadow: 0 10px 25px #2c3e5033, 0 20px 20px #2c3e5011;
        border-radius: 0;
        width: 90%;
        background-color: #FAFAFA;
        transition: border .2s, box-shadow .2s;
        border: 1px solid #DDD;
    }

    .studies {
        min-height: 200px;
        display: flex;
        flex-direction: row;
        align-items: flex-end;
        gap: 15px;
        & > .study:not(:last-child) {
            border-right: 1px solid #DDD;
        }
    }

    .entry {
        display: grid;
        grid-template-rows: 1fr 1em 1em;
        grid-template-columns: 1fr 1fr;

        & > .entry-correct-bar {
            align-self: end;
            background-color: #3EAF7C;
        }

        & > .entry-incorrect-bar {
            align-self: end;
            background-color: #E95252;
        }

        & > .entry-correct-count {
            color: #3EAF7C;
            text-align: center;
        }

        & > .entry-incorrect-count {
            color: #E95252;
            text-align: center;
        }

        & > .entry-time {
            text-align: center;
            grid-column: 1/3;
            grid-row: 3;
        }
    }
</style>