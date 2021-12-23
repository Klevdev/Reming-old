<template>
    <section class="page-wrapper">
        <div class="section-header">
            <h1>Поиск</h1>
        </div>
        <div class="section-header">
            <div class="search">
                <input v-model="query.q" type="text" placeholder="Поиск" />
                <button type="button" @click="search"></button>
            </div>
<!--            TODO: Все эти селекты вынести в компоненты (понять как для них реализовать привязку данных) -->
            <div class="select">
                <label class="select-label">Искать в</label>
                <div class="select-block" @click="showDropDown[0] = !showDropDown[0]" :class="{'drop-down-shown' : showDropDown[0]}">{{qFields.length ? qFieldsItems[qFields[0]] : 'Не выбрано'}}</div>
                <div class="select-dropdown" :class="{'shown' : showDropDown[0]}">
                    <div class="select-item"
                         v-for="[key, value] in Object.entries(qFieldsItems)"
                         @click="switchQueryParam('qFields', key, true)"
                         :class="{'selected' : queryParamHasItem('qFields', key)}">
                            {{value}}
                    </div>
                </div>
            </div>
            <div class="select">
                <label class="select-label">Типы материалов</label>
                <div class="select-block" @click="showDropDown[1] = !showDropDown[1]" :class="{'drop-down-shown' : showDropDown[1]}">{{type.length ? typeItems[type[0]] : 'Не выбрано'}}</div>
                <div class="select-dropdown" :class="{'shown' : showDropDown[1]}">
                    <div class="select-item"
                         v-for="[key, value] in Object.entries(typeItems)"
                         @click="switchQueryParam('type', key, true)"
                         :class="{'selected' : queryParamHasItem('type', key)}">
                        {{value}}
                    </div>
                </div>
            </div>
            <div class="select">
                <label class="select-label">Сортировать по</label>
                <div class="select-block" @click="showDropDown[2] = !showDropDown[2]" :class="{'drop-down-shown' : showDropDown[2]}">{{sort.length ? sortItems[sort[0]] : 'Не выбрано'}}</div>
                <div class="select-dropdown" :class="{'shown' : showDropDown[2]}">
                    <div class="select-item"
                         v-for="[key, value] in Object.entries(sortItems)"
                         @click="switchQueryParam('sort', key, true)"
                         :class="{'selected' : queryParamHasItem('sort', key)}">
                        {{value}}
                    </div>
                </div>
            </div>
            <Checkbox :attributes="{name: 'desc', label: 'Сортировать по убыванию'}" v-model="query.desc"/>
<!--            <Input :attributes="{label: 'Элементов на страницу', name: 'perPage', type: 'number', rules: {}}" v-model="query.perPage"/>-->
        </div>
        <div v-if="materials.length" class="section-header">
            <h2>Результаты поиска:</h2>
        </div>
        <div v-else style="text-align: left; margin-top: 25px">
            {{messageForEmpty}}
        </div>
        <MaterialsList :materials="materials"/>
        <Pagination v-if="pagesCount > 1" :pagesCount="pagesCount"/>
    </section>
</template>

<script>
    import MaterialsList from "../components/MaterialsList";
    import Pagination from "../components/Pagination";
    import Checkbox from "../components/Checkbox";
    import Input from "../components/Input";
    import store from "../store";

    export default {
        name: "Search",
        components: {
            MaterialsList,
            Pagination,
            // Select,
            Checkbox,
            Input
        },
        data() {
            return {
                messageForEmpty: "",
                materials: [],
                pagesCount: 0,
                query: {
                    q: null,
                    desc: true,
                    perPage: 10,
                    page: 1
                },
                qFields: [],
                type: [],
                sort: [],
                showDropDown: [
                    false,
                    false,
                    false
                ],
                qFieldsItems: {
                    'title': 'Название',
                    'description' : 'Описание'
                },
                typeItems: {
                    'set': 'Наборы',
                    'collection' : 'Коллекции'
                },
                sortItems: {
                    'tc': 'Дата создания',
                    'rt' : 'Оценка',
                    'vws' : 'Просмотры'
                },
            }
        },
        methods: {
            async search() {
                let routeQuery = {};
                if (this.query.q) routeQuery.q = this.query.q;
                if (this.qFields.length) routeQuery.qFields = this.qFields.join(' ');
                if (this.type.length) routeQuery.type = this.type.join(' ');
                if (this.sort.length) routeQuery.sort = this.sort;
                if (this.query.desc) routeQuery.desc = true;
                if (this.query.perPage !== 10) routeQuery.perPage = this.query.perPage;
                routeQuery.page = 1;

                await this.$router.push({name: 'Search', query: routeQuery});
            },
            switchQueryParam(param, value, single=false) {
                if (this[param].includes(value)) {
                    this[param].splice(this[param].indexOf(value));
                } else {
                    if (single) {
                        this[param][0] = value;
                    } else {
                        this[param].push(value);
                    }
                }

            },
            queryParamHasItem(param, value) {
                // console.log(this[param].includes(value))
                return this[param].includes(value);
            }
        },
        async created() {
            if (this.$route.query && Object.keys(this.$route.query).length > 0) {
                this.query = this.$route.query;
                this.qFields = this.$route.query.hasOwnProperty('qFields') ? this.$route.query.qFields.split(' ') : [];
                this.type = this.$route.query.hasOwnProperty('type') ? this.$route.query.type.split(' ') : [];
                this.sort = this.$route.query.hasOwnProperty('sort') ? [this.$route.query.sort] : [];
                this.query.desc = !!this.$route.query.desc;

                const res = await store.dispatch('request', {
                    path: 'materials',
                    method: 'GET',
                    query: this.query
                });
                if (res.hasOwnProperty('error')) {
                    this.materials = [];
                } else {
                    this.materials = res.materials;
                    this.pagesCount = res.pagesCount;
                    this.messageForEmpty = "Поиск не дал результатов"
                }
            }
        }
    }
</script>

<style scoped lang="scss">
    .page-wrapper {
        margin-left: 250px;
    }
    .section-header {
        max-width: 75vw;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        flex-wrap: wrap;
        gap: 50px;
        & > h1, & > h2 {
            margin-top: 20px;
            margin-bottom: 20px;
            text-align: left;
            width: max-content;
        }
    }

    .search {
        display: flex;
        flex-direction: row;

        & > input {
            min-width: 200px;
            width: 100%;
            background-color: #FFFFFF;
            border: 1px solid #4285F4;
            border-radius: 3px 0 0 3px;
            padding: 7px 10px;
            transition: background-color .2s, border-color .2s;

            &:focus, &:active {
                border-color: #A1C4FD;
            }
        }
        & > button {
            height: 40px;
            width: 40px;
            background-image: url("../assets/icons/search-white.svg");
            background-position: center center;
            background-repeat: no-repeat;
            background-size: 15px 15px;
            border-radius: 0 3px 3px 0;
        }
    }

    .select {
        user-select: none;
        position: relative;
        bottom: 10px;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 5px;
    }

    .select-label {
    }

    .select-block {
        color: #AAAAAA;
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
            border-bottom-color: #4285F4;
            border-radius: 3px 3px 0 0;
            &::before {
                transform: rotate(180deg);
            }
        }
        &:hover {
            cursor: pointer;
        }
    }
    .select-dropdown {
        width: 200px;
        display: none;
        position: absolute;
        top: 55px;
        border: 1px solid #4285F4;
        border-top: none;
        border-radius: 0 0 3px 3px;
        background-color: #fff;
        &.shown {
            display: block;
        }
    }
    .select-item {
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