<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter } from 'vue-router';
import type { IMovies } from "../types/movies";

const router = useRouter();

// Принимаем объект фильма как пропс
const props = defineProps<{
  movie: IMovies
}>();

// Текущее значение src для постера — меняется при ошибке или при отсутствии posterUrl
const currentPoster = ref(props.movie?.posterUrl ?? '/dummy_default.jpg')

const imageLoaded = ref(true)

const posterError = () => {
  imageLoaded.value = false;
  currentPoster.value = '/dummy_default.jpg'
};

// Если меняется входной posterUrl — обновляем currentPoster
watch(() => props.movie?.posterUrl, (newVal) => {
  currentPoster.value = newVal ?? '/dummy_default.jpg'
})

const emit = defineEmits<{
  (e: 'open'): void
}>()

const openCard = () => {
  // Навигация на страницу инфо о фильме по ID
  if (props.movie?.id) {
    router.push(`/movie/${props.movie.id}`);
    emit('open');
  }
}

</script>

<template>
  <li
      @click="openCard"
      @error="posterError"
      class="movie-card">
    <img
         :src="currentPoster"
         :title="movie.title"
         :alt="movie.originalTitle"
         class="movie-card__image" />
  </li>
</template>

<style scoped>
  .movie-card {
    flex-shrink: 0;
    /* Чтобы карточки не сжимались в flex-контейнере */
    width: 224px;
    height: 336px;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 1);
    background: rgba(60, 60, 60, 1);
    overflow: hidden;
    position: relative;
    cursor: pointer;
    /* transition: transform 0.3s ease; */
  }

  /* .movie-card:hover {
    transform: scale(1.02);
  } */

  .movie-card__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

</style>