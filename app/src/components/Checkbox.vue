<template>
    <div class="cb-wrapper" :class="{'checked': modelValue}">
        <input
                type="checkbox"
                :value="modelValue"
                :id="id"
                :name="attributes.name+'-'+this.idx"
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
            attributes: Object,
            idx: {
                type: Number,
                default: 1
            },
        },
        emits: [
            'update:modelValue'
        ],
        data() {
            return {
                id: 'input-'+this.attributes.name+'-'+this.idx
            }
        },
    }
</script>

<style scoped lang="scss">
    .cb-wrapper {
        display: flex;
        align-items: center;
        gap: 3px;
        user-select: none;
        &::before {
            background-color: #FFFFFF;
            content: '';
            display: inline-block;
            width: .9em;
            height: .9em;
            border: 1px solid #4285F4;
            border-radius: 3px;
            background-repeat: no-repeat;
            background-position: center center;
            background-size: 150% 150%;
        }
        &.checked::before {
            background-image: url("../assets/icons/checked.svg");
        }
    }

    input[type='checkbox'] {
        position: absolute;
        opacity: 0;
        user-select: none;
    }
</style>