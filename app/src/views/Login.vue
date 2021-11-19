<template>
    <section>
        <h1>Вход</h1>
        <form @submit.prevent="submitForm">
            <Input v-model="formData.login" :attributes="inputAttributes.login"/>
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
                    login: null,
                    password: null,
                },
                inputAttributes: {
                    login: {
                        label: "Логин",
                        name: "login",
                        type: "text",
                        placeholder: "MyLogin123",
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
            async fetchUser() {
                const res = await fetch('http://localhost:3000/user/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(this.formData),
                });
                return res.json();
            },
            async submitForm() {
                let res = await this.fetchUser();
                if (res.hasOwnProperty('error')) {
                    store.commit('popupShow',{
                        type: 'error',
                        message: res.error
                    });
                } else {
                    store.commit('userLogIn', {name: res.name, auth: res.auth});
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
        border-radius: 5px;
    }

</style>