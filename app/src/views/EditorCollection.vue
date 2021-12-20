<template>
    <section>
        <h1>{{(id ? 'Редактирование ' : 'Создание ') + 'коллекции'}}</h1>
        <form @submit.prevent="submitForm">
            <Input v-model="formData.title" :attributes="inputAttributes.title"/>
            <label for="description">Описание</label>
            <textarea v-model="formData.description" name="description" id="description" placeholder="Наборы по математике" maxlength="100"></textarea>
            <Checkbox v-model="formData.isPublic" :attributes="inputAttributes.isPublic"/>
            <p>Добавить материалы</p>
            <div class="materials-list">
                <p v-if="!userMaterials.length" style="font-size: .8em; text-align: left;">
                    У вас нет материалов, которые можно добавить
                </p>
                <div class="material"  v-for="(material, index) in userMaterials">
                    <button type="button" class="btn-add-material" @click="addMaterial(index)"></button>
                    <div class="material-title" :class="material.type">{{material.title}}</div>
                    <div class="material-time">{{new Date(material.timeCreated).toLocaleDateString("ru-RU")}}</div>
                    <div v-if="material.description" class="material-description">{{material.description}}</div>
                    <div v-if="!material.description" style="color: #AAA">Без описания</div>
                </div>
            </div>
            <p>Материалы коллекции</p>
            <p v-if="!formData.materials.length" style="font-size: .8em; text-align: left;">
                В коллекции нет материалов
            </p>
            <div v-if="formData.materials.length" class="materials-list">
                <div class="material" v-for="(material, index) in formData.materials">
                    <button type="button" class="btn-remove-material"  @click="removeMaterial(index)"></button>
                    <div class="material-title" :class="material.type">{{material.title}}</div>
                    <div class="material-time">{{new Date(material.timeCreated).toLocaleDateString("ru-RU")}}</div>
                    <div v-if="material.description" class="material-description">{{material.description}}</div>
                    <div v-if="!material.description" style="color: #AAA">Без описания</div>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 20px">
                <button type="submit" :disabled="formHasError">{{id ? 'Подтвердить' : 'Создать' }}</button>
                <a @click="this.$router.back()">Отмена</a>
            </div>
        </form>
    </section>
</template>

<script>
    import Input from '../components/Input';
    import Checkbox from '../components/Checkbox';
    import store from "../store";
    import {mapState} from "vuex";
    import router from "../router";

    export default {
        name: "EditorCollection",
        components: {
            Input,
            Checkbox
        },
        props: {
            id: {
                type: String,
                required: false,
            }
        },
        data() {
            return {
                userMaterials: [],
                formData: {
                    title: "",
                    description: "",
                    isPublic: false,
                    materials: []
                },
                inputAttributes: {
                    title: {
                        label: "Название коллекции",
                        name: "title",
                        type: "text",
                        placeholder: "Мои наборы",
                        prompt: "",
                        rules: {
                            required: true
                        }
                    },
                    isPublic: {
                        label: "Доступен из библиотеки",
                        name: "cb-is-public"
                    },
                }
            }
        },
        methods: {
            addMaterial(index) {
                let addedMaterial = this.userMaterials[index];
                this.formData.materials.push(addedMaterial);
                this.userMaterials.splice(index, 1);
            },
            removeMaterial(index) {
                let addedMaterial = this.formData.materials[index];
                this.userMaterials.push(addedMaterial);
                this.formData.materials.splice(index, 1);
            },
            async submitForm() {
                this.formData.materials = this.formData.materials.map(item => item._id);
                // this.formData.materials.forEach(item => item._id);
                let result = await store.dispatch('request', {
                    path: 'materials/collections' + (this.id ? `/${this.id}` : ''),
                    method: this.id ? 'PUT' : 'POST',
                    body: JSON.stringify(this.formData)
                });
                if (!result.hasOwnProperty('error')) {
                    store.commit('popupShow', {
                        type: 'success',
                        message: this.id ? 'Изменения сохранены' : 'Набор сохранён'
                    })
                    await router.push(`/materials/${result.id}`)
                }
            },
        },
        async created() {
            if (this.id !== "" && this.id !== undefined) {
                console.log("Все ошибки ниже можно проигнорировать (П - профессионализм)")
                this.formData = await store.dispatch('request', {
                    path: `materials/${this.id}`,
                    method: 'GET'
                });
                delete this.formData.author;
                delete this.formData.timeCreated;
                let materials = await store.dispatch('request', {
                    path: `materials/collections/${this.id}`,
                    method: 'GET'
                });
                if (materials.hasOwnProperty('error')) {
                    this.formData.materials = [];
                } else {
                    this.formData.materials = materials.materials;
                }
            }
            let userMaterials = await store.dispatch('request', {
                path: `materials/personal`,
                method: 'GET'
            });
            if (userMaterials.hasOwnProperty('error')) {
                router.back();
            } else {
                let collectionMaterialsIds = this.formData.materials.map(item => item._id);
                this.userMaterials = userMaterials.filter(item => collectionMaterialsIds.indexOf(item._id) === -1);
                if (this.id) {
                    this.userMaterials = userMaterials.filter(item => item._id !== this.id);
                }
            }
        },
        computed: {
            ...mapState(['formHasError'])
        },
        unmounted() {
            store.commit('formErrorSolved');
        },
    }
