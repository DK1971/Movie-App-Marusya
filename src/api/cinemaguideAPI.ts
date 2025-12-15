import axios from "axios";

const CINEMA_API = axios.create({
  baseURL: "https://cinemaguide.skillbox.cc",
  withCredentials: true,
});

// Добавляем токен в заголовок Authorization для всех запросов
CINEMA_API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Обработка 401 ошибки для перенаправления на авторизацию
CINEMA_API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("User is not authorized. Redirecting to login.");
      // Здесь можно добавить логику для перенаправления на страницу авторизации
    }
    return Promise.reject(error);
  }
);

export default CINEMA_API;
