<script setup lang="ts">
import BaseInput from './BaseInput.vue';

</script>

<template>
  <div class="header__menu">
    <!-- Link to Home Page -->
    <router-link to="/" class="menu-item">
      <a>Главная</a>
    </router-link>
    <!-- Link to Genres Page -->
    <router-link to="/Genres" class="menu-item">
      <a>Жанры</a>
    </router-link>

    <BaseInput
               type="text"
               class="header__input"
               id="input"
               placeholder="Поиск" />
  </div>
</template>


<style scoped>
  .header__menu {
    display: flex;
    justify-content: space-between;
    width: 100%;
    gap: 40px;
  }

  .menu-item {
    position: relative;
    display: flex;
    align-items: center;
    margin: 0;
    padding: 0;
    color: var(--main-white);
    font-size: 24px;
    font-weight: 400;
    text-decoration: none;
    cursor: pointer;
  }

  .menu-item::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 2px;
    background-color: rgba(220, 93, 252, 1);
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  .menu-item:hover::after {
    transform: scaleX(1);
  }

  .header__input {
    position: relative;
    width: 100%;
    padding-inline: 52px 16px;
    padding-block: 16px;
    color: var(--main-white);
    font-size: 18px;
    border: none;
    border-radius: 8px;
    background-color: var(--background-gray-primary);
    background-image: url('../assets/icons/search.svg');
    background-repeat: no-repeat;
    background-position: center left 16px;
  }

  .header__input::placeholder {
    font-size: 18px;
    /* padding-left: 30px; */
  }

  .header__input:active {
    background-image: none;
  }

  @media (max-width: 1280px) {
    .header__menu {
      gap: 20px;
    }
  }
</style>