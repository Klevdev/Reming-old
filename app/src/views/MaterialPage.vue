<template>
    <div class="material-info">
        <div class="material-header">
            <h2>{{material.title}}</h2>
            <div class="material-options">
                <button v-if="!isMaterialInFavorites" type="button" class="btn btn-favorites-add" @click="() => _favoritesAdd(id)"></button>
                <button v-if="isMaterialInFavorites" type="button" class="btn btn-favorites-remove" @click="() => _favoritesRemove(id)"></button>
                <button v-if="material.author === userName" type="button" class="btn btn-edit" @click="this.$router.push(`/editor/${material.type}/${id}`)"></button>
                <button v-if="material.author === userName" type="button" class="btn danger btn-delete" @click="deleteSet"></button>
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
        <div v-if="material.type === 'set'" class="study">
            <router-link class="btn-start" :to="{name: 'Study', params: {id: id}, query: {shuffle: shuffleStudy}}">Пройти набор</router-link>
            <Checkbox v-model="shuffleStudy" :attributes="{name: 'shuffle', label: 'Перемешать карточки'}"/>
        </div>
    </div>
</template>

<script>
    import store from "../store";
    import router from "../router";
    import {mapState, mapMutations, mapActions} from "vuex";
    import Checkbox from "../components/Checkbox";

    export default {
        name: "MaterialPage",
        components: {
            Checkbox
        },
        data() {
            return {
                id: this.$route.params.id,
                material: {},
                isMaterialInFavorites: false,
                shuffleStudy: false,
                showCardIdx: false
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

    .material-options {
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        gap: 10px;
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

    .btn-start {
        background-image: url("../assets/icons/play-white.svg");
        background-color: #3EAF7C;
        background-size: 35px 35px;
        background-repeat: no-repeat;
        background-position: center left;
        padding: 0 17.5px 0 35px;
        display: flex;
        align-items: center;
        height: 35px;
        color: white;
        border-radius: 17.5px;
        transition: background-color .2s, opacity .1s;

        &:hover {
            cursor: pointer;
            background-color: #4EBF8C;
        }
    }

    .study {
        width: 100%;
        row-gap: 7px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: flex-start;
    }

    .btn {
        background-size: 20px 20px;
        background-repeat: no-repeat;
        background-position: center center;
        width: 20px;
        height: 20px;
        padding: 15px;
        &:hover {
            cursor: pointer;
        }
    }
    .btn-favorites-add {
        background-image: url("../assets/icons/favorites-add-white.svg");
    }
    .btn-favorites-remove {
        background-image: url("../assets/icons/favorites-remove-white.svg");
    }
    .btn-edit {
        background-image: url("../assets/icons/edit-white.svg");
    }
    .btn-delete {
        background-image: url("../assets/icons/delete-white.svg");
    }

</style>