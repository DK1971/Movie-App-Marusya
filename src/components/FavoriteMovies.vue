<script setup lang="ts">
import { watch, ref } from "vue";
import { storeToRefs } from 'pinia'
import BaseCardMovies from "../components/BaseCardMovies.vue";
import type { IMovies } from "../types/movies";
import { useFavoriteMoviesStore } from "../store/favoriteMoviesStore"
import { useUserStore } from "../store/userStore"

const favoriteStore = useFavoriteMoviesStore()
const { favoriteMovies } = storeToRefs(favoriteStore)

const userStore = useUserStore()
const { isAuthorized } = storeToRefs(userStore)

const localFavorites = ref<IMovies[] | null>(favoriteMovies.value ?? null)

// синхронизируем локальную переменную с хранилищем
watch(favoriteMovies, (newVal) => {
  localFavorites.value = newVal ?? null
})
</script>

<template>
  <ul class="favorites__list">
    <BaseCardMovies
                    v-for="favorite in localFavorites"
                    :key="favorite.id"
                    :movie="favorite"
                    :showDelete="true"
                    @delete="() => { /* родительский обработчик при необходимости */ }" />
  </ul>
</template>

<style scoped></style>