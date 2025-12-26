<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { storeToRefs } from "pinia"
import type { IMovies } from "../types/movies";
import { useMoviesStore } from '../store/moviesStore.ts'
import { formatRating, getRatingColor, getTimeFormat } from '../utils/movieUtils'
import BaseInput from './BaseInput.vue';

interface Movie {
  movie: IMovies
  visible?: boolean
}

const { fetchMovieByTitle, searchQuery, clearSearch } = useMoviesStore()
const { movieById, movieByTitle, searchTitle } = storeToRefs(useMoviesStore())

const movie = computed(() => movieByTitle.value)

const emit = defineEmits<{
  (e: 'search', value: string): void
  (e: 'reset'): void
}>()

const query = ref<string>("");
query.value = searchTitle.value;
const results = ref<Movie[]>([]);
const isFocused = ref<boolean>(false)

// Связываем результаты с данными из стора
const updateSearch = () => {
  searchQuery(query.value);
};


const handleInput = async () => {
  if (query.value.length > 0) {
    await fetchMovieByTitle(query.value.trim())
  }
}

const handleBlur = () => {
  // Задержка нужна, чтобы успел сработать клик по результату или кнопке сброса
  setTimeout(() => {
    isFocused.value = false;
  }, 200);
};

const inputReset = () => {
  emit('reset')
  query.value = ""
  results.value = []
}

watch(query, (val) => {
  emit('search', val)
})
</script>

<template>
  <div class="search-bar">
    <form class="form" @submit.prevent>
      <!-- Поле ввода input для поиска по фильмам -->
      <BaseInput
                 v-model.trim="query"
                 @input="handleInput"
                 @focus="isFocused = true"
                 @blur="handleBlur"
                 class="form__input"
                 placeholder="Поиск" />
      <!-- Кнопка очистки строки поиска -->
      <button
              v-if="query.length > 0"
              @mousedown.prevent="inputReset"
              class="input-reset">
        <img
             src="/icons/x-icon.svg"
             alt="Очистить строку поиска" />
      </button>
    </form>
    <div
         v-if="isFocused && query.length > 0" class="search-bar__window">
      <!-- Блок результата поисков -->
      <ul class="search-bar__list">
        <!-- Элемент результата поиска -->
        <li class="search-bar__item">
          <router-link to="`/movie/${item.id}`">
            <div class="movie">
              <div class="movie__poster search-bar__poster">
                <img
                     :src="movie?.posterUrl ?? '/public/dummy_default.jpg'"
                     alt="Изображение фильма"
                     class="img-poster" />
              </div>
              <div class="movie__wrap reset">
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
              </div>
            </div>
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
  .form {
    position: relative;
    width: 100%;
  }

  .form__input {
    position: relative;
    background-image: url('/icons/search.svg');
    background-repeat: no-repeat;
    background-position: center left 16px
  }

  .input-reset {
    position: absolute;
    /* display: none; */
    right: 20px;
    padding-inline: 0;
    opacity: 0.5;
    cursor: pointer;
  }

  .search-bar {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
  }

  .search-bar__window {
    position: absolute;
    top: 70px;
    right: 0;
  }

  .search-bar__list {
    display: flex;
    flex-direction: row;
    width: 560px;
    height: auto;
    padding: 8px;
    background-color: var(--background-gray-primary);
  }

  .search-bar__item {
    padding-block: 20px;
    padding-inline: 8px;
    width: 100%;
    height: 92px;
    border: 1px solid var(--main-white, rgba(255, 255, 255, 0.5));
    border-radius: 6px;
    background-color: inherit;
  }

  .search-bar__poster {
    width: 40px;
    height: 52px;
  }

  .movie__wrap {
    flex-direction: row;
  }

</style>