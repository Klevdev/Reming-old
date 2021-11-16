<template>
    <section>
        <h1>Создание нового набора карточек</h1>
        <form @submit.prevent="submitForm">
            <Input v-model="formData.title" :attributes="inputAttributes.title"/>
            <label for="description">Описание</label>
            <textarea v-model="formData.description" name="description" id="description" placeholder="Карточки для подготовки к экзамену"></textarea>
            <Checkbox v-model="formData.isPublic" :attributes="inputAttributes.isPublic"/>
            <p>Карточки набора</p>
            <div class="cards">
                <div class="card" v-for="(card, index) in formData.cards" :key="index">
                    <div style="width: 15px">{{index+1}}</div>
                    <div>
                        <textarea v-model="formData.cards[index].question" placeholder="{{card.question}}"></textarea>
                    </div>
                    <div>
                        <textarea v-model="formData.cards[index].answer" placeholder="{{card.answer}}"></textarea>
                    </div>
                    <div class="card-btns">
                        <button class="btn-remove-card" @click="removeCard(index)"></button>
                        <button class="btn-flip-card" @click="flipCard(index)"></button>
                        <input type="checkbox" v-model="formData.cards[index].isFlippable">
                    </div>
                </div>
            </div>
            <button type="button" @click="addCard">Добавить карточку</button>
            <button type="submit" :disabled="formHasError">Создать</button>
        </form>
    </section>
</template>

<script>
    import Input from '@/components/Input';
    import Checkbox from '@/components/Checkbox';
    import router from "../router";
    import store from "../store";
    import {mapState, mapActions} from "vuex";

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
                    cards: []
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
                    }
                }
            }
        },
        methods: {
            submitForm() {
                store.dispatch('sendSet', this.formData);
            },
            addCard() {
                this.formData.cards.push({
                    question: "Сторона 1",
                    answer: "Сторона 2",
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
            // ...mapActions(['sendSet'])
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
        max-width: 250px;
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
        display: flex;
        flex-direction: row;
        gap: 7px;
        padding: 10px 0;
        &:not(:last-child) {
            border-bottom: 1px solid #AAA;
        }
    }

    .card-btns {
        display: flex;
        flex-direction: column;
        gap: 7px;
    }

    .btn-flip-card {
        background: #4285F4;
        width: 20px;
        height: 20px;
        &:hover {
            cursor: pointer;
        }
    }

    .btn-remove-card {
        background: red;
        width: 20px;
        height: 20px;
        &:hover {
            cursor: pointer;
        }
    }

    .error-block {
        max-width: 250px;
        padding: 20px 25px;
        background-color: #FF000088;
        border-radius: 5px;
        box-shadow: 0 0 10px #2c3e5033, 0 20px 20px #2c3e5011;
    }

    .error {
        font-size: .8em;
        text-align: left;
        font-weight: bold;
    }

    .error-list {
        font-size: .8em;
        list-style: none;
        text-align: left;
    }
</style>