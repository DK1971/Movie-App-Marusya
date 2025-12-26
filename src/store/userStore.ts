import { defineStore } from "pinia";
import { computed, ref } from "vue";
import CINEMA_API from "../api/cinemaguideAPI";
import type { IUser } from "../types/auth.ts";
import type { IMovies } from "../types/movies.ts";

export const useUserStore = defineStore("user", () => {
  // state
  const user = ref<IUser | null>(
    (() => {
      try {
        const user = localStorage.getItem("user");
        return user ? JSON.parse(user) : { name: "User", email: "" };
      } catch {
        return { name: "User", email: "" };
      }
    })()
  );
  const isAuthorized = ref<boolean>(
    localStorage.getItem("isAuthorized") === "true"
  );
  const token = ref<string>(localStorage.getItem("token") || "");
  const isRegCompleted = ref<boolean>(false);
  const isLoading = ref<boolean>(false);
  const favorites = ref<IMovies[] | null>(null);
  const error = ref<any>(null);

  // actions
  // Проверка fутентификации на сохрание (token, data)
  const persistAuth = (userData: any, authToken?: string) => {
    try {
      if (authToken) {
        token.value = authToken;
        localStorage.setItem("token", authToken);
      }
      if (userData) {
        user.value = userData;
        localStorage.setItem("user", JSON.stringify(userData));
      }
      isAuthorized.value = true;
    } catch (error) {
      console.warn("Не удалось сохранить аутенфикацию! ", error);
    }
  };

  // Очиска данных аутентификации
  const clearAuth = () => {
    try {
      token.value = "";
      user.value = null;
      isAuthorized.value = false;
      localStorage.removeItem("isAuthorized");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch (error) {
      console.warn("Не удалось очистить аутенфикацию! ", error);
    }
  };

  // Информирует пользователя об ошибке
  const handleError = (error: any) => {
    const message = error?.response?.data?.message || String(error);
    error.value = message;
    console.error(message);
    throw error;
  };

  // Выполняет выход и очистку данных утентификации
  const logOut = async () => {
    try {
      await CINEMA_API.get("/auth/logout");
      clearAuth();
      favorites.value = [];
    } catch (error) {
      // ignore logout errors but log
      console.warn("Запрос на выход не удался ", error);
    }
  };

  // Выполняет вход и сохраняет токен/пользователя в сторе
  const loginUser = async (authInfo: {
    email: string;
    password: string;
  }): Promise<any> => {
    isLoading.value = true;
    try {
      if (!authInfo.email || !authInfo.password) {
        throw new Error("Электронная почта и пароль обязательны для входа!");
      }
      // Запрос к api на login
      const response = await CINEMA_API.post("/auth/login", authInfo);
      const data = response.data;
      // поддерживаем несколько вариантов ответа
      const tokenValue =
        data?.token ||
        data?.accessToken ||
        (data?.data && data.data.token) ||
        "";
      const userData = data?.user || (data?.data && data.data.user) || data;
      persistAuth(userData, tokenValue);
      console.log(data);
      return data;
    } catch (error) {
      handleError(error);
    } finally {
      isLoading.value = false;
    }
  };

  // Регистрация пользователя
  const registerUser = async (authInfo: {
    email: string;
    password: string;
    name?: string;
    surname?: string;
  }): Promise<any> => {
    isLoading.value = true;
    try {
      if (!authInfo.email || !authInfo.password) {
        throw new Error(
          "Электронная почта и пароль обязательны для регистрации"
        );
      }
      const response = await CINEMA_API.post("/user", authInfo);
      const data = response.data;
      // Не всегда API возвращает token — не сохраняем автоматически
      const tokenValue = data?.token || data?.accessToken || "";
      const userData = data?.user || (data?.data && data.data.user) || data;
      if (tokenValue || userData) {
        persistAuth(userData, tokenValue);
      }
      console.log(data);
      return data;
    } catch (error) {
      handleError(error);
    } finally {
      isLoading.value = false;
    }
  };

  const getProfile = async () => {
    try {
      const response = await CINEMA_API.get("/profile");
      user.value = response.data;
      console.log(user.value);
      return user.value;
    } catch (error) {
      handleError(error);
    }
  };

  const getUser = () => {
    return user.value || { name: "User", email: "" };
  };

  const getInitials = (authInfo: {
    name?: string;
    surname?: string;
  }): string => {
    const first = authInfo.name?.trim()?.charAt(0).toUpperCase() ?? "";
    const second = authInfo.surname?.trim()?.charAt(0).toUpperCase() ?? "";
    return `${first}${second}`;
  };

  // computed-вариант получения инициалов для текущего пользователя
  const initials = computed(() => {
    if (!user.value) return "";
    const first = user.value.name?.trim()?.charAt(0).toUpperCase() ?? "";
    const second = user.value.surname?.trim()?.charAt(0).toUpperCase() ?? "";
    return `${first}${second}`;
  });

  // Возвращает все необходимые данные и методы
  return {
    user,
    token,
    isAuthorized,
    isRegCompleted,
    isLoading,
    error,
    getUser,
    registerUser,
    logOut,
    loginUser,
    getProfile,
    handleError,
    persistAuth,
    clearAuth,
    getInitials,
    initials,
  };
});
