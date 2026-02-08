<script setup lang="ts">
import { onMounted, computed, ref } from "vue"
import { storeToRefs } from 'pinia';
import { useRouter } from "vue-router";
import type { IMovies } from "@/types/movies.ts";
import { getRatingColor, formatRating, getTimeFormat, convertYoutubeUrl } from '@/utils/movieUtils'
// Импорт из Store
import { useMoviesStore } from '@/store/moviesStore'
import { useUserStore } from '@/store/userStore'
import { useFavoriteMoviesStore } from '@/store/favoriteMoviesStore';
// Импорт компонентов
import BaseButtonFavorite from '@bases/BaseButtonFavorite.vue'
import BaseModal from "@components/BaseModal.vue";
import BaseButtonTrailer from "@bases/BaseButtonTrailer.vue";
import TrailerModal from '@modals/TrailerModal.vue'

// === STORE ===
// MoviesStore
const moviesStore = useMoviesStore()
const { getMoviesByRandom } = moviesStore
const { movieRandom } = storeToRefs(moviesStore)
// FavoriteStore
const favoriteStore = useFavoriteMoviesStore()
const { favoriteMovies } = storeToRefs(favoriteStore)
// UserStore
const userStore = useUserStore()
const { isAuthorized } = storeToRefs(userStore)

// === ROUTER ===
const router = useRouter()

// === PROPS ===
interface MovieProps {
  rank?: number
  modalType?: 'login' | 'register' | 'complete',
  visible?: boolean,
  trailerUrl?: string,
  trailerYouTubeId?: string
}

const movieProps = defineProps<MovieProps>()

// === EVENTS ===
const emit = defineEmits<{
  // (e: 'openCard'): void
  (e: 'open-modal'): void
  // (e: 'changeRandomMovie'): void
  (e: 'openTrailerModal'): void
  (e: 'closeTrailerModal'): void
  (e: 'openMovieAboutInfo'): void
  (e: 'hiddenSection'): void
}>()

// === ВЫЧИСЛЯЕМЫЕ СВОЙСТВА ===
/**
 * Текущий показываемый случайный фильм
 */
const randomMovie = computed(() => movieRandom.value)

/**
 * Проверяет, находится ли текущий случайный фильм в избранном
 */
