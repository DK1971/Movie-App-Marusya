import { defineStore } from "pinia";
import { computed, ref } from "vue";
import CINEMA_API from "@/api/cinemaguideAPI";
import type { IUser } from "@/types/auth.ts";
import type { IMovies } from "@/types/movies.ts";

export const useUserStore = defineStore("user", () => {
  // state
  const user = ref<IUser | null>(
    localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user")!)
      : null,
  );

  const isAuthorized = ref<boolean>(
    localStorage.getItem("isAuthorized") === "true",
  );
  const isLoading = ref<boolean>(false);
  const favorites = ref<IMovies[] | null>(null);
  const token = ref<string>(localStorage.getItem("token") || "");
  const isRegCompleted = ref<boolean>(false);
  // переменная для хранения ошибок
  const error = ref<string | null>(null);

  // --- HELPERS ---
  /**
   * Информирует пользователя об ошибке
   * Обрабатывает различные типы ошибок и возвращает понятное сообщение
   * @param err - объект ошибки (может быть AxiosError или обычный Error)
   */
  const setError = (err: any) => {
    let message = "Неизвестная ошибка";

    // Проверяем наличие ответа от сервера (AxiosError)
    if (err.response) {
      const status = err.response.status;
      const data = err.response.data;

      // Обрабатываем специфичные статус-коды
      switch (status) {
        case 409:
          // Конфликт - пользователь уже существует
          message =
            data?.message || "Пользователь с таким email уже зарегистрирован";
          break;
        case 400:
          // Неверный запрос
          message = data?.message || "Неверные данные для регистрации";
          break;
        case 401:
          // Неавторизован
          message = data?.message || "Неверный email или пароль";
          break;
        case 422:
          // Ошибка валидации
          message = data?.message || "Ошибка валидации данных";
          break;
        case 500:
          // Ошибка сервера
          message = data?.message || "Ошибка сервера. Попробуйте позже";
          break;
        default:
          // Для других статус-кодов используем сообщение от сервера или общее
          message = data?.message || `Ошибка ${status}. Попробуйте позже`;
      }
    } else if (err.message) {
      // Если это обычная ошибка без response (например, сеть)
      message = err.message;
    }

    error.value = message;
    console.error("Ошибка:", message, err);
  };
  // Сбрасываем ошибку
  const clearError = () => {
    error.value = null;
  };

  // --- ACTIONS ---
  // Регистрация пользователя
  const registerUser = async (authInfo: {
    email: string;
    password: string;
    name: string;
    surname: string;
  }): Promise<any> => {
    isLoading.value = true;
    clearError();

    try {
      const response = await CINEMA_API.post("/user", authInfo);
      if (response.status === 200 && response.data) {
        console.log("Регистрация успешна:", response.data);
        return response.data;
      } else {
        throw new Error("Неверный ответ сервера при регистрации");
      }
    } catch (error) {
      setError(error);
      throw error; // Пробрасываем ошибку дальше, если нужно обработать её в вызывающем коде
    } finally {
      isLoading.value = false;
    }
  };

  // Выполняет вход и сохраняет токен/пользователя в сторе
  const loginUser = async (authInfo: {
    email: string;
    password: string;
  }): Promise<any> => {
    isLoading.value = true;
    clearError();

    try {
      const response = await CINEMA_API.post("/auth/login", authInfo);
      const data = response.data;

      console.log("Ответ от API:", data);

      // API может возвращать либо {result: true}, либо данные пользователя напрямую
      // Токен передается через cookie (withCredentials: true)

      // Проверяем успешность авторизации
      if (data && (data.result === true || data.email || data.name)) {
        // Если API вернул только {result: true}, получаем данные пользователя через /profile
        if (data.result === true && !data.email && !data.name) {
          try {
            // Получаем данные пользователя после успешной авторизации
            // Используем прямой запрос к API, чтобы не вызывать setError из getProfile
            const profileResponse = await CINEMA_API.get("/profile");
            if (profileResponse.data) {
              user.value = profileResponse.data;
            } else {
              // Если не удалось получить профиль, создаем минимальный объект пользователя
              user.value = {
                email: authInfo.email,
                name: "",
                surname: "",
              } as IUser;
            }
          } catch (profileError) {
            // Не критичная ошибка - авторизация прошла успешно, просто не получили профиль
            console.warn(
              "Не удалось получить профиль пользователя, используем минимальные данные:",
              profileError,
            );
            // Создаем минимальный объект пользователя на основе email из запроса
            user.value = {
              email: authInfo.email,
              name: "",
              surname: "",
            } as IUser;
          }
        } else {
          // Если API вернул данные пользователя напрямую
          user.value = data;
        }

        // Сохраняем данные пользователя
        localStorage.setItem("user", JSON.stringify(user.value));
        // Устанавливаем флаг авторизации
        isAuthorized.value = true;
        localStorage.setItem("isAuthorized", "true");
        // Назначаем токен (токен передается через cookie, но сохраняем флаг в localStorage)
        token.value = "userTokenValue";
        localStorage.setItem("token", token.value);

        console.log("Вход выполнен успешно", user.value);
        return user.value;
      } else {
        throw new Error("Неверный ответ сервера при авторизации");
      }
    } catch (error) {
      setError(error);
      // При ошибке очищаем данные авторизации
      clearAuth();
      throw error; // Пробрасываем ошибку дальше
    } finally {
      isLoading.value = false;
    }
  };

  // Запрос к API на получение профайла пользователя
  const getProfile = async () => {
    try {
      const response = await CINEMA_API.get("/profile");
      if (response.data) {
        user.value = response.data;
        localStorage.setItem("user", JSON.stringify(response.data));
        console.log("Профиль пользователя загружен:", user.value);
        return user.value;
      } else {
        throw new Error("Профиль пользователя не получен");
      }
    } catch (error) {
      setError(error);
      throw error; // Пробрасываем ошибку дальше
    }
  };

  // Выполняет выход и очистку данных утентификации
  const logOut = async () => {
    try {
      await CINEMA_API.get("/auth/logout");
      console.log("Выход выполнен успешно");
    } catch (error) {
      // ignore logout errors but log
      console.warn("Запрос на выход не удался ", error);
    } finally {
      // Очищаем данные в любом случае
      clearAuth();
      favorites.value = null;
    }
  };

  // Очиска данных аутентификации
  const clearAuth = () => {
    try {
      token.value = "";
      user.value = null;
      isAuthorized.value = false;
      isRegCompleted.value = false;
      error.value = null;

      localStorage.removeItem("isAuthorized");
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      console.log("Данные аутентификации очищены");
    } catch (error) {
      console.warn("Не удалось очистить аутенфикацию! ", error);
    }
  };

  // Получение текущего пользователя
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

  // --- GETTERS ---
  // computed-вариант получения инициалов для текущего пользователя
  const getUserInitials = computed(() => {
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
    favorites,
    error,
    clearError,
    getUser,
    registerUser,
    logOut,
    loginUser,
    getProfile,
    setError,
    clearAuth,
    getInitials,
    getUserInitials,
  };
});
