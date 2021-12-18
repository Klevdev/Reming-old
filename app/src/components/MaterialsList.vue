<template>
    <section class="materials-wrapper">
        <div v-for="material in materials" :class="`material ${material.type}`">
            <router-link class="material-link" :to="material.type === 'set' ? '/material/'+material._id : '/collection/'+material._id">
                <div style="min-height: 100%">
                    <h3>{{material.title}}</h3>
                    <div class="description">{{material.description}}</div>
                </div>
                <router-link v-if="material.type === 'set'" class="btn start-btn" :to="'/study/'+material._id" />
                <router-link v-if="material.type === 'collection'" class="btn edit-btn" :to="'/material/'+material._id" />
            </router-link>
        </div>
    </section>
</template>

<script>
    export default {
        name: "MaterialsList",
        props: {
            materials: {
                type: Array,
                default: []
            }
        },
        data() {
            return {

            }
        }
    }
</script>

<style scoped lang="scss">

    .materials-wrapper {
        margin-left: 250px;
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
        background-size: 25px 25px;
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
    &:hover > .btn {
         opacity: 100%;
     }
    }
    .description {
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .start-btn {
        background-image: url("../assets/icons/play-white.svg");
        background-color: #3EAF7C;
        background-size: 35px 35px;
    &:hover {
         background-color: #4EBF8C;
     }
    }

    .edit-btn {
        background-image: url("../assets/icons/elipsis-white.svg");
        background-color: #4285F4;
        background-size: 20px 20px;
    &:hover {
         background-color: #A1C4FD;
     }
    }

    .btn {
        opacity: 0;
        background-repeat: no-repeat;
        background-position: center center;
        display: block;
        width: 35px;
        height: 35px;
        position: relative;
        left: 135px;
        bottom: 30px;
        color: white;
        border-radius: 50%;
        transition: background-color .2s, opacity .1s;
    &:hover {
         cursor: pointer;
     }
    }
</style>