<script setup lang="ts">
import { storeToRefs } from "pinia"
import HeaderSeachBar from './HeaderSeachBar.vue';
import { useMoviesStore } from '../store/moviesStore.ts'

const { searchTitle } = storeToRefs(useMoviesStore())

const onSearch = (value: string) => {
  console.log('search:', value)
  // store action
}

const onReset = () => {
  console.log('reset')
}

</script>

<template>
  <div class="header__menu">
    <!-- Link to Home Page -->
    <router-link to="/" class="menu-item">
      Главная
    </router-link>
    <!-- Link to Genres Page -->
    <router-link to="/Genres" class="menu-item">
      Жанры
    </router-link>
    <!-- Строка поиска фильмов и блок результата поисков -->
    <HeaderSeachBar
                    v-model="searchTitle"
                    @search="onSearch"
                    @reset="onReset" />
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



  @media (max-width: 1280px) {
    .header__menu {
      gap: 20px;
    }
  }
</style>