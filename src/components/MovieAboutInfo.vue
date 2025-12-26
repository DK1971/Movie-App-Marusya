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

const { movieById } = storeToRefs(useMoviesStore())
const favoriteStore = useFavoriteMoviesStore()
const { favoriteMovies } = storeToRefs(favoriteStore)
const userStore = useUserStore()
const { isAuthorized } = storeToRefs(userStore)

interface MovieProps {
  movie: IMovies
  rank?: number
  modalType: 'login' | 'register' | 'complete',
  visible?: boolean
}
const movieProps = defineProps<MovieProps>()

const emit = defineEmits<{
  (e: 'open-modal'): void
  (e: 'toggle-movie'): void
  (e: 'openTrailer'): void
}>()

const movie = computed(() => movieById.value)

const movieID = ref<number | null>()
movieID.value = movieById.value?.id

// Управление открытием/закрытием модального окна
// Определяем видимость
const isModalVisible = ref(false);
const isTrailerModalVisible = ref<boolean>(false)

const toggleModalVisible = () => {
  isModalVisible.value = !isModalVisible.value
}

const toggleTrailerVisible = () => {
  isTrailerModalVisible.value = !isTrailerModalVisible.value
}

// Задаем переменные и методы для открытия модального окна для просмотра трейлера
const trailerUrl = ref<string>('')

// Открыть модальное окно для просмотра трейлера
const openTrailer = () => {
  console.log('Открываем трейлер фильма в модальном окне')
  if (movie.value && movie.value.trailerUrl) {
    isTrailerModalVisible.value = true
    trailerUrl.value = convertYoutubeUrl(movie.value.trailerUrl)
    console.log(trailerUrl.value);
  } else {
    console.log('Ошибка открытия трейлера')
  }
}

// Добавление/удаление фильма из избранного
const isFavorite = computed(() => {
  if (!movie.value || !favoriteMovies.value) return false
  return favoriteMovies.value.some((m: any) => m.id === movie.value?.id)
})

// Открываем модальное окно для login
const openModal = () => {
  emit('open-modal')
}

const toggleFavoriteMovie = async () => {
  if (!isAuthorized.value) {
    console.log('Требуется войти в аккаунт')
    toggleModalVisible()
    return
  }
  if (!movie.value || !movie.value.id) return
  try {
    if (isFavorite.value) {
      await favoriteStore.removeFavoriteMovies(movie.value.id)
    } else {
      await favoriteStore.addFavoriteMovies(movie.value.id)
    }
    // Обновим список
    await favoriteStore.getFavoriteMovies()
  } catch (error) {
    console.error('Добавление/удаление фильма в/из избранного: ', error)
  }
}


onMounted(() => {
  scrollToTop()
})


</script>


<template>
  <section>
    <div class="movie__wrap">
      <div class="movie__card">
        <div class="movie__info">
          <div :class="`rating-label ${getRatingColor(movie?.tmdbRating)}`">
            <span class="rating-value">{{ formatRating(movie?.tmdbRating) }}</span>
          </div>
          <p class="movie__year"> {{ movie?.releaseYear }} </p>
          <p class="movie__genre">{{ movie?.genres?.join(', ') || 'Нет данных' }}</p>
          <p class="movie__duration">{{ getTimeFormat(movie?.runtime) }}</p>
        </div>
        <h1 class="movie__title">
          {{ movie?.title }}
        </h1>
        <p class="movie__desc">
          {{ movie?.plot }}
        </p>
        <div class="movie__actions">
          <button
                  @click="openTrailer"
                  type="button"
                  class="btn-trailer">
            Трейлер
          </button>
          <BaseButtonFavorite
                              @click="toggleFavoriteMovie"
                              @open-modal="openModal" />
        </div>
      </div>
      <div class="movie__poster">
        <img
             :src="movie?.posterUrl ?? '/public/dummy_default.jpg'"
             alt="Изображение фильма"
             class="img-poster" />
      </div>
    </div>
  </section>
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
  <TrailerModal
                :visible="isTrailerModalVisible"
                :trailerUrl="trailerUrl"
                @close="toggleTrailerVisible" />
  <BaseModal
             :modal-type="movieProps.modalType"
             :visible="isModalVisible"
             @close="toggleModalVisible" />

</template>

<style scoped>

  /* Стили Section - О Фильме  */
  .movie__about {
    margin-bottom: 64px;
  }

  .movie__about-movie {
    display: grid;
    max-width: 500px;
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