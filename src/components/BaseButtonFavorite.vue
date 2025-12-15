<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import type { IMovies } from "../types/movies.ts";
import { useUserStore } from '../store/userStore.ts'
import { useFavoriteMoviesStore } from '../store/favoriteMoviesStore.ts';

interface Props {
  movie: IMovies
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'open-modal'): void
  (e: 'error', err: any): void
}>()

const userStore = useUserStore()
const { isAuthorized } = storeToRefs(userStore)

const favoriteStore = useFavoriteMoviesStore()
const { favoriteMovies } = storeToRefs(favoriteStore)

// вычисляем, в избранном ли текущий фильм
const isFavorite = computed(() => {
  if (!props.movie) return false
  const favs = favoriteMovies.value ?? []
  return favs.some((m: any) => m.id === props.movie.id)
})

// Обработчик клика: если не авторизован — просим показать модалку входа
const handleClick = async (evt?: Event) => {
  // предотвращаем всплытие клика (например, чтобы не открывать карточку)
  if (evt && typeof evt.stopPropagation === 'function') evt.stopPropagation()
  if (!isAuthorized.value) {
    emit('open-modal')
    return
  }
  if (!props.movie) return
  // Если авторизован — вызываем toggleFavorite в сторе (add/remove)
  try {
    await favoriteStore.toggleFavorite(props.movie)
    await favoriteStore.getFavoriteMovies()
  } catch (err) {
    console.error('Ошибка переключения избранного', err)
    emit('error', err)
  }
}
</script>

<template>
  <button
          @click="handleClick"
          type="button"
          class="btn-actions"
          :title="isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'">
    <img
         :src="isFavorite ? '/icons/liked-icon.svg' : '/icons/like-icon.svg'"
         alt="Изменить избранное"
         class="icon" />
  </button>
</template>

<style scoped>
  .icon {
    width: 28px;
    height: 28px;
  }
</style>