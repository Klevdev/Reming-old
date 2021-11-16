<template>
    <span v-if="error" class="error">{{error}}</span>
    <div class="cb-wrapper">
        <input
                :value="modelValue"
                :id="id"
                :name="attributes.name"
                type="checkbox"
                :class="{'input-error': this.error}"
                @change="$emit('update:modelValue', $event.target.checked)"
        />
        <label :for="id">{{attributes.label}}</label>
    </div>
</template>

<script>
    export default {
        name: "checkbox",
        props: {
            modelValue: Boolean,
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
    }
</script>

<style scoped>
    /*input {*/
    /*    appearance: none;*/
    /*    margin-top: .3em;*/
    /*    width: .8em;*/
    /*    height: .8em;*/
    /*    border: 1px solid black;*/
    /*}*/
    .cb-wrapper {
        display: flex;
        gap: 7px;
    }
</style>