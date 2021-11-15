<template>
    <label :for="id">{{attributes.label}}</label>
    <span v-if="error" class="error">{{error}}</span>
    <input
            :value="modelValue"
            :id="id"
            :name="attributes.name"
            :type="attributes.type"
            :placeholder="attributes.placeholder"
            :required="attributes.rules.required"
            :class="{'input-error': this.error}"
            @change="$event => {$emit('update:modelValue', $event.target.value); validate($event.target.value)}"
    />
</template>

<script>
    import {validateValue} from "../lib/validation";
    import store from "../store";

    export default {
        name: "Input",
        props: {
            modelValue: String,
            attributes: Object
        },
        emits: [
            'update:modelValue'
        ],
        data() {
            return {
                id: 'input-'+this.attributes.name,
                error: null
            }
        },
        methods: {
            validate(value) {
                let result = validateValue(value, this.attributes.rules);
                if (result !== true) {
                    this.error = result;
                    store.commit('formErrorOccurred');
                } else {
                    this.error = null;
                    store.commit('formErrorSolved');
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
    input {
        width: 100%;
        background-color: #FFFFFF;
        border: 1px solid #4285F4;
        border-radius: 3px;
        padding: 7px 10px;
        transition: background-color .2s, border-color .2s;

        &:focus, &:active {
            border-color: #A1C4FD;
        }
    }
    .error {
        text-align: left;
        color: red;
        font-size: 0.8em;
    }
    .input-error {
        border-color: red;
    }
</style>