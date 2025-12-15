<script setup lang="ts">
import { onMounted, computed } from "vue"
import { storeToRefs } from 'pinia';
import { useMoviesStore } from '../store/moviesStore.ts'
import RandomMovie from "./RandomMovie.vue"
import BaseCardMovies from "./BaseCardMovies.vue"

const moviesStore = useMoviesStore()
const { getTopMovies, getMoviesByRandom } = moviesStore
const { movieRandom, moviesTop } = storeToRefs(moviesStore)

const random = computed(() => movieRandom.value ?? null)

const topMovies = computed(() => moviesTop.value ?? [])

onMounted(async () => {
  // Загружаем случайный фильм
  await getMoviesByRandom()
  // Получаем топ фильмов при монтировании компонента, если ещё нет
  if (!moviesTop.value || moviesTop.value.length === 0) {
    await getTopMovies()
  }
})
</script>

<template>
  <div class="container movies">
    <section class="movies__random">
      <RandomMovie
                   :movie="random"
                   @changeRandomMovie="getMoviesByRandom" />
    </section>
    <section class="movies__top">
      <h2 class="section-title">Топ 10 фильмов</h2>
      <div
           v-if="!moviesTop || moviesTop.length === 0"
           class="movies__not-found">
        Фильмы не найдены!
      </div>
      <ul v-else class="movies__top-list">
        <BaseCardMovies
                        v-for="(movie, index) in topMovies"
                        :key="movie.id"
                        :movie="movie"
                        :rank="index + 1" />
      </ul>
    </section>
  </div>
</template>

<style scoped>
  .movies {
    display: flex;
    flex-direction: column;
  }

  .movies__random {
    padding-block-end: 40px;
  }

  /* Стили Section - Top 10 */
  .movies__top {
    margin-bottom: 64px;
  }

  .movies__top-list {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 64px 40px;
  }

  .movies__not-found {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5rem;
  }

  .movies__top-item {
    position: relative;
    width: 222px;
    background: rgba(60, 60, 60, 1);
    border: 1px solid rgba(255, 255, 255, 0.33);
    box-shadow: 0px 0px 80px 0px rgba(255, 255, 255, 0.33);
    transition: transform 0.3s ease;
  }

  .movies__top-item:hover {
    /* Эффект увеличения при наведении */
    transform: scale(1.05);
  }

  .top-item-label {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    top: -15px;
    left: -15px;
    z-index: 100;
    background-color: var(--main-white);
    border: none;
    border-radius: 50px;
    padding: 8px 24px;

    font-family: var(--font-family);
    font-weight: 700;
    font-size: 24px;
    line-height: 1.33;
    color: rgb(88, 86, 214);
    cursor: pointer;
  }

  /* Стили Section - О Фильме  */
  .movies__about {
    margin-bottom: 64px;
  }

  .movies__about-movie {
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



  /* Genres rard */
  .card-genres {
    display: flex;
    flex-direction: column;
    align-items: center;

    width: 328px;
    height: 304px;

    border: 1px solid rgba(255, 255, 255, 0.25);
    box-shadow: 0px 0px 80px 0px rgba(255, 255, 255, 0.33);
    border-radius: 24px;

    overflow: hidden;
  }

  .card-genres__img {
    width: 100%;
    height: 220px;
    background-color: var(--background-card);
    /* overflow: hidden; */
  }

  .card-genres__title {
    padding-block: 22px 30px;
    width: 100%;
    height: 84px;
    font-size: 24px;
    font-weight: 700;
    text-align: center;
    background-color: rgba(10, 11, 11, 1);
  }

  @media (max-width: 1280px) {

    /* Section Movies random */
    .movies__random {
      flex-direction: column-reverse;
    }

    /* Section Movies random Img */
  }
</style>