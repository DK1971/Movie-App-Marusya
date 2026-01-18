<script setup lang="ts">
import { onMounted, computed, ref } from "vue"
import { storeToRefs } from 'pinia'
import { useRouter } from "vue-router"
import type { IMovies } from "../types/movies"
import { useMoviesStore } from '../store/moviesStore.ts'
import { useUserStore } from '../store/userStore.ts'
import { useFavoriteMoviesStore } from '../store/favoriteMoviesStore.ts'
import { getRatingColor, formatRating, getTimeFormat, convertYoutubeUrl } from '../utils/movieUtils'
import BaseButtonFavorite from './BaseButtonFavorite.vue'
import TrailerModal from './Modals/TrailerModal.vue'
import BaseModal from "./BaseModal.vue"
import BaseButtonTrailer from "./BaseButtonTrailer.vue"

// ═══════════════════════════════════════════════════════════════
// СОСТОЯНИЕ ИЗ ХРАНИЛИЩ
// ═══════════════════════════════════════════════════════════════

const moviesStore = useMoviesStore()
const { getMoviesByRandom } = moviesStore
const { movieRandom } = storeToRefs(moviesStore)

const favoriteStore = useFavoriteMoviesStore()
const { favoriteMovies } = storeToRefs(favoriteStore)

const userStore = useUserStore()
const { isAuthorized } = storeToRefs(userStore)

const router = useRouter()

// ═══════════════════════════════════════════════════════════════
// PROPS И EVENTS
// ═══════════════════════════════════════════════════════════════

interface MovieProps {
  movie: IMovies
  rank?: number
  modalType:  'login' | 'register' | 'complete'
  visible?: boolean
  trailerUrl?: string
  trailerYouTubeId?: string
}

const props = defineProps<MovieProps>()

const emit = defineEmits<{
  (e: 'openCard'): void
  (e: 'open-modal'): void
  (e: 'changeRandomMovie'): void
  (e: 'openTrailerModal'): void
  (e: 'closeTrailerModal'): void
  (e: 'openMovieAboutInfo'): void
  (e: 'hiddenSection'): void
}>()

// ═══════════════════════════════════════════════════════════════
// ВЫЧИСЛЯЕМЫЕ СВОЙСТВА
// ═══════════════════════════════════════════════════════════════

/**
 * Текущий показываемый случайный фильм
 */
const randomMovie = computed(() => movieRandom?. value)

/**
 * Проверяет, находится ли текущий случайный фильм в избранном
 */
const isFavorite = computed(() => {
  if (!randomMovie.value || !favoriteMovies.value) return false
  return favoriteMovies.value.some(movie => movie.id === randomMovie.value?. id)
})

// ═══════════════════════════════════════════════════════════════
// ЛОКАЛЬНОЕ СОСТОЯНИЕ (Refs)
// ═══════════════════════════════════════════════════════════════

// Видимость модального окна входа
const isModalVisible = ref(false)

// Видимость модального окна трейлера
const isTrailerModalVisible = ref(false)

// URL трейлера для отображения в модальном окне
const trailerUrl = ref('')

// ═══════════════════════════════════════════════════════════════
// МЕТОДЫ
// ═══════════════════════════════════════════════════════════════

/**
 * Открыть карточку фильма (перейти на страницу информации о фильме)
 */
const openCard = () => {
  if (! props.movie?. id) return

  // Переходим на страницу с информацией о фильме
  router.push(`/movie/${props.movie.id}`)
}

/**
 * Загрузить новый случайный фильм
 */
const changeRandomMovie = async () => {
  try {
    await getMoviesByRandom()
  } catch (error) {
    console.error('Ошибка при получении случайного фильма:', error)
  }
}

/**
 * Открыть модальное окно входа
 */
const openModal = () => {
  isModalVisible.value = true
}

/**
 * Закрыть модальное окно входа
 */
const closeModal = () => {
  isModalVisible.value = false
}

/**
 * Открыть модальное окно с трейлером фильма
 */
const openTrailerModal = () => {
  if (!randomMovie.value?. trailerUrl) return

  isTrailerModalVisible.value = true
  trailerUrl.value = convertYoutubeUrl(randomMovie.value.trailerUrl)
}

/**
 * Закрыть модальное окно с трейлером
 */
const closeTrailerModal = () => {
  isTrailerModalVisible.value = false
}

/**
 * Добавить/удалить фильм из избранного
 */
const toggleFavoriteMovie = async () => {
  // Если пользователь не авторизован - показываем форму входа
  if (!isAuthorized.value) {
    openModal()
    return
  }

  // Если нет ID фильма - выходим
  if (!randomMovie.value?.id) return

  try {
    // Если фильм в избранном - удаляем, если нет - добавляем
    if (isFavorite.value) {
      await favoriteStore.removeFavoriteMovies(randomMovie.value.id)
    } else {
      await favoriteStore.addFavoriteMovies(randomMovie.value. id)
    }

    // Обновляем список избранных фильмов после операции
    await favoriteStore.getFavoriteMovies()
  } catch (error) {
    console.error('Ошибка при работе с избранным:', error)
  }
}

