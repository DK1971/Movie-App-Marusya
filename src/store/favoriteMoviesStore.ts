import { defineStore } from "pinia";
import { ref } from "vue";
import CINEMA_API from "../api/cinemaguideAPI";
import type { IMovies } from "../types/movies.ts";

export const useFavoriteMoviesStore = defineStore("favoriteMovies", () => {
  // state
  // Список избранных фильмов
  const favoriteMovies = ref<IMovies[] | null>();

  // actions
  // Информирует пользователя об ошибке
  const handleError = (error: any) => {
    console.error("Ошибка запроса: ", error);
  };

  // Проверяем, является ли фильм в списке избранных
  const isFavorite = (favorites: IMovies[], id: number): boolean => {
    return favorites.some((movie: any): any => movie.id === id);
  };

  // Получаем Список избранных фильмов
  const getFavoriteMovies = async () => {
    try {
      const response = await CINEMA_API.get("/favorites");
      favoriteMovies.value = response.data || []; // Обновляем список избранных фильмов
      console.log(favoriteMovies.value);
    } catch (error) {
      handleError(error);
    }
  };

  const addFavoriteMovies = async (movieId: number) => {
    try {
      await CINEMA_API.post("/favorites", {
        id: movieId.toString(),
      });
      console.log("Добавляем фильм в избранное");
      await getFavoriteMovies(); // Обновляем список избранных фильмов
    } catch (error) {
      handleError(error);
    }
  };

  // Удаляем фильм из списка избранных фильмов по кнопке delete в карточке фильма
  const removeFavoriteMovies = async (movieId: number) => {
    try {
      await CINEMA_API.delete(`/favorites/${movieId.toString()}`);
      console.log("Удаляем фильм в избранное");
      // Обновляем список после удаления
      favoriteMovies.value = favoriteMovies.value?.filter(
        (movie: IMovies) => movie.id !== movieId
      );
      await getFavoriteMovies();
    } catch (error) {
      handleError(error);
    }
  };

  // Добавление/удаление фильма в Избранном переключением кнопки toggle
  const toggleFavorite = async (movie: IMovies) => {
    try {
      if (favoriteMovies.value) {
        const isAlreadyFavorite = isFavorite(favoriteMovies.value, movie.id);
        if (isAlreadyFavorite) {
          // Удаляем из избранного
          await removeFavoriteMovies(movie.id);
        } else {
          // Добавляем в избранное
          await addFavoriteMovies(movie.id);
        }
      }
    } catch (error) {
      handleError(error);
    }
  };

  return {
    favoriteMovies,
    isFavorite,
    getFavoriteMovies,
    addFavoriteMovies,
    removeFavoriteMovies,
    toggleFavorite,
  };
});
