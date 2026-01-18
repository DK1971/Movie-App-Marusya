<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { storeToRefs } from "pinia"
import TrailerModal from './Modals/TrailerModal.vue'
import BaseModal from "./BaseModal.vue"
import type { IMovies } from "../types/movies"
import { useMoviesStore } from '../store/moviesStore. ts'
import { useFavoriteMoviesStore } from '../store/favoriteMoviesStore.ts'
import { useUserStore } from '../store/userStore.ts'
import { scrollToTop, formatRating, getRatingColor, getTimeFormat, convertYoutubeUrl } from '../utils/movieUtils'
import BaseButtonFavorite from './BaseButtonFavorite.vue'

// ═══════════════════════════════════════════════════════════════
// СОСТОЯНИЕ ИЗ ХРАНИЛИЩ
// ═══════════════════════════════════════════════════════════════

const moviesStore = useMoviesStore()
const { movieById } = storeToRefs(moviesStore)

const favoriteStore = useFavoriteMoviesStore()
const { favoriteMovies } = storeToRefs(favoriteStore)

const userStore = useUserStore()
const { isAuthorized } = storeToRefs(userStore)

// ═══════════════════════════════════════════════════════════════
// PROPS И EVENTS
// ═══════════════════════════════════════════════════════════════

interface MovieProps {
  movie: IMovies
  rank?: number
  modalType:  'login' | 'register' | 'complete'
  visible?: boolean
}

const props = defineProps<MovieProps>()

const emit = defineEmits<{
  (e: 'open-modal'): void
  (e: 'toggle-movie'): void
  (e: 'openTrailer'): void
}>()

// ═══════════════════════════════════════════════════════════════
// ВЫЧИСЛЯЕМЫЕ СВОЙСТВА
// ═══════════════════════════════════════════════════════════════

/**
 * Текущий фильм, информация которого отображается
 */
const movie = computed(() => movieById.value)

/**
 * Проверяет, находится ли текущий фильм в избранном
 */
