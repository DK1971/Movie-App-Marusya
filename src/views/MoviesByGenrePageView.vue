<script setup lang="ts">
import { onMounted, watch, computed, onUnmounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from "vue-router";
import BaseCardMovies from "../components/BaseCardMovies.vue";
import { useMoviesStore } from '../store/moviesStore';
// import { genreTranslations } from '../utils/movieUtils'

const props = defineProps<{ genre: string }>();

const moviesStore = useMoviesStore();
const { movies, isLoading } = storeToRefs(useMoviesStore());
const { getMovies } = moviesStore;

const load = async (g?: string) => {
  if (!g) return;
  await getMovies({ genre: g });
}

const router = useRouter();
// Переход на страницу Жанры
const goToGenres = () => {
  router.push(`/genres`);
};

// Словарь переводов жанров фильмов
const genreTranslations: Record<string, string> = {
  action: "Боевик",
  adventure: "Приключение",
  animation: "Мультфильм",
  comedy: "Комедия",
  crime: "Детектив",
  documentary: "Документальный",
  drama: "Драма",
  family: "Семейный",
  fantasy: "Фантастика",
  history: "Исторический",
  horror: "Ужасы",
  music: "Музыкальный",
  mystery: "Мистика",
  romance: "Романтика",
  scifi: "Научно-фантастический",
  "stand-up": "Стендап",
  thriller: "Триллер",
  "tv-movie": "Телефильм",
  war: "Военный",
  western: "Вестерн",
};


// Метод перевода названия жанра для заголовка
const genreTitle = computed(() => {
  const g = props.genre;
  if (!g) return 'Выбранный жанр';
  return genreTranslations[g] || (g.charAt(0).toUpperCase() + g.slice(1));
});


// Клиентская пагинация / ленивая загрузка карточек 
const displayedMovies = ref<any[]>([]);
const initialCount = 10;
const batchCount = 5;
const currentIndex = ref(0);
const allLoaded = ref(false);
const isAppending = ref(false);

const resetPagination = () => {
  displayedMovies.value = [];
  currentIndex.value = 0;
  allLoaded.value = false;
  isAppending.value = false;
}

const appendNext = () => {
  if (!movies.value || isAppending.value || allLoaded.value) return;
  isAppending.value = true;
  const source = movies.value as any[];
  const nextSlice = source.slice(currentIndex.value, currentIndex.value + batchCount);
  displayedMovies.value.push(...nextSlice);
  currentIndex.value += nextSlice.length;
  if (currentIndex.value >= source.length) allLoaded.value = true;
  isAppending.value = false;
}

const onScroll = () => {
  if (isAppending.value || isLoading.value || allLoaded.value) return;
  const nearBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 300);
  if (nearBottom) {
    appendNext();
  }
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

onMounted(async () => {
  scrollToTop()
  if (props.genre) await load(props.genre);
  // подписываемся на скролл для ленивой подгрузки
  window.addEventListener('scroll', onScroll);
});

watch(() => props.genre, async (newVal, oldVal) => {
  if (newVal && newVal !== oldVal) {
    await load(newVal);
  }
});

// при изменении списка фильмов и после загрузки — инициализируем пагинацию
watch(movies, (newMovies) => {
  resetPagination();
  const source = newMovies as any[] | null;
  if (!source || source.length === 0) return;
  // сначала отображаем initialCount (или меньше, если элементов меньше)
  const first = source.slice(0, initialCount);
  displayedMovies.value = first;
  currentIndex.value = first.length;
  if (currentIndex.value >= source.length) allLoaded.value = true;
});

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
});




</script>

<template>
  <section class="container movies">
    <h2
        class="section-title return"
        @click="goToGenres()">
      <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
           width="40.000000" height="40.000000" fill="none">
        <rect id="icon / chevron" width="40.000000" height="40.000000" x="0.000000" y="0.000000" fill="rgb(255,255,255)"
              fill-opacity="0" />
        <path id="Vector"
              d="M18.047 20.0012L26.2967 28.2507L23.9397 30.6077L13.333 20.0012L23.9397 9.39453L26.2967 11.7515L18.047 20.0012Z"
              fill="rgb(255,255,255)" fill-rule="nonzero" />
      </svg>
      {{ genreTitle }}
    </h2>

    <div v-if="isLoading">
      <p>Загрузка фильмов...</p>
    </div>

    <ul
        v-else-if="displayedMovies && displayedMovies.length > 0"
        class="movies__list">
      <BaseCardMovies
                      v-for="(m, index) in displayedMovies"
                      :key="m.id ?? index"
                      :movie="m" />
    </ul>

    <div v-else>
      <p>Фильмы жанра {{ props.genre }} не найдены!</p>
    </div>

  </section>
</template>

<style scoped>
  .movies {
    display: flex;
    flex-direction: column;
    padding-bottom: 64px;
  }

  .movies__list {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 64px 40px;
  }

  .return {
    display: flex;
    cursor: pointer;
  }

  .return svg {
    width: 40px;
  }

</style>