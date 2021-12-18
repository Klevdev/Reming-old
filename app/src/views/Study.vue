<template>
    <section v-if="!studyComplete">
        <div class="card" :class="cardAnimation">
            {{currentCardText}}
        </div>
        <div class="buttons">
            <button type="button" class="btn incorrect-btn" @click="answer(false)" :disabled="!currentCardFlipped || cardAnimation">✕</button>
            <button type="button" class="btn flip-btn" @click="flip" :disabled="cardAnimation">Перевернуть</button>
            <button type="button" class="btn correct-btn" @click="answer(true)" :disabled="!currentCardFlipped || cardAnimation">✓</button>
        </div>
    </section>
    <section v-else>
        <div class="end-screen">
            <h1>Итог</h1>
            <div>
                <span style="color: #3EAF7C; margin-right: 10px">{{this.getCorrect().length}}</span>
                <span style="color: #E95252; margin-right: 10px">{{this.getIncorrect().length}}</span>
                <span>{{getPercentage()}}%</span>
            </div>
            <h2>Отвечены верно:</h2>
            <ul>
                <li v-for="(answer) in this.getCorrect()">
                    {{this.cards[answer.idx].idx}}) {{this.cards[answer.idx].question}} - {{this.cards[answer.idx].answer}}
                </li>
            </ul>
            <h2>Отвечены неверно:</h2>
            <ul>
                <li v-for="(answer) in this.getIncorrect()">
                    {{this.cards[answer.idx].idx}}) {{this.cards[answer.idx].question}} - {{this.cards[answer.idx].answer}}
                </li>
            </ul>
            <button type="button" @click="this.save">{{userLoggedIn ? 'Завершить и сохранить' : 'Завершить'}}</button>
        </div>
    </section>
</template>

<script>
    import store from "../store";
    import router from "../router";
    import {mapState} from "vuex";

    let answers = [];
    let cards = [];

    export default {
        name: "Study",
        data() {
            return {
                studyComplete: false,
                setId: this.$route.params.setId,
                currentCardIdx: -1,
                currentCardText: null,
                currentCardSide: 0,
                currentCardFlipped: false,

                cardAnimation: null, // 'appear'/'flip'/'correct'/'incorrect'
            }
        },
        computed: {
            ...mapState(['userLoggedIn'])
        },
        async created() {
            this.cards = await store.dispatch('request', {
                method: "GET",
                path: `materials/sets/${this.setId}`
            });
            if (this.cards.hasOwnProperty('error')) {
                router.go(-1);
            }
            this.nextCard();
        },
        methods: {
            flip() {
                this.cardAnimation = 'flip';
                setTimeout(() => {
                    this.cardAnimation = null;
                }, 500);
                this.currentCardFlipped = true;
                if (this.currentCardSide === 0) {
                    this.currentCardSide = 1;
                    setTimeout(() => {
                        this.currentCardText = this.cards[this.currentCardIdx].answer;
                    }, 250);
                } else {
                    this.currentCardSide = 0;
                    setTimeout(() => {
                        this.currentCardText = this.cards[this.currentCardIdx].question;
                    }, 250);
                }
            },
            answer(correct) {
                answers.push({
                    idx: this.cards[this.currentCardIdx].idx,
                    correct: correct
                });
                this.cardAnimation = correct ? 'correct' : 'incorrect';
                setTimeout(() => {
                    this.cardAnimation = null;
                    this.nextCard();
                }, 500)
            },
            nextCard() {
                this.cardAnimation = 'appear';
                setTimeout(() => {
                    this.cardAnimation = null;
                }, 500)
                this.currentCardIdx++;
                if (this.currentCardIdx >= this.cards.length) {
                    // this.save();
                    this.studyComplete = true;
                } else {
                    this.currentCardText = this.cards[this.currentCardIdx].question;
                    this.currentCardSide = 0;
                    this.currentCardFlipped = false;
                }
            },
            getCorrect() {
                return answers.filter(answer => answer.correct);
            },
            getIncorrect() {
                return answers.filter(answer => !answer.correct);
            },
            getPercentage() {
                return Math.round(this.getCorrect().length / answers.length * 10000) / 100;
            },
            async save() {
                if (!this.userLoggedIn) {
                    store.commit('popupShow', {
                        type: 'info',
                        message: 'Для сохранения результатов войдите в аккаунт'
                    })
                    await router.push("/");
                } else {
                    const result = await store.dispatch('request', {
                        path: "studies",
                        method: "POST",
                        body: JSON.stringify({
                            materialType: "set",
                            materialId: this.setId,
                            correctCount: this.getCorrect().length,
                            incorrectCount: this.getIncorrect().length,
                            items: answers
                        })
                    });
                    answers = [];
                    if (!result.hasOwnProperty('error')) {
                        store.commit('popupShow', {
                            type: 'success',
                            message: 'Ваш результат сохранён'
                        })
                        router.go(-1);
                    }
                }
            }
        }
    }
</script>

<style scoped lang="scss">
    section {
        height: 60vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-around;;
    }

    @keyframes appear {
        0% {
            opacity: 0;
            top: -250px;
        }
        100% {
            opacity: 1;
            top: 0;
        }
    }

    @keyframes flip {
        0% {
            transform: scaleX(1);
        }
        50% {
            transform: scaleX(0);
        }
        100% {
            transform: scaleX(1);
        }
    }
    @keyframes correct {
        0% {
            opacity: 1;
            left: 0;
        }
        100% {
            opacity: 0;
            left: 250px;
        }
    }
    @keyframes incorrect {
        0% {
            opacity: 1;
            right: 0;
        }
        100% {
            opacity: 0;
            right: 250px;
        }
    }
    .appear {
        animation: appear .5s forwards;
    }
    .flip {
        animation: flip .5s forwards;
    }
    .correct {
        animation: correct .5s forwards;
    }
    .incorrect {
        animation: incorrect .5s forwards;
    }

    .card {
        position: relative;
        margin: 0 auto;
        font-size: 1.5em;
        width: 300px;
        height: 170px;
        box-shadow: 0 0 10px #2c3e5033, 0 20px 20px #2c3e5011;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-color: #FAFAFA;
        padding: 20px 25px;
        border-radius: 5px;
    }

    /*.appear-enter, .appear-leave {*/
    /*    top: 500px;*/
    /*}*/
    /*.fade-enter-to {*/
    /*    top: 0;*/
    /*}*/

    .buttons {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        gap: 25px;
    }

    .btn {
        padding: 0 0 0 1.5px;
        color: white;
        font-size: 1.2em;
        background-color: #3EAF7C;
        border-radius: 20px;
        width: 40px;
        height: 40px;
        transition: background-color .2s;
        &:hover {
            cursor: pointer;
        }
        &.incorrect-btn {
            background-color: #E95252;
            &:hover {
                background-color: #EC5555;
            }
        }
        &.flip-btn {
            width: max-content;
            padding: 0 15px;
            background-color: #A1C4FD;
            &:hover {
                background-color: #A4C7FF;
            }
        }
        &.correct-btn {
            background-color: #3EAF7C;

            &:hover {
                background-color: #4EBF8C;
            }
        }
        &[disabled] {
            background-color: #AAAAAA;

            &:hover {
                background-color: #AAAAAA;
                cursor: default;
            }
        }
    }
    .end-screen {
        margin: 0 auto;
        width: 500px;
        height: max-content;
        box-shadow: 0 0 10px #2c3e5033, 0 20px 20px #2c3e5011;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        background-color: #FAFAFA;
        padding: 20px 25px;
        border: 1px solid #DDD;

        &>ul {
            list-style: none;
            text-align: left;
        }
    }
</style>