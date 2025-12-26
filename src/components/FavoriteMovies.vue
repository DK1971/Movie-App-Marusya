<script setup lang="ts">
import { ref } from "vue";
import { storeToRefs } from 'pinia'
import { useRouter } from "vue-router";
import BaseCardMovies from "../components/BaseCardMovies.vue";
import type { IMovies } from "../types/movies";
import { useFavoriteMoviesStore } from "../store/favoriteMoviesStore"
import { useUserStore } from "../store/userStore"

interface MovieCardProps {
  movie: IMovies,
  rank?: number,
  showDelete?: {
    type: Boolean,
    default: false, // По умолчанию кнопка удаления не отображается
  }
}

const props = defineProps<MovieCardProps>()

const router = useRouter();
const favorites = ref<any[]>([]);

const favoriteStore = useFavoriteMoviesStore()
const { favoriteMovies } = storeToRefs(favoriteStore)


const userStore = useUserStore()
const { isAuthorized } = storeToRefs(userStore)

</script>

<template>
  <BaseCardMovies
                  v-for="favorite in favoriteMovies"
                  :key="favorite.id"
                  :movie="favorite"
                  :showIndex="false"
                  :showDelete?="true" />

</template>

<style scoped></style>