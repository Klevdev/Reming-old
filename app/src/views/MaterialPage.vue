<template>
    <div class="set-info">
        <div class="set-header">
            <h2>{{set.title}}</h2>
            <div class="btns" style="justify-content: flex-end">
                <button v-if="!isMaterialInFavorites" type="button" class="btn favorites-add-btn" @click="() => {favoritesAdd(setId); this.isMaterialInFavorites = !isMaterialInFavorites}"></button>
                <button v-if="isMaterialInFavorites" type="button" class="btn favorites-remove-btn" @click="() => {favoritesRemove(setId); this.isMaterialInFavorites = !isMaterialInFavorites}"></button>
                <button v-if="set.author === userName" type="button" class="btn edit-btn" @click="this.$router.push(`/editor/${setId}`)"></button>
                <button v-if="set.author === userName" type="button" class="btn delete-btn" @click="deleteSet"></button>
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
            <router-link v-if="set.type === 'set'" class="start-btn" :to="'/study/'+setId"/>
        </div>
    </div>
</template>

<script>
    import store from "../store";
    import router from "../router";
    import {mapState, mapActions} from "vuex";

    export default {
        name: "MaterialPage",
        data() {
            return {
                setId: this.$route.params.setId,
                set: {},
                isMaterialInFavorites: false,
            }
        },
        computed: {
            ...mapState(['userName', 'favorites'])
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
                _id: this.$route.params.setId,
                title: this.set.title
            });

            let favoritesCopy = JSON.parse(JSON.stringify(this.favorites));
            let flag = false;
            for (let i = 0; i < favoritesCopy.length; i++) {
                if (favoritesCopy[i]._id === this.setId) {
                    flag = true;
                    break;
                }
            }
            this.isMaterialInFavorites = flag;
        },
        methods: {
            ...mapActions(['favoritesAdd', 'favoritesRemove']),
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
        grid-template-columns: 1fr 90px;
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
        background-image: url("../assets/icons/play-white.svg");
        background-color: #3EAF7C;
        background-size: 35px 35px;
        background-repeat: no-repeat;
        background-position: center center;
        display: block;
        width: 35px;
        height: 35px;
        color: white;
        border-radius: 50%;
        transition: background-color .2s, opacity .1s;

        &:hover {
            cursor: pointer;
            background-color: #4EBF8C;
        }
    }

    .btns {
        width: 100%;
        gap: 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .btn {
        background-color: initial;
        background-size: 20px 20px;
        background-repeat: no-repeat;
        background-position: center center;
        padding-bottom: .2em;
        color: black;
        width: 35px;
        height: 35px;
        &:hover {
            cursor: pointer;
            background-color: initial;
        }
    }
    .favorites-add-btn {
        background-image: url("../assets/icons/favorites-add-gold.svg");
    }
    .favorites-remove-btn {
        background-image: url("../assets/icons/favorites-remove.svg");
    }
    .edit-btn {
        background-image: url("../assets/icons/edit.svg");
    }
    .delete-btn {
        background-image: url("../assets/icons/delete.svg");
    }
</style>