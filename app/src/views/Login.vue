<template>
    <section>
        <h1>Вход</h1>
        <div class="error-block" v-if="errorMessage">
            <div class="error" v-if="errorMessage">{{errorMessage}}</div>
            <ul v-if="this.errors.length > 0">
                <li class="error-list" v-for="error in errors">{{error}}</li>
            </ul>
        </div>
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
                errorMessage: "",
                errors: [],
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
                    // mode: 'cors',
                    // credentials: 'omit',
                    body: JSON.stringify(this.formData),
                });
                return res.json();
            },
            async submitForm() {
                // console.log(JSON.stringify(this.formData));
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