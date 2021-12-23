<template>
    <div>
        <div class="label" @click="updateValue" :class="{'drop-down-shown' : showDropDown}">{{label}}</div>
        <div class="dropdown" :class="{'shown' : showDropDown}">
            <div class="item" v-for="item in items" @click="checkItem(item)" :class="{'selected' : this.selected.includes(item)}">{{item}}</div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "Select",
        props: {
            // modelValue: Array,
            items: Array,
            label: String,
            multiple: {
                type: Boolean,
                default: false
            }
        },
        emits: [
            'update:modelValue'
        ],
        data() {
            return {
                showDropDown: false,
                selected: []
            }
        },
        methods: {
            updateValue() {
                this.showDropDown = !this.showDropDown;
                this.$emit('update:modelValue', this.items.filter(item => this.selected.includes(item)));
            },
            checkItem(item) {
                if (this.selected.includes(item)) {
                    let index = this.selected.indexOf(item)
                    this.selected.splice(index, 1);
                } else {
                    this.selected.push(item);
                }
            }
        }
    }
</script>

<style scoped lang="scss">
    .label {
        text-align: left;
        width: 200px;
        background-color: #fff;
        border: 1px solid #4285F4;
        border-radius: 3px;
        padding: 7px 10px 7px 0;
        user-select: none;

        &::before {
            content: "";
            position: relative;
            left: 180px;
            display: inline-block;
            width: 10px;
            height: 10px;
            background-image: url("../assets/icons/triangle-arrow-gray.svg");
            background-position: center center;
            background-repeat: no-repeat;
            background-size: 10px 10px;
            transition: transform .2s;
        }

        &.drop-down-shown {
            border-bottom: none;
            border-radius: 3px 3px 0 0;
            &::before {
                transform: rotate(180deg);
            }
        }
        &:hover {
            cursor: pointer;
        }
    }
    .dropdown {
        width: 200px;
        display: none;
        position: absolute;
        border: 1px solid #4285F4;
        border-top: none;
        border-radius: 0 0 3px 3px;
        background-color: #fff;
        &.shown {
            display: block;
        }
    }
    .item {
        padding: 7px 10px;
        width: 100%;
        text-align: left;
        text-wrap: avoid;

        &:hover {
            color: #FFF;
            background-color: #A1C4FD;
            cursor: pointer;
        }
        &.selected {
            color: #FFF;
            background-color: #4285F4;
        }
    }
</style>