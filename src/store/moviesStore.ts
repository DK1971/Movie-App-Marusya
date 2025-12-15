import { defineStore } from "pinia";
import { ref } from "vue";
import CINEMA_API from "../api/cinemaguideAPI";
import type { IMovies } from "../types/movies.ts";

export const useMoviesStore = defineStore("movies", () => {
  // state
  const movies = ref<IMovies[] | null>(null);
  const movieRandom = ref<IMovies | null>(null);
  const movieById = ref<IMovies | null>(null);
  const moviesTop = ref<IMovies[] | null>(null);
  const genres = ref<string[] | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref(null);

  // Информирует пользователя об ошибке
  const handleError = (error: any) => {
    throw new Error(
      error.response?.data?.message || "Нет доступа к API! Ошибка: " + error
    );
  };

  // Получаем ВСЕ фильмы или с опциональными параметрами (например { genre, title })
  const getMovies = async (params?: Record<string, any>): Promise<void> => {
    isLoading.value = true;
    try {
      const response = await CINEMA_API.get("/movie", { params });
      const data: IMovies[] = response.data;
      movies.value = data;
      console.log("Получаем фильмы по параметам ", params, movies.value);
    } catch (error) {
      handleError(error);
    } finally {
      isLoading.value = false;
    }
  };

  // Получаем TOP 10 фильмов
  const getTopMovies = async (): Promise<void> => {
    isLoading.value = true;
    try {
      const response = await CINEMA_API.get("/movie/top10");
      const data: IMovies[] = response.data;
      moviesTop.value = data;
      console.log(moviesTop.value);
    } catch (error) {
      handleError(error);
    } finally {
      isLoading.value = false;
    }
  };

  // Получаем случайный фильм
  const getMoviesByRandom = async (): Promise<void> => {
    isLoading.value = true;
    try {
      const response = await CINEMA_API.get("/movie/random");
      const data: IMovies = response.data;
      movieRandom.value = data;
      console.log(movieRandom.value);
    } catch (error) {
      handleError(error);
      console.error("Ошибка получения случайного фильма: ", error);
    } finally {
      isLoading.value = false;
    }
  };

  // Получаем список жанров фильмов
  const getMoviesByGenres = async () => {
    isLoading.value = true;
    try {
      const response = await CINEMA_API.get("/movie/genres");
      const data: string[] = response.data;
      genres.value = data;
      console.log(genres.value);
    } catch (error) {
      handleError(error);
    } finally {
      isLoading.value = false;
    }
  };

  // Получаем фильм по ID
  const getMovieById = async (id: number | string): Promise<void> => {
    isLoading.value = true;
    try {
      const response = await CINEMA_API.get(`/movie/${id}`);
      const data: IMovies = response.data;
      movieById.value = data;
      console.log("Фильм по ID ", movieById.value);
    } catch (error) {
      handleError(error);
    } finally {
      isLoading.value = false;
    }
  };

  // Обёртка для получения фильмов по жанру (сохраняет backward compatibility)
  const getMoviesByGenre = async (genre: string) => {
    return await getMovies({ genre });
  };

  // Возвращает все необходимые данные и методы
  return {
    movies,
    genres,
    moviesTop,
    movieRandom,
    movieById,
    isLoading,
    error,
    getMovies,
    getTopMovies,
    getMoviesByRandom,
    getMoviesByGenres,
    getMoviesByGenre,
    getMovieById,
  };
});
