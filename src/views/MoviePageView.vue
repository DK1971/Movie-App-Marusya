<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import MovieAboutInfo from '../components/MovieAboutInfo.vue';
import { useMoviesStore } from '../store/moviesStore';

const route = useRoute();
const moviesStore = useMoviesStore();
const { movieById, isLoading } = storeToRefs(moviesStore);
const { getMovieById } = moviesStore;

const loadMovieDetails = async (id?: string | string[]) => {
  if (!id) return;
  const movieId = typeof id === 'string' ? id : id?.[0];
  if (movieId) await getMovieById(movieId);
}

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
                    :movie="movieById" />

    <div v-else>
      <p>Информация о фильме не найдена.</p>
    </div>
  </section>
</template>

<style scoped></style>