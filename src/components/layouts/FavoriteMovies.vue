<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { IMovies } from "@/types/movies.ts";
// Импорт из Store
import { useFavoriteMoviesStore } from "@/store/favoriteMoviesStore.ts"
// Импорт базовых компонентов
import BaseCardMovies from "@bases/BaseCardMovies.vue";

// === STATE  ===
// FavoriteStore
const favoriteStore = useFavoriteMoviesStore()
const { favoriteMovies } = storeToRefs(favoriteStore)

// === PROPS ===
interface MovieCardProps {
  movie: IMovies,
  rank?: number,
  showDelete?: boolean
}

const props = withDefaults(defineProps<MovieCardProps>(), {
  showDelete: false
})

</script>

<template>
  <BaseCardMovies
                  v-for="favorite in favoriteMovies"
                  :key="favorite.id"
                  :movie="favorite"
                  :showIndex="false"
                  :showDelete="true"
                  @delete="() => { }" />
</template>

<style scoped></style>