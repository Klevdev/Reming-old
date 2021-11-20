<template>
    <section>
        <h1>Создание нового набора карточек</h1>
        <form @submit.prevent="submitForm">
            <Input v-model="formData.title" :attributes="inputAttributes.title"/>
            <label for="description">Описание</label>
            <textarea v-model="formData.description" name="description" id="description" placeholder="Карточки для подготовки к экзамену" maxlength="100"></textarea>
            <Checkbox v-model="formData.isPublic" :attributes="inputAttributes.isPublic"/>
            <p>Карточки набора</p>
            <div class="cards">
                <div class="card" v-for="(card, index) in formData.cards" :key="index">
                    <div style="width: 15px">{{index+1}}</div>
                    <div>
                        <textarea v-model="formData.cards[index].question" placeholder="Лицевая сторона (вопрос)" maxlength="100"></textarea>
                    </div>
                    <div>
                        <textarea v-model="formData.cards[index].answer" placeholder="Обратная сторона (ответ)" maxlength="100"></textarea>
                    </div>
                    <div class="card-btns">
                        <button type="button" class="btn-remove-card" @click="removeCard(index)"></button>
                        <button type="button" class="btn-flip-card" @click="flipCard(index)"></button>
                        <input type="checkbox" v-model="formData.cards[index].isFlippable">
                    </div>
                </div>
            </div>
            <button type="button" @click="addCard">Добавить карточку</button>
            <button type="submit" :disabled="formHasError">{{setId ? 'Подтвердить' : 'Создать' }}</button>
            <button type="button" class="delete-btn" v-if="this.setId" @click="deleteSet">Удалить набор</button>
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
            deleteSet() {
                if (confirm("Вы уверены, что хотите удалить набор?")) {
                    store.dispatch('deleteSet', this.setId);
                    router.push('Materials');
                }
            }
        },
        async beforeMount() {
            this.setId = this.$route.params.setId
            if (this.setId !== "" && this.setId !== undefined && this.setId !== null) {
                this.formData = await store.dispatch('getSet', this.setId);
                delete this.formData.author;
                delete this.formData.creationDate;
                this.formData.cards = await store.dispatch('getSetCards', this.setId);
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
        max-width: 250px;
        height: 100%;
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
        background: #E95252;
        width: 20px;
        height: 20px;
        &:hover {
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