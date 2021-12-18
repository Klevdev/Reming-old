<template>
    <section class="about">
        <div class="page-header">
            <h1>О Reming</h1>
        </div>
        <p>Reming - это приложение, нацеленное упростить запоминание любой информации</p>
        <h2>Возможности</h2>
        <ul>
            <li>Создание наборов карточек</li>
            <li>Совместный доступ</li>
            <li>Общий доступ</li>
        </ul>
        <p>Сделано в рамках курсового проекта</p>
        <p>Автор - Клевакин Александр, группа 92</p>
        <p>СПБКИТ, 2021</p>
        <p>Здесь пока больше не на что смотреть, загляните попозже</p>
    </section>
</template>

<style scoped lang="scss">
    section {
        margin-left: 250px;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
    }
    .page-header {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        gap: 50px;
        & > h1 {
            text-align: left;
            width: max-content;
        }
    }
</style>