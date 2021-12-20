<template>
    <div class="material-info">
        <div class="material-header">
            <h2>{{material.title}}</h2>
            <div class="btns" style="justify-content: flex-end">
                <button v-if="!isMaterialInFavorites" type="button" class="btn favorites-add-btn" @click="() => _favoritesAdd(id)"></button>
                <button v-if="isMaterialInFavorites" type="button" class="btn favorites-remove-btn" @click="() => _favoritesRemove(id)"></button>
                <button v-if="material.author === userName" type="button" class="btn edit-btn" @click="this.$router.push(`/editor/${material.type}/${id}`)"></button>
                <button v-if="material.author === userName" type="button" class="btn delete-btn" @click="deleteSet"></button>
            </div>
        </div>
        <dl>
            <dt v-if="material.description">Описание</dt>
            <dd v-if="material.description" style="overflow: hidden;text-overflow: ellipsis;">{{material.description}}</dd>
            <dt>Доступен в библиотеке</dt>
            <dd>{{material.isPublic ? 'Да' : 'Нет'}}</dd>
            <dt>Автор</dt>
            <dd>{{material.author}}</dd>
            <dt>Дата создания</dt>
            <dd>{{material.timeCreated}}</dd>
            <dt v-if="material.timeUpdated">Последнее изменение</dt>
            <dd v-if="material.timeUpdated">{{material.timeUpdated}}</dd>
            <dt>Теги</dt>
            <dd>Скоро будут</dd>
        </dl>
        <router-link v-if="material.type === 'collection'" :to="'/materials/collections/'+material._id">Перейти в коллекцию</router-link>
        <div class="btns">
            <router-link v-if="material.type === 'set'" class="start-btn" :to="'/study/'+id"/>
        </div>
    </div>
</template>

<script>
    import store from "../store";
    import router from "../router";
    import {mapState, mapMutations, mapActions} from "vuex";

    export default {
        name: "MaterialPage",
        data() {
            return {
                id: this.$route.params.id,
                material: {},
                isMaterialInFavorites: false,
            }
        },
        computed: {
            ...mapState(['userLoggedIn', 'userName', 'favorites'])
        },
        async created() {
            this.material = await store.dispatch('request', {
                path: `materials/${this.id}`,
                method: "GET"
            });
            if (this.material.hasOwnProperty('error')) {
                router.go(-1);
            }
            this.material.timeCreated = new Date(this.material.timeCreated).toLocaleDateString("ru-RU");
            if (this.material.timeUpdated) this.material.timeUpdated = new Date(this.material.timeUpdated).toLocaleDateString("ru-RU");

            store.commit('updateRecentMaterials', {
                _id: this.id,
                title: this.material.title
            });

            let favoritesCopy = JSON.parse(JSON.stringify(this.favorites));

            let flag = false;
            for (let i = 0; i < favoritesCopy.length; i++) {
                if (favoritesCopy[i]._id === this.id) {
                    flag = true;
                    break;
                }
            }
            this.isMaterialInFavorites = flag;
        },
        methods: {
            ...mapMutations(['removeFromRecentMaterials']),
            ...mapActions(['favoritesAdd', 'favoritesRemove']),
            async _favoritesAdd(id) {
                if (!this.userLoggedIn) {
                    store.commit('popupShow',{
                        type: 'info',
                        message: 'Войдите в профиль чтобы добавить материал в избранное'
                    });
                    return;
                }
                await this.favoritesAdd(id);
                this.isMaterialInFavorites = true;
            },
            async _favoritesRemove(id) {
                await this.favoritesRemove(id);
                this.isMaterialInFavorites = false;
            },
            async deleteSet() {
                if (confirm("Вы уверены, что хотите удалить набор?")) {
                    const res = await store.dispatch('request',{
                        path: `materials/sets/${this.id}`,
                        method: 'DELETE',
                    });
                    if (!res.hasOwnProperty('error')) {
                        store.commit('popupShow',{
                            type: 'success',
                            message: 'Материал удалён'
                        });
                        this.removeFromRecentMaterials({_id: this.id});
                        this.favoritesRemove(this.id)
                        router.push({name: 'MyMaterials'});
                    }
                }
            }
        }
    }
</script>

<style scoped lang="scss">
    .material-info {
        margin: 0 auto;
        width: 460px;
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

    .material-header {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr 90px;
        align-items: center;

        & > h2 {
            text-align: left;
        }
    }

    dl {
        display: grid;
        gap: 10px;
        grid-template-columns: repeat(2, 1fr);
        & > dt {
            text-align: left;
            font-weight: bold;
        }
        & > dd {
            text-align: left;
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