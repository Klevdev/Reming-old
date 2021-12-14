<template>
    <section>
        <h1>Вход</h1>
        <form @submit.prevent="submitForm">
            <Input v-model="formData.email" :attributes="inputAttributes.email"/>
            <Input v-model="formData.password" :attributes="inputAttributes.password"/>
            <button type="submit" :disabled="formHasError">Войти</button>
        </form>
        <p>
            <router-link to="/signup">Зарегистрироваться</router-link>
        </p>
    </section>
</template>

<script>
    import Input from '@/components/Input.vue';
    import router from "../router";
    import store from "../store";
    import {mapState} from "vuex";

    export default {
        name: "Login",
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
                formData: {
                    email: null,
                    password: null,
                },
                inputAttributes: {
                    email: {
                        label: "E-mail",
                        name: "email",
                        type: "email",
                        placeholder: "myemail@gmail.com",
                        prompt: "",
                        rules: {
                            required: true,
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
                        },
                    },
                }
            }
        },
        methods: {
            async submitForm() {
                let res = await store.dispatch("request", {
                    method: "POST",
                    path: "users/login",
                    body: JSON.stringify(this.formData)
                });
                if (!res.hasOwnProperty('error')) {
                    store.commit('userLogIn', {name: res.name, token: res.auth});
                    await router.push('/');
                }
            }
        }
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
        border-radius: 0px;
        border: 1px solid #DDD;
    }

</style>