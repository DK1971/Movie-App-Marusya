<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useMoviesStore } from '../store/moviesStore.ts'
import { useUserStore } from '../store/userStore.ts'
import { useFavoriteMoviesStore } from '../store/favoriteMoviesStore.ts';

// Состояние из хранилищ
// UserStore
const userStore = useUserStore()
const { isAuthorized } = storeToRefs(userStore)
// FavoriteStore
const favoriteStore = useFavoriteMoviesStore()
const { favoriteMovies } = storeToRefs(favoriteStore)
// MoviesStore
const moviesStore = useMoviesStore()
const { movies, movieRandom, movieById } = storeToRefs(moviesStore)

// Случайный фильм
const randomMovie = computed(() => movieRandom?.value)

// Текущий фильм
const currentMovie = computed(() => movieById.value)

// Добавление/удаление фильма из избранного
const isFavorite = computed(() => {
  if (!favoriteMovies.value) return false
  return favoriteMovies.value.some((m: any) => m.id === currentMovie.value?.id)
})

// Пути к иконкам
const iconSrc = computed(() => {
  // Если не авторизован — всегда показываем "like"
  if (!isAuthorized.value) {
    return '/icons/like-icon.svg'
  }
  // Если авторизован — показываем в зависимости от isFavorite
  return isFavorite.value
    ? '/icons/liked-icon.svg'
    : '/icons/like-icon.svg'
})

// === События ===
const emit = defineEmits<{
  (e: 'open-modal'): void,
  (e: 'toggle-movie'): void
}>()

// Обработчик клика
const handleClick = () => {
  if (!isAuthorized.value) {
    emit('open-modal') // Открываем модалку входа
  } else {
    emit('toggle-movie') // Переключаем избранное (в родителе)
  }
}

// const openModal = () => {
//   emit('open-modal')
// }

// const toggleMovie = () => {
//   emit('toggle-movie')
// }

</script>

<template>
  <button
          @click="handleClick"
          type="button"
          class="btn-actions">
    <img
         :src="iconSrc"
         alt="Изменить избранное"
         class="icon" />
  </button>
</template>

<style scoped></style>