</script>

<style scoped lang="scss">

    section {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 20px;
    }

    form {
        box-shadow: 0 0 10px #2c3e5033, 0 20px 20px #2c3e5011;
        width: 500px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: 10px;
        background-color: #FAFAFA;
        padding: 20px 25px;
        border-radius: 0px;
        border: 1px solid #DDD;
    }

    textarea {
        min-width: 100px;
        width: 100%;
        /*max-width: 250px;*/
        height: 70px;
        background-color: #FFFFFF;
        border: 1px solid #4285F4;
        border-radius: 3px;
        padding: 7px 10px;
        transition: background-color .2s, border-color .2s;
        resize: none;

        &:focus, &:active {
            border-color: #A1C4FD;
        }
    }

    .materials-list {
        width: 100%;
        display: flex;
        flex-direction: column;
        row-gap: 5px;
    }

    .material {
        width: 100%;
        background-color: #fff;
        border-radius: 3px;
        text-align: left;
        height: max-content;
        padding: 10px;
        display: grid;
        grid-template-columns: 20px 1fr max-content;
        grid-template-rows: 1em 1em;
        gap: 1em;
        border: 1px solid #DDD;

        /*&:not(:first-child) {*/
        /*    border-top: 1px solid #AAA;*/
        /*}*/
        & > .material-title {
            /*text-wrap: normal;*/
            overflow: hidden;
            text-overflow: ellipsis;
            padding-left: 20px;
            background-position: center left;
            background-size: 15px 15px;
            background-repeat: no-repeat;
            justify-self: flex-start;
            font-weight: bold;
            &.set {
                background-image: url("../assets/icons/set-black.svg");
            }
            &.collection {
                background-image: url("../assets/icons/folder.svg");
            }
        }
        & > .material-time {
            justify-self: flex-end;

        }
        & > .material-description {
            grid-column: 2/4;
            /*text-wrap: normal;*/
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }

    .btn-add-material, .btn-remove-material {
        align-self: center;
        grid-row: 1/3;
        width: 20px;
        height: 20px;
        background-color: initial;
        background-size: 20px 20px;
        background-position: center center;
        background-repeat: no-repeat;

        &.btn-remove-material {
            background-image: url("../assets/icons/subtract.svg");
        }

        &.btn-add-material {
            background-image: url("../assets/icons/add.svg");
        }

        &:hover {
            cursor: pointer;
            background-color: initial;
        }

    }



</style>