<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { storeToRefs } from "pinia";
import { useRoute, useRouter } from "vue-router";
import { useMoviesStore } from "../store/moviesStore.ts";
import BaseInput from "./BaseInput.vue";
import MovieInSearchBar from "./MovieInSearchBar.vue";

// Инициализируем роутер и стор фильмов один раз
const router = useRouter();
const route = useRoute();
const moviesStore = useMoviesStore();

// Получаем экшены и реактивные данные из стора
const { getMoviesByTitle, searchQuery, clearSearch } = moviesStore;
const { movieByTitle, searchTitle } = storeToRefs(moviesStore);

// Эмитим событие при открытии фильма (для закрытия модального окна в мобильной версии)
const emit = defineEmits<{
  (e: 'open-movie'): void;
}>();

// Локальное состояние строки поиска и фокуса инпута
const query = ref<string>(searchTitle.value || "");
const isFocused = ref<boolean>(false);

// Проверка, что в строке поиска есть минимум 2 символа
const hasMinChars = computed(() => query.value.trim().length >= 2);

// Проверяем, есть ли результаты поиска
const hasResults = computed(
  () => (movieByTitle.value?.length ?? 0) > 0
);

// Обработчик ввода в поле поиска
const handleInput = async () => {
  const text = query.value.trim();

  // Сохраняем текущий текст в стор (searchTitle)
  searchQuery(text);

  // Если меньше 2 символов — не ищем и очищаем результаты
  if (text.length < 2) {
    clearSearch();
    return;
  }

  // Разрешаем только английские буквы и цифры
  const isValidQuery = /^[A-Za-z0-9]+$/.test(text);
  if (!isValidQuery) {
    clearSearch();
    return;
  }

  // Делаем запрос к API через стор
  await getMoviesByTitle(text);
};

// Потеря фокуса: чуть откладываем, чтобы успел сработать клик по карточке
const handleBlur = () => {
  setTimeout(() => {
    isFocused.value = false;
  }, 200);
};

// Переход на страницу выбранного фильма
const openMovieCard = (movieId: number | string) => {
  // Сразу очищаем поле поиска и результаты
  query.value = "";
  isFocused.value = false;
  clearSearch();

  // Эмитим событие для закрытия модального окна в мобильной версии
  emit('open-movie');

  router.push(`/movie/${movieId}`);
};

// Очистка строки поиска и результатов
const inputReset = () => {
  query.value = "";
  clearSearch();
};

// Очистка поиска при любом переходе на другую страницу/вкладку (смена маршрута)
watch(
  () => route.fullPath,
  () => {
    query.value = "";
    isFocused.value = false;
    clearSearch();
  }
);
</script>

<template>
  <div class="search-bar">
    <form
          class="form"
          @submit.prevent>
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

    <!-- Окно с результатами  -->
    <div
         v-if="isFocused && hasMinChars"
         class="search-bar__window">
      <!-- Если есть результаты поиска — показываем список найденных фильмов -->
      <ul
          v-if="hasResults"
          class="search-bar__list">
        <MovieInSearchBar
                          v-for="movie in movieByTitle || []"
                          :key="movie.id"
                          :movie="movie"
                          @open-movie="openMovieCard" />
      </ul>

      <!-- Если результатов нет (в том числе из-за неверного ввода) => сообщение "Фильм не найден!"  -->
      <div
           v-else
           class="search-bar__list">
        <div class="search-bar__empty">
          Фильм не найден!
        </div>
      </div>
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
    z-index: 100;
    top: 70px;
    right: 0;
  }

  .search-bar__list {
    display: flex;
    flex-direction: column;
    width: 560px;
    height: auto;
    padding: 8px;
    border-radius: 8px;
    background-color: var(--background-gray-primary);
  }

  /* Адаптивные стили для мобильной версии */
  @media (max-width: 768px) {
    .search-bar__window {
      position: relative;
      top: 0;
      right: 0;
      margin-top: 16px;
    }

    .search-bar__list {
      width: 100%;
      max-height: 400px;
      overflow-y: auto;
    }
  }

  .search-bar__empty {
    padding-block: 30px;
    padding-inline: 20px;
    width: 100%;
    height: 90px;
    border: 1px solid transparent;
    background-color: inherit;
    text-align: center;
  }

  .search-bar__poster {
    width: 40px;
    height: 52px;
  }

  .movie__wrap {
    flex-direction: row;
  }

</style>