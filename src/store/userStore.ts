import { defineStore } from "pinia";
import { ref } from "vue";
import CINEMA_API from "../api/cinemaguideAPI";
import type { IUser } from "../types/auth.ts";
import type { IMovies } from "../types/movies.ts";

export const useUserStore = defineStore("user", () => {
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
  const error = ref<string | null>(null);

  // handleError больше не бросает исключение — он записывает сообщение в error и возвращает текст
  const handleError = (err: any): string => {
    const res = err?.response;
    const message =
      res?.data?.message ||
      res?.data?.error ||
      (res?.data && JSON.stringify(res.data)) ||
      err.message ||
      String(err);
    error.value = message;
    console.error("API Error:", {
      status: res?.status,
      url: res?.config?.url,
      method: res?.config?.method,
      requestData: res?.config?.data,
      responseData: res?.data,
      message,
      originalError: err,
    });
    return message;
  };

  const persistAuth = (userData: any, authToken?: string) => {
    try {
      if (authToken) {
        token.value = authToken;
        localStorage.setItem("token", authToken);
        isAuthorized.value = true;
        localStorage.setItem("isAuthorized", "true");
      }
      if (userData) {
        user.value = userData;
        localStorage.setItem("user", JSON.stringify(userData));
      }
    } catch (err) {
      console.warn("Не удалось сохранить аутенфикацию! ", err);
    }
  };

  const clearAuth = () => {
    try {
      token.value = "";
      user.value = null;
      isAuthorized.value = false;
      localStorage.removeItem("isAuthorized");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch (err) {
      console.warn("Не удалось очистить аутенфикацию! ", err);
    }
  };

  const logOut = async () => {
    try {
      await CINEMA_API.get("/auth/logout");
      clearAuth();
      favorites.value = [];
    } catch (err) {
      console.warn("Запрос на выход не удался ", err);
    }
  };

  // Вход — возвращаем объект { success, message?, data? } и не бросаем исключение
  const loginUser = async (authInfo: {
    email?: string;
    password: string;
    login?: string;
  }): Promise<{ success: boolean; message?: string; data?: any }> => {
    isLoading.value = true;
    error.value = null;
    try {
      if ((!authInfo.email && !authInfo.login) || !authInfo.password) {
        const msg = "Электронная почта/логин и пароль обязательны для входа!";
        error.value = msg;
        return { success: false, message: msg };
      }

      console.log("loginUser payload:", authInfo);

      const response = await CINEMA_API.post("/auth/login", authInfo);
      const data = response.data;

      if (data && data.result === false) {
        const msg = data.message || data.error || "Неверные учётные данные";
        error.value = msg;
        return { success: false, message: msg, data };
      }

      if (data && data.error) {
        error.value = data.error;
        return { success: false, message: data.error, data };
      }

      const tokenValue =
        data?.token ||
        data?.accessToken ||
        (data?.data && data.data.token) ||
        "";
      const userData = data?.user || (data?.data && data.data.user) || data;

      if (!tokenValue && !(userData && userData.id)) {
        const msg = data?.message || data?.error || "Не удалось выполнить вход";
        error.value = msg;
        return { success: false, message: msg, data };
      }

      persistAuth(userData, tokenValue);
      console.log("login response:", data);
      return { success: true, data };
    } catch (err) {
      const msg = handleError(err);
      return { success: false, message: msg };
    } finally {
      isLoading.value = false;
    }
  };

  // Регистрация — также возвращаем структуру, не бросаем
  const registerUser = async (authInfo: {
    email: string;
    password: string;
    name?: string;
    surname?: string;
  }): Promise<{ success: boolean; message?: string; data?: any }> => {
    isLoading.value = true;
    error.value = null;
    try {
      if (!authInfo.email || !authInfo.password) {
        const msg = "Электронная почта и пароль обязательны для регистрации";
        error.value = msg;
        return { success: false, message: msg };
      }

      console.log("registerUser payload:", authInfo);
      const response = await CINEMA_API.post("/user", authInfo);
      const data = response.data;
      console.log("register response:", data);

      if (data && data.error) {
        error.value = data.error;
        return { success: false, message: data.error, data };
      }

      if (data && data.result === false) {
        const msg = data.message || "Регистрация не удалась";
        error.value = msg;
        return { success: false, message: msg, data };
      }

      const tokenValue = data?.token || data?.accessToken || "";
      const userData = data?.user || (data?.data && data.data.user) || data;

      if (tokenValue) {
        persistAuth(userData, tokenValue);
        return { success: true, data };
      }

      // Успех создания, но без токена — возвращаем успех, UI может показать экран "Зарегистрирован"
      return { success: true, data };
    } catch (err) {
      const msg = handleError(err);
      return { success: false, message: msg };
    } finally {
      isLoading.value = false;
    }
  };

  const getProfile = async () => {
    try {
      const response = await CINEMA_API.get("/profile");
      user.value = response.data;
      return user.value;
    } catch (err) {
      handleError(err);
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
  };
});
