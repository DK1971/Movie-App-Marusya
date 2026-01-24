<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
// Импорт компонентов
import MovieAboutInfo from '@layouts/MovieAboutInfo.vue';
// Импорт из Store
import { useMoviesStore } from '@/store/moviesStore.ts';

// === ROUTER ===
const route = useRoute();

// === STATE ===
// MoviesStore
const moviesStore = useMoviesStore();
const { movieById, isLoading } = storeToRefs(moviesStore);
const { getMovieById } = moviesStore;

// === МЕТОДЫ ===
const loadMovieDetails = async (id?: string | string[]) => {
  if (!id) return;
  const movieId = typeof id === 'string' ? id : id?.[0];
  if (movieId) await getMovieById(movieId);
}

// === LIFECYCLE HOOKS === 
onMounted(async () => {
  if (route.params.id) {
    await loadMovieDetails(route.params.id);
  }
});

watch(() => route.params.id, async (newId, oldId) => {
  if (newId && newId !== oldId) {
    await loadMovieDetails(newId);
  }
});

</script>

<template>
  <section class="container">
    <div v-if="isLoading">
      <p>Загрузка информации о фильме...</p>
    </div>

    <MovieAboutInfo
                    v-else-if="movieById"
                    :movie="movieById"
                    modal-type="login" />

    <div v-else>
      <p>Информация о фильме не найдена.</p>
    </div>
  </section>
</template>

<style scoped></style>