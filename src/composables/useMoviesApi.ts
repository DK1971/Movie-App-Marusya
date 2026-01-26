// Wrapper for Movies API calls
import { ref } from 'vue';
import { CINEMA_API } from '@/api';

export function useMoviesApi() {
  const movies = ref([]);
  const error = ref(null);

  const getMovies = async () => {
    try {
      const response = await CINEMA_API.get('/movies');
      movies.value = response.data;
    } catch (err) {
      error.value = err;
    }
  };

  const getMoviesByTitle = async (title) => {
    try {
      const response = await CINEMA_API.get(`/movies?title=${title}`);
      movies.value = response.data;
    } catch (err) {
      error.value = err;
    }
  };

  return { movies, error, getMovies, getMoviesByTitle };
}