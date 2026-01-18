<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { storeToRefs } from "pinia"
import TrailerModal from './Modals/TrailerModal.vue'
import BaseModal from "./BaseModal.vue";
import type { IMovies } from "../types/movies";
import { useMoviesStore } from '../store/moviesStore.ts'
import { useFavoriteMoviesStore } from '../store/favoriteMoviesStore.ts'
import { useUserStore } from '../store/userStore.ts'
import { scrollToTop, formatRating, getRatingColor, getTimeFormat, convertYoutubeUrl } from '../utils/movieUtils'
import BaseButtonFavorite from './BaseButtonFavorite.vue'

// === СОСТОЯНИЕ ИЗ ХРАНИЛИЩ ===
// MoviesStore
const moviesStore = useMoviesStore()
const { movieById } = storeToRefs(moviesStore)
// FavoriteStore
const favoriteStore = useFavoriteMoviesStore()
const { favoriteMovies } = storeToRefs(favoriteStore)
// UserStore
const userStore = useUserStore()
const { isAuthorized } = storeToRefs(userStore)

// === PROPS ===
interface MovieProps {
  movie: IMovies
  rank?: number
  modalType: 'login' | 'register' | 'complete',
  visible?: boolean
}

const movieProps = withDefaults(defineProps<MovieProps>(), {
  modalType: 'login'
})

// === EVENTS ===
const emit = defineEmits<{
  (e: 'open-modal'): void
  (e: 'toggle-movie'): void
  (e: 'open-trailer'): void
}>()

// === ВЫЧИСЛЯЕМЫЕ СВОЙСТВА ===
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

// === ЛОКАЛЬНОЕ СОСТОЯНИЕ (Refs) ===
// Видимость модального окна входа
const isModalVisible = ref(false)

// Видимость модального окна трейлера
const isTrailerModalVisible = ref(false)

// URL трейлера для отображения в модальном окне
const trailerUrl = ref('')

// === МЕТОДЫ ===
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
  if (!movie.value?.trailerUrl) {
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
      console.log("Удалить?");
      await favoriteStore.removeFavoriteMovies(movie.value.id)
    } else {
      console.log("Добавить?");
      await favoriteStore.addFavoriteMovies(movie.value.id)
    }

    // Обновляем список избранных фильмов после операции
    await favoriteStore.getFavoriteMovies()
  } catch (error) {
    console.error('Ошибка при работе с избранным:', error)
  }
}

// === LIFECYCLE HOOKS === 

onMounted(() => {
  scrollToTop()
})


</script>


<template>
  <section>
    <div class="movie__wrap">
      <!-- Информация о фильме -->
      <div class="movie__card">
        <!-- Рейтинг, год, жанр, длительность -->
        <div class="movie__info">
          <div :class="`rating-label ${getRatingColor(movie?.tmdbRating)}`">
            <span class="rating-value">{{ formatRating(movie?.tmdbRating) }}</span>
          </div>
          <p class="movie__year"> {{ movie?.releaseYear }} </p>
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
                  class="btn-trailer">
            Трейлер
          </button>
          <!-- Кнопка добавления в избранное -->
          <BaseButtonFavorite
                              :movie-id="movie?.id"
                              @open-modal="openModal"
                              @toggle-movie="toggleFavoriteMovie" />
        </div>
      </div>
      <!-- Постер фильма -->
      <div class="movie__poster">
        <img
             :src="movie?.posterUrl ?? '/public/dummy_default.jpg'"
             alt="Изображение фильма"
             class="img-poster" />
      </div>
    </div>
  </section>
  <!-- Информация о фильме (режиссер, жанр и т.д.) -->
  <section class="movie__about">
    <h2 class="section-title">О фильме</h2>
    <div class="movie__about-movie">
      <div class="about-movie">
        <div class="about-movie__parameter">Язык оригинала</div>
        <div class="about-movie__value">{{ movie?.language || 'Нет данных' }}</div>
      </div>
      <div class="about-movie">
        <div class="about-movie__parameter">Бюджет</div>
        <div class="about-movie__value">{{ movie?.budget || 'Нет данных' }}</div>
      </div>
      <div class="about-movie">
        <div class="about-movie__parameter">Выручка</div>
        <div class="about-movie__value">{{ movie?.revenue || 'Нет данных' }}</div>
      </div>
      <div class="about-movie">
        <div class="about-movie__parameter">Режиссёр</div>
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
                :trailerUrl="trailerUrl"
                @close="closeTrailer" />
  <!-- Модальное окно входа/регистрации -->
  <BaseModal
             :modal-type="movieProps.modalType"
             :visible="isModalVisible"
             @close="closeModal" />

</template>

<style scoped>

  /* Стили Section - О Фильме  */
  .movie__about {
    margin-bottom: 64px;
  }

  .movie__about-movie {
    display: grid;
    max-width: 640px;
    margin: 0;
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
  }

  .about-movie__parameter::after {
    content:
      "........................................"
      "....................................................." ".......................................................................................................................";
    position: absolute;
    padding-left: 5px;
    text-align: right;
  }

  .about-movie__value {
    grid-area: value;
  }
</style>