const isFavorite = computed(() => {
  if (!randomMovie.value || !favoriteMovies.value) return false
  return favoriteMovies.value.some(movie => movie.id === randomMovie.value?.id)
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
 * Открыть карточку фильма (перейти на страницу информации о фильме)
 */
const openCard = () => {
  if (!randomMovie.value?.id) return
  // Переходим на страницу с информацией о фильме
  router.push(`/movie/${randomMovie.value.id}`)
}

/**
 * Загрузить новый случайный фильм
 */
const changeRandomMovie = async () => {
  try {
    await getMoviesByRandom()
    console.log('Случайный фильм после клика кнопки: ', movieRandom.value)
  } catch (error) {
    console.error('Ошибка при получении случайного фильма:', error)
  }
}

// Открываем модальное окно для login
const openModal = () => {
  isModalVisible.value = true
  emit('open-modal')
}

// Закрываем модальное окно входа
const closeModal = () => {
  isModalVisible.value = false
}

// Управление открытием/закрытием модального окна
const toggleModalVisible = () => {
  isModalVisible.value = !isModalVisible.value
}

/**
 * Открыть модальное окно с трейлером фильма
 */
const openTrailerModal = () => {
  if (!randomMovie.value?.trailerUrl) return

  isTrailerModalVisible.value = true
  trailerUrl.value = convertYoutubeUrl(randomMovie.value.trailerUrl)
}

/**
 * Закрыть модальное окно с трейлером
 */
const closeTrailerModal = () => {
  isTrailerModalVisible.value = false
  trailerUrl.value = ""; // Сбрасываем URL трейлера при закрытии
}

/**
 * Переключаем кнопку Избранное с сохранением или удалением фильма в избранном
 */
const toggleFavoriteMovie = async () => {
  if (!isAuthorized.value) {
    console.log('Требуется войти в аккаунт')
    openModal()
    console.log('открываем модалку');
    return
  }
  // Если нет ID фильма - выходим
  if (!randomMovie.value?.id) return

  try {
    // Если фильм в избранном - удаляем, если нет - добавляем
    if (isFavorite.value && isAuthorized.value) {
      console.log("Удалить?");
      await favoriteStore.removeFavoriteMovies(randomMovie.value.id)
    } else {
      console.log("Добавить?");
      await favoriteStore.addFavoriteMovies(randomMovie.value.id)
    }
    // Обновляем список избранных фильмов после операции
    await favoriteStore.getFavoriteMovies()
  } catch (error) {
    console.log('Ошибка при работе с избранным: ', error)
  }
}

// === LIFECYCLE HOOKS ===
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
        <div :class="`rating-label ${getRatingColor(randomMovie?.tmdbRating)}`">
          <span class="rating-value">{{ formatRating(randomMovie?.tmdbRating) }}</span>
        </div>
        <p class="movie__year"> {{ randomMovie?.releaseYear }} </p>
        <p class="movie__genre">{{ randomMovie?.genres?.join(', ') || 'Нет данных' }}</p>
        <p class="movie__duration">{{ getTimeFormat(randomMovie?.runtime) }}</p>
      </div>
      <!-- Название фильма -->
      <h1 class="movie__title">
        {{ randomMovie?.title }}
      </h1>
      <!-- Описание фильма -->
      <p class="movie__desc  clamped-plot">
        {{ randomMovie?.plot }}
      </p>
      <!-- Кнопки действий -->
      <div class="movie__actions">

        <!-- Кнопка просмотра трейлера -->
        <BaseButtonTrailer
                           :url="randomMovie?.trailerUrl"
                           @open="openTrailerModal" />

        <!-- Кнопка открытия информации о фильме -->
        <button
                @click="openCard"
                type="button"
                class="btn-info">
          О фильме
        </button>

        <!-- Кнопка добавления в избранное -->
        <BaseButtonFavorite
                            :movie-id="randomMovie?.id"
                            @open-modal="openModal"
                            @toggle-movie="toggleFavoriteMovie" />

        <!-- Кнопка загрузки нового случайного фильма -->
        <button
                @click="changeRandomMovie"
                type="button"
                class="btn-actions">
          <img
               src="/public/icons/change.svg"
               class="icon"
               alt="Случайный фильм" />
        </button>
      </div>
    </div>

    <!-- Постер фильма -->
    <div class="movies__random-img">
      <img
           :src="randomMovie?.posterUrl ?? '/public/dummy_default.jpg'"
           alt="Постер фильма"
           class="img-poster" />
    </div>
  </div>
  <!-- Модальное окно трейлера -->
  <TrailerModal
                :visible="isTrailerModalVisible"
                :trailer-url="trailerUrl"
                @close="closeTrailerModal" />
  <!-- Модальное окно входа/регистрации -->
  <BaseModal
             :modal-type="movieProps.modalType"
             :visible="isModalVisible"
             @close="closeModal" />
</template>

<style scoped>
  .movies__random-wrap {
    display: flex;
    gap: 16px;
  }

  .movies__card {
    display: flex;
    /* flex: 1; */
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
    font-weight: 700;
    line-height: 1.16;
  }

  .movies__plot {
    font-size: 24px;
    font-weight: 400;
    line-height: 1.33;
    min-height: 100px;
  }

  .clamped-plot {
    line-clamp: 5;
    display: -webkit-box;
    -webkit-line-clamp: 5;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .movies__actions {
    display: flex;
    gap: 16px;
  }

  .movies__random-img {
    flex: 1;
    margin: 0 auto;
    border-radius: 16px;
    max-width: 680px;
    max-height: 552px;
    overflow: hidden;
  }

  .img-poster {
    width: 100%;
  }

  @media (max-width: 1280px) {
    .movies__card {
      max-width: 560px;
    }
  }

  @media (max-width: 1024px) {
    .movies__random-wrap {
      flex-direction: column-reverse;
    }

    .movies__card {
      max-width: 100%;
      margin-top: 24px;
    }

    .movies__random-img {
      margin: 0;
      max-width: 100%;
      max-height: 454px;
    }
  }

  @media (max-width: 768px) {
    .movies__card {
      margin-top: 16px;
    }

    .movies__random-img {
      max-height: 354px;
    }
  }

  @media (max-width: 425px) {
    .movies__random-img {
      max-height: 234px;
    }
  }

</style>