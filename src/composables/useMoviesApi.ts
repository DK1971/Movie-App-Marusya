import CINEMA_API from '@/api/cinemaguideAPI';
import type { IMovies } from '@/types/movies.ts';

export function useMoviesApi() {
  const getTopMovies = async () => {
    const { data } = await CINEMA_API.get<IMovies[]>('/movie/top');
    return data;
  };

  const getRandomMovie = async () => {
    const { data } = await CINEMA_API.get<IMovies>('/movie/random');
    return data;
  };

  const getMovieById = async (id: string | number) => {
    const { data } = await CINEMA_API.get<IMovies>(`/movie/${id}`);
    return data;
  };

  const getMoviesByGenre = async () => {
    const { data } = await CINEMA_API.get<string[]>('/movie/genres');
    return data;
  };

  const searchMovies = async (query: string) => {
    const { data } = await CINEMA_API.get<IMovies[]>(`/movie/search`, {
      params: { q: query },
    });
    return data;
  };

  return {
    getTopMovies,
    getRandomMovie,
    getMovieById,
    getMoviesByGenre,
    searchMovies,
  };
}