<template>
    <section>
        <div class="card">
            {{currentCardText}}
        </div>
        <div class="buttons">
            <button type="button" class="btn incorrect" @click="answer(false)" :disabled="!currentCardFlipped">✕</button>
            <button type="button" class="btn flip" @click="flip">Перевернуть</button>
            <button type="button" class="btn correct" @click="answer(true)" :disabled="!currentCardFlipped">✓</button>
        </div>
    </section>
</template>

<script>
    import store from "../store";
    import router from "../router";

    let answers = [];
    let cards = [];

    export default {
        name: "Study",
        data() {
            return {
                setId: this.$route.params.setId,
                currentCardIdx: -1,
                currentCardText: null,
                currentCardSide: 0,
                currentCardFlipped: false,
            }
        },
        async beforeMount() {
            this.cards = await store.dispatch('request', {
                method: "GET",
                path: `materials/sets/${this.setId}`
            });
            this.nextCard();
        },
        methods: {
            flip() {
                this.currentCardFlipped = true;
                if (this.currentCardSide === 0) {
                    this.currentCardSide = 1;
                    this.currentCardText = this.cards[this.currentCardIdx].answer;
                } else {
                    this.currentCardSide = 0;
                    this.currentCardText = this.cards[this.currentCardIdx].question;
                }
            },
            answer(correct) {
                answers.push({
                    idx: this.cards[this.currentCardIdx].idx,
                    correct: correct
                });
                this.nextCard();
            },
            nextCard() {
                this.currentCardIdx++;
                if (this.currentCardIdx >= this.cards.length) {
                    this.save();
                } else {
                    this.currentCardText = this.cards[this.currentCardIdx].question;
                    this.currentCardSide = 0;
                    this.currentCardFlipped = false;
                }
            },
            async save() {
                const result = await store.dispatch('request', {
                    path: "studies",
                    method: "POST",
                    body: JSON.stringify({
                        materialType: "set",
                        materialId: this.setId,
                        items: answers
                    })
                });
                if (!result.hasOwnProperty('error')) {
                    await router.push("/");
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
        &.incorrect {
            background-color: #E95252;
            &:hover {
                background-color: #EC5555;
            }
        }
        &.flip {
            width: max-content;
            padding: 0 15px;
            background-color: #A1C4FD;
            &:hover {
                background-color: #A4C7FF;
            }
        }
        &.correct {
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
</style>