const isFavorite = computed(() => {
  if (!movie.value || !favoriteMovies.value) return false
  return favoriteMovies.value.some(favMovie => favMovie.id === movie.value?.id)
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
 * Открыть модальное окно трейлера фильма
 */
const openTrailer = () => {
  if (!movie.value?. trailerUrl) {
    console.warn('URL трейлера не найден')
    return
  }

  isTrailerModalVisible.value = true
  trailerUrl.value = convertYoutubeUrl(movie.value.trailerUrl)
}

/**
 * Закрыть модальное окно трейлера
 */
const closeTrailer = () => {
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
  if (!movie.value?.id) return

  try {
    // Если фильм в избранном - удаляем, если нет - добавляем
    if (isFavorite.value) {
      await favoriteStore.removeFavoriteMovies(movie.value.id)
    } else {
      await favoriteStore.addFavoriteMovies(movie.value.id)
    }

    // Обновляем список избранных фильмов после операции
    await favoriteStore. getFavoriteMovies()
  } catch (error) {
    console.error('Ошибка при работе с избранным:', error)
  }
}

// ═══════════════════════════════════════════════════════════════
// LIFECYCLE HOOKS
// ═══════════════════════════════════════════════════════════════

onMounted(() => {
  scrollToTop()
})
</script>

<template>
  <section class="movie__about">
    <div class="movie__wrap">
      <!-- Информация о фильме -->
      <div class="movie__card">
        <!-- Рейтинг, год, жанр, длительность -->
        <div class="movie__info">
          <div : class="`rating-label ${getRatingColor(movie?.tmdbRating)}`">
            <span class="rating-value">{{ formatRating(movie?.tmdbRating) }}</span>
          </div>
          <p class="movie__year">{{ movie?.releaseYear }}</p>
          <p class="movie__genre">{{ movie?.genres?.join(', ') || 'Нет данных' }}</p>
          <p class="movie__duration">{{ getTimeFormat(movie?.runtime) }}</p>
        </div>

        <!-- Название фильма -->
        <h1 class="movie__title">
          {{ movie?.title }}
        </h1>

        <!-- Описание фильма -->
        <p class="movie__desc">
          {{ movie?.plot }}
        </p>

        <!-- Кнопки действий -->
        <div class="movie__actions">
          <!-- Кнопка просмотра трейлера -->
          <button
            @click="openTrailer"
            type="button"
            class="btn-trailer"
          >
            Трейлер
          </button>

          <!-- Кнопка добавления в избранное -->
          <BaseButtonFavorite
            : movie-id="movie?. id"
            @open-modal="openModal"
            @toggle-movie="toggleFavoriteMovie"
          />
        </div>
      </div>

      <!-- Постер фильма -->
      <div class="movie__poster">
        <img
          :src="movie?.posterUrl ?? '/public/dummy_default.jpg'"
          alt="Постер фильма"
          class="img-poster"
        />
      </div>
    </div>

    <!-- Информация о фильме (режиссер, жанр и т.д.) -->
    <div class="movie__about-movie">
      <div class="about-movie">
        <div class="about-movie__parameter">Описание</div>
        <div class="about-movie__value">{{ movie?.plot || 'Нет данных' }}</div>
      </div>
      <div class="about-movie">
        <div class="about-movie__parameter">Режиссер</div>
        <div class="about-movie__value">{{ movie?.director || 'Нет данных' }}</div>
      </div>
      <div class="about-movie">
        <div class="about-movie__parameter">Продакшен</div>
        <div class="about-movie__value">{{ movie?.production || 'Нет данных' }}</div>
      </div>
      <div class="about-movie">
        <div class="about-movie__parameter">Награды</div>
        <div class="about-movie__value">{{ movie?.awardsSummary || 'Нет данных' }}</div>
      </div>
    </div>
  </section>

  <!-- Модальное окно трейлера -->
  <TrailerModal
    :visible="isTrailerModalVisible"
    : trailer-url="trailerUrl"
    @close="closeTrailer"
  />

  <!-- Модальное окно входа/регистрации -->
  <BaseModal
    :modal-type="props.modalType"
    : visible="isModalVisible"
    @close="closeModal"
  />
</template>

<style scoped>
/* ═══════════════════════════════════════════════════════════════ */
/* Section - О Фильме */
/* ═════════════════��═════════════════════════════════════════════ */
.movie__about {
  margin-bottom: 64px;
}

.movie__wrap {
  display: flex;
  gap: 16px;
  margin-bottom: 40px;
}

.movie__card {
  display: flex;
  flex: 1;
  flex-direction:  column;
  gap: 16px;
  max-width: 680px;
  font-family: Play;
}

.movie__info {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}

.rating-label {
  padding: 4px 12px;
  border-radius: 4px;
  font-weight: 700;
  font-size: 16px;
}

.rating-value {
  color: white;
}

.movie__year,
. movie__genre,
.movie__duration {
  font-size:  16px;
  font-weight:  400;
  line-height: 1.5;
}

.movie__title {
  font-size: 48px;
  font-weight: 700;
  line-height: 1.16;
}

.movie__desc {
  font-size: 18px;
  font-weight: 400;
  line-height: 1.33;
  min-height: 80px;
}

.movie__actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.btn-trailer {
  background: white;
  border: none;
  border-radius: 50px;
  padding: 8px 24px;

  font-family: var(--font-family);
  font-weight: 700;
  font-size: 16px;
  color: rgb(88, 86, 214);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-trailer:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(88, 86, 214, 0.3);
}

.movie__poster {
  flex: 1;
  max-width: 400px;
  max-height: 552px;
  overflow: hidden;
  border-radius: 8px;
}

.img-poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ═══════════════════════════════════════════════════════════════ */
/* About Movie Info Section */
/* ═══════════════════════════════════════════════════════════════ */
.movie__about-movie {
  display: grid;
  max-width: 640px;
  gap: 24px;
  font-size: 18px;
  line-height: 1.33;
}

.about-movie {
  display: grid;
  grid-template-columns: auto max-content;
  grid-template-areas: "parameter value";
  align-items: end;
  gap: 10px;
}

.about-movie__parameter {
  position: relative;
  grid-area: parameter;
  overflow: hidden;
  font-weight: 700;
}

.about-movie__parameter::after {
  content: 
    "........ ................................ "
    "........................................"
    ". ........................................";
  position: absolute;
  padding-left: 5px;
  text-align: right;
}

.about-movie__value {
  grid-area: value;
  font-weight: 400;
}

/* ═══════════════════════════════════════════════════════════════ */
/* Responsive Design */
/* ═══════════════════════════════════════════════════════════════ */
@media (max-width:  768px) {
  .movie__wrap {
    flex-direction: column;
  }

  .movie__title {
    font-size: 32px;
  }

  .movie__poster {
    max-width: 100%;
  }

  .movie__about-movie {
    max-width: 100%;
  }
}
</style>