<template>
    <section>
        <h1>Создание нового набора карточек</h1>
        <form @submit.prevent="submitForm">
            <Input v-model="formData.title" :attributes="inputAttributes.title"/>
            <label for="description">Описание</label>
            <textarea v-model="formData.description" name="description" id="description" placeholder="Карточки для подготовки к экзамену" maxlength="100"></textarea>
            <Checkbox v-model="formData.isPublic" :attributes="inputAttributes.isPublic"/>
            <span v-if="formData.cards.length">Карточки набора: {{this.formData.cards}}</span>
            <div class="cards">
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
            <button type="submit" :disabled="formHasError">{{formData.setId ? 'Подтвердить' : 'Создать' }}</button>
            <button type="button" class="delete-btn" v-if="this.formData.setId" @click="deleteSet">Удалить набор</button>
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
        name: "Editor",
        components: {
            Input,
            Checkbox
        },
        data() {
            return {
                formData: {
                    title: "",
                    description: "",
                    isPublic: false,
                    cards: [],
                    setId: null,
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
                    path: 'materials/sets' + (this.setId ? `/${this.setId}` : ''),
                    method: this.setId ? 'PUT' : 'POST',
                    body: JSON.stringify(this.formData)
                });
                if (!result.hasOwnProperty('error')) {
                    const setId = result.id;
                    await router.push(`/material/${setId}`)
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
                this.formData.cards.splice(index, 1);
            },
            flipCard(index) {
                let firstSide = this.formData.cards[index].question;
                this.formData.cards[index].question = this.formData.cards[index].answer;
                this.formData.cards[index].answer = firstSide;
            },
        },
        async beforeMount() {
            console.log("Все ошибки ниже можно проигнорировать (П - профессионализм)")
            this.setId = this.$route.params.setId;
            if (this.setId !== "" && this.setId !== undefined && this.setId !== null) {
                this.formData = await store.dispatch('request', {
                    path: `materials/${this.setId}`,
                    method: 'GET'
                });
                delete this.formData.author;
                delete this.formData.timeCreated;
                this.formData.cards = await store.dispatch('request', {
                    path: `materials/sets/${this.setId}`,
                    method: 'GET'
                });
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
        border-radius: 5px;
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

    .cards {
        display: flex;
        flex-direction: column;
    }

    .card {
        height: 120px;
        padding: 7px 0;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        align-items: center;
        column-gap: 7px;
        &:not(:first-child) {
            border-top: 1px solid #AAA;
        }
    }

    .card-idx-delete {
        width: 25px;
        height: 50%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
    }

    .card-options {
        padding-left: 32px;
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