<template>
    <section>
        <h1>Регистрация</h1>
        <form @submit.prevent="submitForm">
            <Input v-model="formData.name" :attributes="inputAttributes.name"/>
            <Input v-model="formData.email" :attributes="inputAttributes.email"/>
            <Input v-model="formData.password" :attributes="inputAttributes.password"/>
            <Input v-model="passwordRepeat" :attributes="inputAttributes.passwordRepeat"/>
            <button type="submit" :disabled="formHasError">Зарегистроваться</button>
        </form>
        <p>
            <router-link to="/login">Войти</router-link>
        </p>
    </section>
</template>

<script>
    import Input from '@/components/Input.vue';
    import router from "../router";
    import store from "../store";
    import {mapState} from "vuex";

    export default {
        name: "Signup",
        components: {
            Input,
        },
        computed: {
            ...mapState(['formHasError'])
        },
        unmounted() {
            store.commit('formErrorSolved');
        },
        data() {
            return {
                inputAttributes: {
                    name: {
                        label: "Ваше имя",
                        name: "name",
                        type: "text",
                        placeholder: "Александр",
                        prompt: "",
                        rules: {
                            required: true,
                            lengthRange: [2, 30],
                            restrictedChars: '!#$^*(){};:|/'
                        },
                    },
                    email: {
                        label: "E-mail",
                        name: "email",
                        type: "email",
                        placeholder: "example@email.com",
                        prompt: "",
                        rules: {
                            required: true,
                            lengthRange: [5, 30],
                            email: true
                        },
                    },
                    password: {
                        label: "Пароль",
                        name: "password",
                        type: "password",
                        placeholder: "Пароль",
                        prompt: "",
                        rules: {
                            required: true,
                            lengthRange: [8, 30],
                        },
                    },
                    passwordRepeat: {
                        label: "Подтверждение пароля",
                        name: "password-repeat",
                        type: "password",
                        placeholder: "Пароль",
                        prompt: "",
                        rules: {
                            required: true
                        },
                    },
                },
                formData: {
                    name: null,
                    email: null,
                    password: null,
                },
                passwordRepeat: null,
            }
        },
        methods: {
            async submitForm() {
                let res = await store.dispatch("request", {
                    method: "POST",
                    path: "users/signup",
                    body: JSON.stringify(this.formData)
                });
                if (res) {
                    store.commit('userLogIn', {name: res.name, auth: res.auth});
                    await router.push('/');
                }
            }
        },
    }
</script>

<style scoped>
    section {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 20px;
    }

    form {
        box-shadow: 0 0 10px #2c3e5033, 0 20px 20px #2c3e5011;
        width: 250px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: 10px;
        background-color: #FAFAFA;
        padding: 20px 25px;
        border-radius: 5px;
    }

</style>