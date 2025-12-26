<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { storeToRefs } from "pinia"
import { useMoviesStore } from '../store/moviesStore.ts'
import { formatRating, getRatingColor, getTimeFormat } from '../utils/movieUtils'
import BaseInput from './BaseInput.vue';

// Поддержка v-model
const props = defineProps<{ modelValue?: string }>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'search', value: string): void
  (e: 'reset'): void
}>()

// Store
const moviesStore = useMoviesStore()
const { fetchMovieByTitle, searchQuery, clearSearch } = moviesStore
const { movieByTitle } = storeToRefs(moviesStore)

// Локальная строка поиска (синхронизируется с modelValue)
const query = ref<string>(props.modelValue ?? "")
// Состояние фокуса
const isFocused = ref<boolean>(false)

// синхронизация входного prop -> локальный query
watch(
  () => props.modelValue,
  (v) => {
    query.value = v ?? ''
  }
)

// при изменении локального query: обновляем v-model у родителя, емитим событие search и вызываем fetch в store
watch(
  query,
  async (val) => {
    emit('update:modelValue', val)
    emit('search', val)
    const trimmed = val.trim()
    if (trimmed.length > 0) {
      await fetchMovieByTitle(trimmed)
    } else {
      // очистка результатов, если строка пуста
      clearSearch()
    }
  }
)


// При изменении локального запроса — обновляем v-model, стор и вызываем поиск
watch(query, (val) => {
  emit('update:modelValue', val)
  searchQuery(val)
  emit('search', val)
  if (!val) {
    clearSearch()
  }
})

const handleInput = async () => {
  const val = query.value.trim()
  if (val.length > 0) {
    await fetchMovieByTitle(val)
  }
}

// Сброс поиска (кнопка X)
const inputReset = () => {
  query.value = ""
  clearSearch()
  emit('reset')
}

const handleBlur = () => {
  // Небольшая задержка, чтобы обработать клик по результату или по reset
  setTimeout(() => {
    isFocused.value = false
  }, 200)
}


</script>

<template>
  <div class="search-bar">
    <form class="form" @submit.prevent>
      <!-- Поле ввода input для поиска по фильмам -->
      <BaseInput
                 v-model="query"
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
    <div v-if="isFocused && query.length > 0" class="search-bar__window">
      <!-- Блок результата поисков -->
      <ul class="search-bar__list">
        <!-- Элемент результата поиска -->
        <li
            v-for="item in movieByTitle ?? []"
            :key="item.id"
            class="search-bar__item">
          <router-link
                       :to="`/movie/${item.id}`"
                       @click="isFocused = false">
            <div class="movie">
              <div class="movie__poster search-bar__poster">
                <img
                     :src="item?.posterUrl ?? '/dummy_default.jpg'"
                     alt="Изображение фильма"
                     class="img-poster" />
              </div>
              <div class="movie__wrap reset">
                <div class="movie__info">
                  <div :class="`rating-label ${getRatingColor(item?.tmdbRating)}`">
                    <span class="rating-value">{{ formatRating(item?.tmdbRating) }}</span>
                  </div>
                  <p class="movie__year"> {{ item?.releaseYear }} </p>
                  <p class="movie__genre">{{ item?.genres?.join(', ') || 'Нет данных' }}</p>
                  <p class="movie__duration">{{ getTimeFormat(item?.runtime) }}</p>
                </div>
                <h1 class="movie__title">
                  {{ item?.title }}
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