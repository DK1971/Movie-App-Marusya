<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
// Импорт из Store
import { useMoviesStore } from '@/store/moviesStore.ts';
// Импорт компонентов
import MobileBaseCardMovies from '@mobiles/MobileBaseCardMovies.vue';

// ===STORE ===
// MoviesStore
const store = useMoviesStore();
const router = useRouter();

// === COMPUTED ===
// Создаем вычисляемое свойство для первых 5 фильмов
const topFiveMovies = computed(() => {
  // Проверяем, что массив существует, и берем первые 5 элементов
  return store.moviesTop ? store.moviesTop.slice(0, 5) : [];
});

// === METHODS ===
// Функция для перехода на страницу фильма
const goToMovie = (id: number) => {
  router.push(`/movie/${id}`);
};

// === HOOKS ===
// Загружаем данные при монтировании
onMounted(() => {
  store.getTopMovies();
});
</script>

<template>
  <div class="carousel">
    <div v-if="store.isLoading" class="loading">Загрузка...</div>

    <div v-else class="carousel__container">
      <MobileBaseCardMovies
                            v-for="movie in topFiveMovies"
                            :key="movie.id"
                            :movie="movie"
                            @click="goToMovie(movie.id)" />
    </div>
  </div>
</template>

<style scoped>
  .carousel {
    width: 100%;
    overflow: hidden;
  }

  .carousel__container {
    display: flex;
    padding-inline: 20px;
    padding-block: 24px;
    gap: 40px;

    /* Скролл мышкой/пальцем */
    overflow-x: auto;
    scroll-behavior: smooth;

    /* Плавная остановка на карточках */
    scroll-snap-type: x mandatory;

    /* Убираем стандартную полосу прокрутки для чистого вида */
    scrollbar-width: none;
    /* Firefox */
  }

  .carousel__container::-webkit-scrollbar {
    display: none;
    /* Chrome/Safari */
  }

  .carousel__container > * {
    scroll-snap-align: start;
  }

  .loading {
    color: white;
    padding: 40px;
    text-align: center;
  }

  /* Плавная адаптивность: на маленьких экранах уменьшаем отступы */
  @media (max-width: 760px) {
    .carousel__container {
      gap: 20px;
      padding-inline: 15px;
    }
  }

</style>