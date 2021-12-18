<template>
    <section class="page-wrapper">
        <div class="page-header">
            <h1>Конструктор материалов</h1>
        </div>
        <div class="wrapper">
            <router-link class="material-link" :to="{name: 'EditorSet'}">
                <div class="material set">
                    <h3>Создать набор</h3>
                </div>
            </router-link>
            <router-link class="material-link" :to="{name: 'EditorCollection'}">
                <div class="material collection">
                    <h3>Создать коллекцию</h3>
                </div>
            </router-link>
        </div>
    </section>
</template>

<script>

    export default {
        name: "Editor",
        data() {
            return {

            }
        },
        methods: {}
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

    .wrapper {
        padding: 20px 0;
        display: grid;
        grid-template-columns: repeat(5, 200px);
        /*grid-auto-rows: 200px;*/
        column-gap: 20px;
        place-items: center;
        row-gap: 10px;
    }

    .material.set {
        background-image: url("../assets/icons/set-black.svg");
    }

    .material.collection {
        background-image: url("../assets/icons/folder.svg");
    }

    .material {
        background-position: 10% 90%;
        background-size: 45px 45px;
        background-repeat: no-repeat;
        padding: 15px;
        text-align: left;
        box-shadow: 0 10px 25px #2c3e5033, 0 20px 20px #2c3e5011;
        border-radius: 0;
        width: 200px;
        height: 150px;
        background-color: #FAFAFA;
        transition: border .2s, box-shadow .2s;
        border: 1px solid #DDD;
        &:hover {
            box-shadow: 0 0 10px #2c3e5033, 0 20px 20px #2c3e5011;
        }
    }
    .material-link {
        color: inherit;
    }
</style>