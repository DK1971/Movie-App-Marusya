import { ref } from 'vue';
import { useMoviesApi } from '@/composables/useMoviesApi';

export function useFetchMovies() {
  const movies = ref<any[]>([]);
  const movieById = ref<any | null>(null);
  const genres = ref<string[] | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const api = useMoviesApi();

  const loadTopMovies = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      movies.value = await api.getTopMovies();
    } catch (err: any) {
      error.value = err.message || 'Ошибка запроса';
    } finally {
      isLoading.value = false;
    }
  };

  const loadMovieById = async (id: string | number) => {
    isLoading.value = true;
    try {
      movieById.value = await api.getMovieById(id);
    } catch (err: any) {
      error.value = err.message || 'Ошибка запроса';
    } finally {
      isLoading.value = false;
    }
  };

  const loadGenres = async () => {
    isLoading.value = true;
    try {
      genres.value = await api.getMoviesByGenre();
    } finally {
      isLoading.value = false;
    }
  };

  return {
    movies,
    movieById,
    genres,
    isLoading,
    error,
    loadTopMovies,
    loadMovieById,
    loadGenres,
  };
}