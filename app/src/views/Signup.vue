<template>
    <section>
        <h1>Регистрация</h1>
        <form @submit.prevent="submitForm">
            <Input v-model="formData.login" :attributes="inputAttributes.login"/>
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
                    login: {
                        label: "Логин",
                        name: "login",
                        type: "text",
                        placeholder: "MyLogin123",
                        prompt: "",
                        rules: {
                            required: true,
                            lengthRange: [5, 30],
                            restrictedChars: '!#$^*(){};:|/'
                        },
                    },
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
                    login: null,
                    name: null,
                    email: null,
                    password: null,
                },
                passwordRepeat: null,
            }
        },
        methods: {
            async fetchUser() {
                const res = await fetch('http://localhost:3000/user/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    // mode: 'cors',
                    // credentials: 'omit',
                    body: JSON.stringify(this.formData),
                });
                return res.json();
            },
            async submitForm() {
                console.log(JSON.stringify(this.formData));
                this.errorMessage = "";
                this.errors = [];
                let res = await this.fetchUser();
                // console.log(res);
                if (res.hasOwnProperty('error')) {
                    this.errorMessage = res.error;
                    if (res.hasOwnProperty('error')) {
                        res.errors.forEach(errorObj => {
                            console.log(errorObj);
                            if (!errorObj.hasOwnProperty('error')) {
                                throw Error("Ошибка - отсутсвует поле error")
                            }
                            this.errors.push(errorObj.error);
                        });
                    }
                } else {
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