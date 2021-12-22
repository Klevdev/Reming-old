<template>
    <section>
        <h1>{{(id ? 'Редактирование ' : 'Создание ') + 'набора'}}</h1>
        <form @submit.prevent="submitForm">
            <Input v-model="formData.title" :attributes="inputAttributes.title"/>
            <label for="description">Описание</label>
            <textarea v-model="formData.description" name="description" id="description" placeholder="Карточки для подготовки к экзамену" maxlength="100"></textarea>
            <Checkbox v-model="formData.isPublic" :attributes="inputAttributes.isPublic"/>
            <span v-if="formData.cards.length" style="text-align: left">Карточки набора:</span>
            <div v-if="formData.cards.length" class="cards">
                <div class="card" v-for="(card, index) in formData.cards" :key="index">
                    <div class="card-idx-delete">
                        <span>{{index+1}}</span>
                        <button type="button" class="btn-remove-card" @click="removeCard(index)"></button>
                    </div>
                    <div>
                        <textarea v-model="formData.cards[index].question" placeholder="Лицевая сторона" maxlength="100"></textarea>
                    </div>
                    <button type="button" class="btn-flip-card" @click="flipCard(index)"></button>
                    <div>
                        <textarea v-model="formData.cards[index].answer" placeholder="Обратная сторона" maxlength="100"></textarea>
                    </div>
                    <div class="card-options" style="font-size: 0.8em">
                        <Checkbox v-model="formData.cards[index].isFlippable" :attributes="inputAttributes.isFlippable" :idx="index"/>
                    </div>
                </div>
            </div>
            <button type="button" class="btn-add-card" @click="addCard">Добавить карточку</button>
            <div style="display: flex; align-items: center; gap: 20px">
                <button type="submit" :disabled="formHasError">{{id ? 'Подтвердить' : 'Создать' }}</button>
                <a @click="this.$router.go(-1)">Отмена</a>
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
        name: "EditorSet",
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
                formData: {
                    title: "",
                    description: "",
                    isPublic: false,
                    cards: [],
                },
                inputAttributes: {
                    title: {
                        label: "Название набора",
                        name: "title",
                        type: "text",
                        placeholder: "Мой набор",
                        prompt: "",
                        rules: {
                            required: true
                        }
                    },
                    isPublic: {
                        label: "Доступен из библиотеки",
                        name: "cb-is-public"
                    },
                    isFlippable: {
                        label: "Может переворачиваться",
                        name: "cb-is-flippable"
                    }
                }
            }
        },
        methods: {
            async submitForm() {
                let result = await store.dispatch('request', {
                    path: 'materials/sets' + (this.id ? `/${this.id}` : ''),
                    method: this.id ? 'PUT' : 'POST',
                    body: JSON.stringify(this.formData)
                });
                if (!result.hasOwnProperty('error')) {
                    store.commit('popupShow', {
                        type: 'success',
                        message: this.id ? 'Изменения сохранены' : 'Набор сохранён'
                    });
                    store.commit('removeFromRecentMaterials', {
                        _id: this.id
                    });
                    await router.push(`/materials/${result.id}`)
                }
            },
            addCard() {
                this.formData.cards.push({
                    idx: this.formData.cards.length,
                    question: "",
                    answer: "",
                    isFlippable: false
                });
            },
            removeCard(index) {
                this.formData.cards.forEach(card => {
                    if (card.idx > index) card.idx--;
                });
                this.formData.cards.splice(index, 1);
            },
            flipCard(index) {
                let firstSide = this.formData.cards[index].question;
                this.formData.cards[index].question = this.formData.cards[index].answer;
                this.formData.cards[index].answer = firstSide;
            },
        },
        async created() {
            if (this.id !== "" && this.id !== undefined && this.id !== null) {
                console.log("Все ошибки ниже можно проигнорировать (П - профессионализм)")
                this.formData = await store.dispatch('request', {
                    path: `materials/${this.id}`,
                    method: 'GET'
                });
                delete this.formData.author;
                delete this.formData.timeCreated;
                let cards = await store.dispatch('request', {
                    path: `materials/sets/${this.id}`,
                    method: 'GET'
                });
                this.formData.cards = cards.hasOwnProperty('error') ? [] : cards;
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
        border: 1px solid #DDD;
    }

    textarea {
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

    .cards {
        width: calc(100% + 17px);
        max-height: 360px;
        overflow-y: scroll;
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .card-idx-delete {
        margin-left: 7px;
        width: 25px;
        height: 50%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
    }

    .card {
        height: 120px;
        padding: 7px 0;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        align-items: center;
        overflow-x: visible;
        column-gap: 7px;
        background-color: #fff;
        border: 1px solid #DDD;
        border-radius: 3px;

        /*&:not(:first-child) {*/
        /*    border-top: 1px solid #AAA;*/
        /*}*/
    }

    .card-options {
        padding-left: 39px;
        display: flex;
        flex-direction: row;
    }

    .btn-flip-card {
        background: url("../assets/icons/reverse.svg") center center no-repeat;
        background-size: 20px 20px;
        width: 20px;
        height: 20px;
        &:hover {
            cursor: pointer;
        }
    }

    .btn-remove-card {
        background: url("../assets/icons/subtract.svg") center center no-repeat;
        background-size: 20px 20px;
        width: 20px;
        height: 20px;
        &:hover {
            cursor: pointer;
        }
    }

    .btn-add-card {
        color: #333;
        padding-left: 25px;
        background: url("../assets/icons/add.svg") 0 center no-repeat;
        background-size: 20px 20px;
        &:hover {
            background-color: initial;
            cursor: pointer;
        }
    }

    .delete-btn {
        background: #E95252;
        &:hover {
            cursor: pointer;
            background: #EF5858;
        }
    }

</style>