<script setup lang="ts">
import type { IMovies } from "../types/movies";
import { formatRating, getRatingColor, getTimeFormat } from "../utils/movieUtils";

// Простой и понятный проп: в компонент приходит один фильм
interface MovieProps {
  movie: IMovies;
}

const props = defineProps<MovieProps>();

// Событие, которое будет отправлено в родительский компонент
// Передаём ID фильма, чтобы родитель знал, какой фильм открыть
const emit = defineEmits<{
  (e: "open-movie", movieId: number | string): void;
}>();

const openMovieCard = () => {
  emit("open-movie", props.movie.id);
};
</script>

<template>
  <!-- Элемент результата поиска -->
  <li
      class="search-bar__item"
      @click="openMovieCard">
    <div class="search-bar__movie">
      <div class="search-bar__poster">
        <img
             :src="movie?.posterUrl ?? '/public/dummy_default.jpg'"
             alt="Изображение фильма"
             class="search-bar__img" />
      </div>
      <div class="search-bar__movie--info">
        <!-- Grid колонки для информации о фильме-->
        <div
             class="movie--rating"
             :class="`rating-label ${getRatingColor(movie?.tmdbRating)}`">
          <span class="rating-value">{{ formatRating(movie?.tmdbRating) }}</span>
        </div>
        <p class="movie--year">{{ movie?.releaseYear }}</p>
        <p class="movie--genre">{{ movie?.genres?.join(', ') || 'Нет данных' }}</p>
        <p class="movie--duration">{{ getTimeFormat(movie?.runtime) || 'Нет данных' }}</p>
        <!-- Grig колонка-строка для заголовка -->
        <h1 class="movie--title">{{ movie?.title || 'Нет данных' }}</h1>
      </div>
    </div>
  </li>
</template>

<style scoped>
  .search-bar__item {
    padding-block: 20px;
    padding-inline: 8px;
    width: 100%;
    height: 92px;
    border: 1px solid transparent;
    border-radius: 6px;
    background-color: inherit;
    transition: border .1s ease-in;
  }

  .search-bar__item:active,
  .search-bar__item:hover {
    border: 1px solid var(--main-white, rgba(255, 255, 255, 0.5));
  }

  .search-bar__poster {
    flex-shrink: 0;
    width: 40px;
    height: 52px;
    overflow: hidden;
  }

  .search-bar__movie {
    display: flex;
    gap: 16px;
  }

  .search-bar__img {
    object-fit: cover;
  }

  .movie__wrap {
    flex-direction: row;
  }

  .search-bar__movie--info {
    display: grid;
    /* Создаем 4 колонки для инфо-элементов: их ширина зависит от контента (max-content) */
    /* Последняя колонка 1fr заберет оставшееся место, если нужно */
    grid-template-columns: repeat(4, max-content);
    align-items: center;
    /* Расстояние между колонками и строками */
    column-gap: 12px;
    row-gap: 8px;
  }

  .movie--rating {
    padding: 2px 8px;
  }

  .movie--rating .rating-value {
    font-size: 12px;
  }

  /* Ставим выбранные колонки на первую строку */
  .movie--rating,
  .movie--year,
  .movie--genre,
  .movie--duration {
    grid-row: 1;
  }

  /* Настраиваем заголовок как отдельную колонку, растянутую на всю строку от 1-й до 5-й линии (охватывает 4 колонки) */
  .movie--title {
    grid-column: 1 / 5;
    grid-row: 2;
    /* Ставим на вторую строку */

    font-size: 18px;
    font-weight: 700;
    font-style: Bold;
    line-height: 1.2;
    text-align: left;
  }
</style>