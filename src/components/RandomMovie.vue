<script setup lang="ts">
import { onMounted, computed, ref } from "vue"
import { storeToRefs } from 'pinia';
import { useRouter } from "vue-router";
import type { IMovies } from "../types/movies";
import { useMoviesStore } from '../store/moviesStore.ts'
import { useUserStore } from '../store/userStore.ts'
import { useFavoriteMoviesStore } from '../store/favoriteMoviesStore.ts';
import { getRatingColor, formatRating, getTimeFormat, convertYoutubeUrl } from '../utils/movieUtils'
import BaseButtonFavorite from './BaseButtonFavorite.vue'
import TrailerModal from './Modals/TrailerModal.vue'
import BaseModal from "./BaseModal.vue";
import BaseButtonTrailer from "./BaseButtonTrailer.vue";

const { getMoviesByRandom } = useMoviesStore()
const { movieRandom } = storeToRefs(useMoviesStore())

const favoriteStore = useFavoriteMoviesStore()
const { favoriteMovies } = storeToRefs(favoriteStore)

const userStore = useUserStore()
const { isAuthorized } = storeToRefs(userStore)

const randomMovie = computed(() => movieRandom?.value);

const router = useRouter();

interface MovieProps {
  movie: IMovies
  rank?: number
  modalType: 'login' | 'register' | 'complete',
  visible?: boolean,
  trailerUrl?: string,
  trailerYouTubeId?: string
}

const movieProps = defineProps<MovieProps>()

// Получаем ID случайного фильма для открытия карточки фильма 
const movieID = ref<number>()
movieID.value = randomMovie.value?.id

const openCard = () => {
  console.log('Открываем карточку фильма с ID: ', movieProps.movie?.id);
  // Навигируем на страницу деталей фильма по ID
  if (movieProps.movie?.id) {
    router.push(`/movie/${movieProps.movie.id}`);
  }
}

// Смена случайного фильма
const changeRandomMovie = async () => {
  console.log('Смена случайного фильма');
  try {
    await getMoviesByRandom()
    console.log('Случайный фильм после клика кнопки: ', movieRandom.value)
  } catch (error) {
    console.log('Ошибка при получении случайного фильма: ', error)
  }
}

// Добавление/удаление фильма из избранного
const isFavorite = computed(() => {
  if (!randomMovie.value || !favoriteMovies.value) return false
  return favoriteMovies.value.some((m: any) => m.id === randomMovie.value?.id)
})

// Открываем модальное окно для login
const openModal = () => {
  emit('open-modal')
}

// Управление открытием/закрытием модального окна
// Определяем видимость
const isModalVisible = ref<boolean>(false);
const isTrailerModalVisible = ref<boolean>(false)

const toggleModalVisible = () => {
  isModalVisible.value = !isModalVisible.value
}

// Задаем переменные и методы для открытия модального окна для просмотра трейлера
const trailerUrl = ref<string>('')

// Метод для открытия модального окна с переданным URL трейлера
const openTrailerModal = () => {
  console.log('=== ОТКРЫТО МОДАЛЬНОЕ ОКНО ТРЕЙЛЕРА ===');

  // Проверяем наличие фильма
  if (!randomMovie.value) {
    console.error('❌ Фильм не загружен');
    return;
  }

  console.log('✅ Фильм найден:', randomMovie.value.title);

  // Проверяем наличие URL трейлера
  if (!randomMovie.value.trailerUrl) {
    console.warn('⚠️ URL трейлера отсутствует для фильма:', randomMovie.value.title);
    return;
  }

  console.log('📹 Исходный URL:', randomMovie.value.trailerUrl);

  // Преобразуем URL
  const convertedUrl = convertYoutubeUrl(randomMovie.value.trailerUrl);
  console.log('🔄 Преобразованный URL:', convertedUrl);

  // ✅ Проверяем наличие URL
  if (convertedUrl && convertedUrl.trim()) {
    trailerUrl.value = convertedUrl;
    isTrailerModalVisible.value = true;
    console.log('✅ Модал ОТКРЫТ с URL:', trailerUrl.value);
    console.log('✅ isTrailerModalVisible.value = ', isTrailerModalVisible.value);
  } else {
    console.error('❌ convertedUrl пуст или invalid');
  }
};


