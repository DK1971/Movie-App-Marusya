<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useMoviesStore } from '../store/moviesStore.ts'
import { useUserStore } from '../store/userStore.ts'
import { useFavoriteMoviesStore } from '../store/favoriteMoviesStore.ts'

// ═══════════════════════════════════════════════════════════════
// СОСТОЯНИЕ ИЗ ХРАНИЛИЩ (Pinia stores)
// ═══════════════════════════════════════════════════════════════

const userStore = useUserStore()
const { isAuthorized } = storeToRefs(userStore)

const favoriteStore = useFavoriteMoviesStore()
const { favoriteMovies } = storeToRefs(favoriteStore)

// ═══════════════════════════════════════════════════════════════
// ВХОДНЫЕ ДАННЫЕ (Props)
// ═══════════════════════════════════════════════════════════════
// movieId: ID фильма, для которого работает кнопка
interface Props {
  movieId?: number
}

const props = withDefaults(defineProps<Props>(), {
  movieId: undefined
})

// ═══════════════════════════════════════════════════════════════
// ВЫЧИСЛЯЕМЫЕ СВОЙСТВА (Computed properties)
// ═══════════════════════════════════════════════════════════════

/**
 * Проверяет, находится ли фильм в избранном
 * @returns true если фильм в избранном, false если нет
 */
const isFavorite = computed(() => {
  // Если нет ID фильма или списка избранных - фильм не в избранном
  if (!props.movieId || !favoriteMovies.value) return false
  
  // Ищем фильм по ID в списке избранных
  return favoriteMovies.value.some(movie => movie.id === props. movieId)
})

/**
 * Определяет иконку кнопки в зависимости от статуса авторизации и избранного
 * @returns Путь к иконке (liked или like)
 */
const iconSrc = computed(() => {
  // Если пользователь не авторизован - всегда показываем пустое сердце
  if (!isAuthorized.value) {
    return '/icons/like-icon.svg'
  }
  
  // Если авторизован - показываем заполненное сердце если фильм в избранном
  return isFavorite.value
    ? '/icons/liked-icon.svg'      // Полное сердце
    : '/icons/like-icon.svg'       // Пустое сердце
})

/**
 * Текст для подсказки при наведении на кнопку
 */
const buttonTitle = computed(() => {
  if (!isAuthorized.value) return 'Войти для добавления в избранное'
  return isFavorite.value ? 'Удалить из избранного' :  'Добавить в избранное'
})

// ═══════════════════════════════════════════════════════════════
// СОБЫТИЯ (Emits)
// ═══════════════════════════════════════════════════════════════

const emit = defineEmits<{
  // Открыть модальное окно входа
  (e: 'open-modal'): void
  // Переключить статус избранного (добавить/удалить из избранного)
  (e: 'toggle-movie'): void
}>()

// ═══════════════════════════════════════════════════════════════
// МЕТОДЫ (Methods)
// ═══════════════════════════════════════════════════════════════

/**
 * Обработчик клика по кнопке
 * Если пользователь не авторизован - открываем форму входа
 * Если авторизован - переключаем статус избранного
 */
const handleClick = () => {
  if (!isAuthorized.value) {
    // Пользователь не авторизован - показываем форму входа
    emit('open-modal')
  } else {
    // Пользователь авторизован - переключаем избранное
    emit('toggle-movie')
  }
}
</script>

<template>
  <button
    @click="handleClick"
    : title="buttonTitle"
    type="button"
    class="btn-favorite"
    :aria-label="buttonTitle"
  >
    <img
      :src="iconSrc"
      :alt="buttonTitle"
      class="btn-favorite__icon"
    />
  </button>
</template>

<style scoped>
.btn-favorite {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 6px;
  transition: transform 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-favorite:hover {
  transform: scale(1.1);
}

.btn-favorite: active {
  transform: scale(0.95);
}

.btn-favorite__icon {
  width: 28px;
  height: 28px;
  object-fit: contain;
}
</style>