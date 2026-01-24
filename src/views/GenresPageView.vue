<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from "vue-router";
import CardGenres from '@bases/BaseCardGenres.vue'
// Импорт из Store
import { useMoviesStore } from '@/store/moviesStore.ts'

// === STATE ===
// MoviesStore
const { getMoviesByGenres } = useMoviesStore()
const { genres } = storeToRefs(useMoviesStore())

// === ИСПОЛЬЗОВАНИЕ ROUTER ===
const router = useRouter();
const goToGenre = (genre: string) => {
  router.push(`/genre/${genre}`);
};

// === LIFECYCLE HOOKS ===
onMounted(async () => {
  await getMoviesByGenres()
})
</script>

<template>
  <section class="genres container">
    <h2 class="section-title">Жанры фильмов</h2>
    <ul
        v-if="genres && genres.length > 0" class="genres__list">
      <CardGenres
                  v-for="(genre, index) in genres"
                  :key="index"
                  :movie="genre"
                  @click="goToGenre(genre)" />
    </ul>
    <div v-else>
      <p>Жанры не найдены или ошибка при загрузке данных.</p>
    </div>
  </section>
</template>


<style scoped>
  .genres {
    padding-bottom: 64px;
  }

  .genres__list {
    display: flex;
    flex-wrap: wrap;
    gap: 64px 40px;
    justify-content: center;
  }
</style>