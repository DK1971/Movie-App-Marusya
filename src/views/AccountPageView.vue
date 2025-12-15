<script setup lang="ts">
import { ref, onMounted } from "vue";
import { storeToRefs } from 'pinia';
import { useRouter, useRoute, RouterView } from "vue-router";
import { useUserStore } from '../store/userStore.ts'
import { useFavoriteMoviesStore } from '../store/favoriteMoviesStore.ts';
import type { IMovies } from "../types/movies.ts";
import FavoriteMovies from "../components/FavoriteMovies.vue";
import UserSettings from "../components/UserSettings.vue";

const router = useRouter();
const route = useRoute();

const authStore = useUserStore()
const user = storeToRefs(authStore)

const favoriteStore = useFavoriteMoviesStore()
const { favoriteMovies } = storeToRefs(favoriteStore)

const favorites = ref(favoriteMovies.value)
const currentTab = ref("favorites"); // По умолчанию "Избранные фильмы"

interface MovieProps {
  movie: IMovies
  rank?: number
  modalType: 'login' | 'register' | 'complete',
  visible?: boolean
}

const movieProps = defineProps<MovieProps>()

// Устанавливаем начальное состояние вкладки в зависимости от маршрута
onMounted(() => {
  if (route.path.includes("settings")) {
    currentTab.value = "settings";
  } else {
    currentTab.value = "favorites";
  }
});

// Функция для переключения вкладок
const setTab = (tab: string) => {
  currentTab.value = tab;
  // Обновляем маршрут в зависимости от выбранной вкладки
  if (tab === "favorites") {
    router.push("/account/favorites");
  } else if (tab === "settings") {
    router.push("/account/settings");
  }
}

onMounted(async () => {
  await authStore.getProfile()
  await favoriteStore.getFavoriteMovies()
  favorites.value = favoriteStore.favoriteMovies
})



</script>

<template>
  <section class="container account">
    <h1 class="section-title">Мой аккаунт</h1>
    <div class="account__tabs">
      <button
              class="tab account__tab-favorites"
              @click="setTab('favorites')"
              :class="{ active: currentTab === 'favorites' }">
        <svg
             width="20.000000"
             height="18.500000"
             viewBox="0 0 20 18.5"
             fill="none"
             xmlns="http://www.w3.org/2000/svg"
             xmlns:xlink="http://www.w3.org/1999/xlink">
          <defs />
          <path
                id="Vector"
                d="M14.5 0C17.53 0 20 2.5 20 6C20 13 12.5 17 10 18.5C7.5 17 0 13 0 6C0 2.5 2.5 0 5.5 0C7.35 0 9 1 10 2C11 1 12.64 0 14.5 0ZM10.93 15.6C11.81 15.04 12.61 14.49 13.35 13.9C16.33 11.53 18 8.94 18 6C18 3.64 16.46 2 14.5 2C13.42 2 12.25 2.56 11.41 3.41L10 4.82L8.58 3.41C7.74 2.56 6.57 2 5.5 2C3.55 2 2 3.65 2 6C2 8.94 3.66 11.53 6.64 13.9C7.39 14.49 8.18 15.04 9.06 15.6C9.36 15.79 9.66 15.97 10 16.17C10.33 15.97 10.63 15.79 10.93 15.6Z"
                fill="#FFFFFF"
                fill-opacity="1.000000"
                fill-rule="nonzero" />
        </svg>
        &nbsp;Избранные фильмы
      </button>
      <button
              class="tab account__tab-settings"
              @click="setTab('settings')"
              :class="{ active: currentTab === 'settings' }">
        <svg
             width="16.000000"
             height="21.000000"
             viewBox="0 0 16 21"
             fill="none"
             xmlns="http://www.w3.org/2000/svg"
             xmlns:xlink="http://www.w3.org/1999/xlink">
          <defs />
          <path
                id="Vector"
                d="M0 21C0 16.58 3.58 13 8 13C12.41 13 16 16.58 16 21L14 21C14 17.68 11.31 15 8 15C4.68 15 2 17.68 2 21L0 21ZM8 12C4.68 12 2 9.31 2 6C2 2.68 4.68 0 8 0C11.31 0 14 2.68 14 6C14 9.31 11.31 12 8 12ZM8 10C10.21 10 12 8.21 12 6C12 3.78 10.21 2 8 2C5.79 2 4 3.78 4 6C4 8.21 5.79 10 8 10Z"
                fill="#FFFFFF"
                fill-opacity="1.000000"
                fill-rule="nonzero" />
        </svg>
        &nbsp;Настройки аккаунта
      </button>
    </div>

    <div class="account__content">

      <section
               v-if="currentTab === 'favorites'"
               class="favorites-section">

        <ul v-if="favorites" class="favorites__list">
          <FavoriteMovies
                          :movie="movieProps.movie"
                          :movies="favorites"
                          :showIndex="false"
                          :showDelete?="true" />
        </ul>

        <p v-else class="section-desc">В Избранном нет сохранённых фильмов или они не отображаются на странице!</p>

      </section>

      <section
               v-if="currentTab === 'settings'"
               class="settings-section">
        <UserSettings />
      </section>

    </div>

  </section>
</template>

<style scoped>
  .account {
    display: flex;
    flex-direction: column;
  }

  .account__title {
    font-size: 48px;
    font-weight: 700;
    line-height: 1.16;
  }

  .account__tabs {
    display: flex;
    padding: 0;
    padding-block-end: 64px;
    gap: 64px;
  }

  .tab {
    display: flex;
    padding: 0;
    gap: 10px;
  }

  .favorites__list {
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 64px 40px;
  }
</style>