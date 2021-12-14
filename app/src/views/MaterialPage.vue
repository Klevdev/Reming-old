<template>
    <div class="set-info">
        <div class="set-header">
            <h2>{{set.title}}</h2>
            <div v-if="set.author === userName" style="display: flex; gap: 15px; justify-content: flex-start;">
                <button type="button" class="edit-btn" @click="this.$router.push(`/editor/${setId}`)"></button>
                <button type="button" class="delete-btn" @click="deleteSet"></button>
            </div>
        </div>
        <dl>
            <dt>Описание</dt>
            <dd style="overflow: hidden;text-overflow: ellipsis;">{{set.description}}</dd>
            <dt>Доступен в библиотеке</dt>
            <dd>{{set.isPublic ? 'Да' : 'Нет'}}</dd>
            <dt>Автор</dt>
            <dd>{{set.author}}</dd>
            <dt>Дата создания</dt>
            <dd>{{set.timeCreated}}</dd>
            <dt>Теги</dt>
            <dd>Скоро будут</dd>
        </dl>
        <div class="btns">
            <router-link class="start-btn" :to="'/study/'+setId">►</router-link>
        </div>
    </div>
</template>

<script>
    import store from "../store";
    import router from "../router";
    import {mapState} from "vuex";

    export default {
        name: "MaterialPage",
        data() {
            return {
                setId: this.$route.params.setId,
                set: {}
            }
        },
        computed: {
            ...mapState(['userName'])
        },
        async created() {
            this.set = await store.dispatch('request', {
                path: `materials/${this.setId}`,
                method: "GET"
            });
            if (this.set.hasOwnProperty('error')) {
                router.go(-1);
            }
            this.set.timeCreated = new Date(this.set.timeCreated).toLocaleDateString("ru-RU");

            store.commit('updateRecentMaterials', {
                id: this.$route.params.setId,
                title: this.set.title
            });
        },
        async beforeRouteUpdate(to, from, next) {
            this.set = await store.dispatch('request', {
                path: `materials/${this.setId}`,
                method: "GET"
            });
            if (this.set.hasOwnProperty('error')) {
                router.go(-1);
            }
            this.set.timeCreated = new Date(this.set.timeCreated).toLocaleDateString("ru-RU");
            next();
        },
        methods: {
            async deleteSet() {
                if (confirm("Вы уверены, что хотите удалить набор?")) {
                    const res = await store.dispatch('request',{
                        path: `materials/sets/${this.setId}`,
                        method: 'DELETE',
                    });
                    if (!res.hasOwnProperty('error')) {
                        store.commit('popupShow',{
                            type: 'success',
                            message: 'Материал удалён'
                        });
                        router.go(-1);
                    }
                }
            }
        }
    }
</script>

<style scoped lang="scss">
    .set-info {
        margin: 0 auto;
        width: 400px;
        box-shadow: 0 0 10px #DDD, 0 20px 20px #DDD;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: 10px;
        background-color: #FAFAFA;
        padding: 20px 25px;
        border-radius: 0;
        border: 1px solid #DDD;
    }

    .set-header {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr 35px 35px;
        align-items: center;

        & > h2 {
            text-align: left;
        }
    }

    dl {
        text-align: left;
        display: grid;
        gap: 5px;
        grid-template-columns: repeat(2, 1fr);
        & > dt {
            font-weight: bold;
        }
    }
    .start-btn {
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

    .btns {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .edit-btn {
        padding-bottom: .2em;
        color: black;
        font-weight: bold;
        font-size: 1.3em;
        background: url("../assets/icons/edit.svg") center center no-repeat;
        background-size: 20px 20px;
        width: 35px;
        height: 35px;
        &:hover {
            cursor: pointer;
            background-color: initial;
        }
    }
    .delete-btn {
        padding-bottom: .2em;
        color: black;
        font-weight: bold;
        font-size: 1.3em;
        background: url("../assets/icons/delete.svg") center center no-repeat;
        background-size: 20px 20px;
        width: 35px;
        height: 35px;
        &:hover {
            cursor: pointer;
            background-color: initial;
        }
    }
</style>