// ═══════════════════════════════════════════════════════════════
// LIFECYCLE HOOKS
// ═══════════════════════════════════════════════════════════════

onMounted(async () => {
  // Загружаем случайный фильм при монтировании компонента
  await getMoviesByRandom()
})
</script>

<template>
  <div class="movies__random-wrap">
    <!-- Информация о фильме -->
    <div class="movies__card">
      <!-- Рейтинг, год, жанр, длительность -->
      <div class="movie__info">
        <div : class="`rating-label ${getRatingColor(randomMovie?. tmdbRating)}`">
          <span class="rating-value">{{ formatRating(randomMovie?.tmdbRating) }}</span>
        </div>
        <p class="movie__year">{{ randomMovie?.releaseYear }}</p>
        <p class="movie__genre">{{ randomMovie?.genres?.join(', ') || 'Нет данных' }}</p>
        <p class="movie__duration">{{ getTimeFormat(randomMovie?. runtime) }}</p>
      </div>

      <!-- Название фильма -->
      <h1 class="movie__title">
        {{ randomMovie?.title }}
      </h1>

      <!-- Описание фильма -->
      <p class="movie__desc">
        {{ randomMovie?.plot }}
      </p>

      <!-- Кнопки действий -->
      <div class="movie__actions">
        <!-- Кнопка просмотра трейлера -->
        <BaseButtonTrailer
          : url="randomMovie?.trailerUrl"
          @open="openTrailerModal"
        />

        <!-- Кнопка открытия информации о фильме -->
        <button
          @click="openCard"
          type="button"
          class="btn-info"
        >
          О фильме
        </button>

        <!-- Кнопка добавления в избранное -->
        <BaseButtonFavorite
          :movie-id="randomMovie?.id"
          @open-modal="openModal"
          @toggle-movie="toggleFavoriteMovie"
        />

        <!-- Кнопка загрузки нового случайного фильма -->
        <button
          @click="changeRandomMovie"
          type="button"
          class="btn-actions"
          title="Получить новый случайный фильм"
        >
          <img src="/public/icons/change. svg" class="icon" alt="Новый случайный фильм" />
        </button>
      </div>
    </div>

    <!-- Постер фильма -->
    <div class="movies__random-img">
      <img
        :src="randomMovie?.posterUrl ??  ''"
        alt="Постер фильма"
        class="img-poster"
      />
    </div>
  </div>

  <!-- Модальное окно трейлера -->
  <TrailerModal
    :visible="isTrailerModalVisible"
    : trailer-url="trailerUrl"
    @close="closeTrailerModal"
  />

  <!-- Модальное окно входа/регистрации -->
  <BaseModal
    :modal-type="props.modalType"
    :visible="isModalVisible"
    @close="closeModal"
  />
</template>

<style scoped>
.movies__random-wrap {
  display: flex;
  gap: 16px;
}

.movies__card {
  display: flex;
  flex:  1;
  flex-direction: column;
  margin-top: 74px;
  max-width: 680px;
  gap: 16px;
  font-family: Play;
  letter-spacing: normal;
  text-align: left;
}

.movie__info {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}

.movies__title {
  font-size: 48px;
  font-weight:  700;
  line-height: 1.16;
}

.movie__title {
  font-size: 48px;
  font-weight:  700;
  line-height: 1.16;
}

.movie__year,
.movie__genre,
.movie__duration {
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
}

.movie__desc {
  font-size: 24px;
  font-weight: 400;
  line-height: 1.33;
  min-height: 100px;
}

.movie__actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.movies__random-img {
  flex: 1;
  max-width: 680px;
  max-height: 552px;
  overflow: hidden;
  border-radius: 8px;
}

.img-poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Rating label styles */
.rating-label {
  padding: 4px 12px;
  border-radius:  4px;
  font-weight: 700;
  font-size: 16px;
}

. rating-value {
  color:  white;
}

/* Button styles */
.btn-info,
.btn-actions {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px 16px;
  font-family: var(--font-family);
  font-weight: 700;
  font-size: 16px;
  transition: all 0.2s ease;
}

.btn-info {
  color: rgb(88, 86, 214);
  background-color: var(--main-white);
  border-radius: 50px;
  padding: 8px 24px;
}

.btn-info:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(88, 86, 214, 0.3);
}

.btn-actions {
  padding: 6px;
}

.btn-actions img {
  width: 28px;
  height: 28px;
}

. btn-actions:hover {
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .movies__random-wrap {
    flex-direction: column;
  }

  .movie__title {
    font-size: 32px;
  }

  .movie__desc {
    font-size: 16px;
  }

  .movies__random-img {
    max-width: 100%;
  }
}
</style>