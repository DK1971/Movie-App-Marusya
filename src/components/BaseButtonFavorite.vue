<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '../store/userStore.ts'
import { useFavoriteMoviesStore } from '../store/favoriteMoviesStore.ts';

// === СОСТОЯНИЕ ИЗ ХРАНИЛИЩ ===
// UserStore
const userStore = useUserStore()
const { isAuthorized } = storeToRefs(userStore)
// FavoriteStore
const favoriteStore = useFavoriteMoviesStore()
const { favoriteMovies } = storeToRefs(favoriteStore)

// === PROPS ===
// movieId: ID фильма, для которого работает кнопка
interface Props {
  movieId?: number
}

const props = withDefaults(defineProps<Props>(), {
  movieId: undefined
})

// === EVENTS ===
const emit = defineEmits<{
  // Открыть модальное окно входа
  (e: 'open-modal'): void
  // Переключить статус избранного (добавить/удалить из избранного)
  (e: 'toggle-movie'): void
}>()

// === ВЫЧИСЛЯЕМЫЕ СВОЙСТВА (Computed properties) ===
/**
* Проверяет, находится ли фильм в избранном
* @returns true если фильм в избранном, false если нет
*/
const isFavorite = computed(() => {
  // Если нет ID фильма или списка избранных - фильм не в избранном
  if (!props.movieId || !favoriteMovies.value) return false

  // Ищем фильм по ID в списке избранных
  return favoriteMovies.value.some(movie => movie.id === props.movieId)
})

/**
* Определяет иконку кнопки в зависимости от статуса авторизации и избранного
* @returns Путь к иконке (liked или like)
*/
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

// === МЕТОДЫ ===
/**
* Обработчик клика по кнопке
* Если пользователь не авторизован - открываем форму входа
* Если авторизован - переключаем статус избранного
*/
const handleClick = () => {
  if (!isAuthorized.value) {
    emit('open-modal') // Открываем модалку входа
  } else {
    emit('toggle-movie') // Переключаем избранное (в родителе)
  }
}

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