// Метод для закрытия модального окна
const closeTrailerModal = () => {
  isTrailerModalVisible.value = false;
  trailerUrl.value = ""; // Сбрасываем URL трейлера при закрытии
  console.log('❌ Модал закрыт');
};

// Переключаем кнопку Избранное с сохранением или удалением фильма в избранном
const toggleFavoriteMovie = async () => {
  if (!isAuthorized.value) {
    console.log('Требуется войти в аккаунт')
    toggleModalVisible()
    console.log('открываем модалку');
    return
  }
  if (!randomMovie.value || !randomMovie.value.id) return
  try {
    if (isFavorite.value && isAuthorized.value) {
      console.log("Удалить?");
      await favoriteStore.removeFavoriteMovies(randomMovie.value.id)
    } else {
      console.log("Добавить?");
      await favoriteStore.addFavoriteMovies(randomMovie.value.id)
    }
    await favoriteStore.getFavoriteMovies()
  } catch (error) {
    console.log('Ошибка добавленяе/удаления фильма в/из избранного: ', error)
  }
}

const emit = defineEmits<{
  (e: 'openCard'): void,
  (e: 'open-modal'): void
  (e: 'changeRandomMovie'): void,
  (e: 'openTrailerModal'): void,
  (e: 'closeTrailerModal'): void,
  (e: 'openMovieAboutInfo'): void,
  (e: 'hiddenSection'): void
}>()

onMounted(async () => {
  await getMoviesByRandom()
})

</script>

<template>
  <div class="movies__random-wrap">
    <div class="movies__card">
      <div class="movie__info">
        <div :class="`rating-label ${getRatingColor(randomMovie?.tmdbRating)}`">
          <span class="rating-value">{{ formatRating(randomMovie?.tmdbRating) }}</span>
        </div>
        <p class="movie__year"> {{ randomMovie?.releaseYear }} </p>
        <p class="movie__genre">{{ randomMovie?.genres?.join(', ') || 'Нет данных' }}</p>
        <p class="movie__duration">{{ getTimeFormat(randomMovie?.runtime) }}</p>
      </div>
      <h1 class="movie__title">
        {{ randomMovie?.title }}
      </h1>
      <p class="movie__desc">
        {{ randomMovie?.plot }}
      </p>
      <div class="movie__actions">
        <BaseButtonTrailer
                           :url="randomMovie?.trailerUrl"
                           @open="openTrailerModal" />
        <button
                @click="openCard"
                type="button"
                class="btn-info">
          О фильме
        </button>
        <BaseButtonFavorite
                            @open-modal="openModal"
                            @toggle-movie="toggleFavoriteMovie" />
        <button
                @click="changeRandomMovie"
                type="button"
                class="btn-actions">
          <img src="/public/icons/change.svg" class="icon" alt="Случайный фильм" />
        </button>
      </div>
    </div>
    <div class="movies__random-img">
      <img
           :src="randomMovie?.posterUrl ?? ''"
           alt="Изображение фильма"
           class="img-poster" />
    </div>
  </div>
  <TrailerModal
                :visible="isTrailerModalVisible"
                :trailer-url="trailerUrl"
                @close="closeTrailerModal" />
  <BaseModal
             :modal-type="movieProps.modalType"
             :visible="isModalVisible"
             @close="toggleModalVisible" />
</template>

<style scoped>
  .movies__random-wrap {
    display: flex;
    gap: 16px;
  }

  .movies__card {
    display: flex;
    flex: 1;
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

  .movies__actions {
    display: flex;
    gap: 16px;
  }

  .movies__random-img {
    flex: 1;
    max-width: 680px;
    max-height: 552px;
    overflow: hidden;
  }



</style>