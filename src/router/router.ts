import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "../store/userStore";

const router = createRouter({
  history: createWebHistory("./"),
  routes: [
    {
      path: "/",
      name: "Home",
      component: () => import("../views/HomePageView.vue"),
    },
    {
      path: "/genres",
      name: "Genres",
      component: () => import("../views/GenresPageView.vue"),
    },
    {
      path: "/genre/:genre",
      name: "MoviesByGenre",
      component: () => import("../views/MoviesByGenrePageView.vue"),
      props: true,
    },
    {
      path: "/movie/:id",
      name: "MovieDetails",
      component: () => import("../views/MoviePageView.vue"),
    },
    {
      path: "/account",
      name: "Account",
      component: () => import("../views/AccountPageView.vue"),
      meta: { requiresAuth: true }, // Добавляем метаданные для проверки авторизации
      children: [
        {
          path: "favorites",
          component: () => import("../components/FavoriteMovies.vue"),
        },
        {
          path: "settings",
          component: () => import("../components/UserSettings.vue"),
        },
      ],
    },
  ],
});

// router.beforeEach((to, _from, next) => {
//   const authStore = useUserStore();

//   // Проверяем и обновляем состояние isAuthorized из localStorage
//   authStore.isAuthorized = localStorage.getItem("isAuthorized") === "true";

//   if (to.meta.requiresAuth && !authStore.isAuthorized) {
//     next("/login"); // Перенаправляем на страницу входа
//   } else {
//     next();
//   }
// });

export default router;
