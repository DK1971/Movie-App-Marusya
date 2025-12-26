<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useMoviesStore } from '../store/moviesStore.ts'
import { useUserStore } from '../store/userStore.ts'
import { useFavoriteMoviesStore } from '../store/favoriteMoviesStore.ts';

const userStore = useUserStore()
const { isAuthorized } = storeToRefs(userStore)

const favoriteStore = useFavoriteMoviesStore()
const { favoriteMovies } = storeToRefs(favoriteStore)

const { movieRandom } = storeToRefs(useMoviesStore())

const random = computed(() => movieRandom?.value)

// Добавление/удаление фильма из избранного
const isFavorite = computed(() => {
  if (!random.value || !favoriteMovies.value) return false
  return favoriteMovies.value.some((m: any) => m.id === random.value?.id)
})

const emit = defineEmits<{
  (e: 'open-modal'): void,
  (e: 'toggle-movie'): void
}>()

const openModal = () => {
  emit('open-modal')
}

const toggleMovie = () => {
  emit('toggle-movie')
}

</script>

<template>
  <button
          v-if="!isAuthorized"
          @click="openModal"
          type="button"
          class="btn-actions">
    <img
         :src="isFavorite ? '/icons/liked-icon.svg' : '/icons/like-icon.svg'"
         alt="Изменить избранное"
         class="icon" />
  </button>
  <button
          v-else
          @click="toggleMovie"
          type="button"
          class="btn-actions">
    <img
         :src="isFavorite ? '/icons/liked-icon.svg' : '/icons/like-icon.svg'"
         alt="Изменить избранное"
         class="icon" />
  </button>
</template>

<style scoped></style>