<template>
    <div class="set-info">
        <h2>{{set.title}}</h2>
        <dl>
            <dt>Описание</dt>
            <dd>{{set.description}}</dd>
            <dt>Доступен в библиотеке</dt>
            <dd>{{set.isPublic ? 'Да' : 'Нет'}}</dd>
            <dt>Автор</dt>
            <dd>{{set.author}}</dd>
            <dt>Дата создания</dt>
            <dd>{{set.creationDate}}</dd>
            <dt>Теги</dt>
            <dd>Скоро будут</dd>
        </dl>
        <div>
            <button type="button" class="start-btn" @click="this.$router.push(`/study/${setId}`)">►</button>
        </div>
    </div>
</template>

<script>
    import store from "@/store";

    export default {
        name: "MaterialPage",
        data() {
            return {
                setId: this.$route.params.setId,
                set: {}
            }
        },
        async beforeMount() {
            this.set = await store.dispatch('getSet', this.setId);
        }
    }
</script>

<style scoped lang="scss">
    .set-info {
        margin: 0 auto;
        width: 400px;
        box-shadow: 0 0 10px #2c3e5033, 0 20px 20px #2c3e5011;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: 10px;
        background-color: #FAFAFA;
        padding: 20px 25px;
        border-radius: 5px;
    }

    dl {
        text-align: left;
        display: grid;
        gap: 5px;
        grid-template-columns: repeat(2, 1fr);
        & > dt {
            font-weight: bold;
        }
    }
    .start-btn {
        padding: 0 0 0 2px;
        color: white;
        font-size: 1em;
        background-color: #3EAF7C;
        border-radius: 50%;
        width: 35px;
        height: 35px;
        transition: background-color .2s;
        &:hover {
            cursor: pointer;
            background-color: #4EBF8C;
        }
    }
</style>