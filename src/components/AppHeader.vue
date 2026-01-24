<script setup lang="ts">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter, useRoute } from "vue-router";
// Импорт стора
import { useUserStore } from '@/store/userStore.ts'
import { useDisplayStore } from '@/store/useDisplayStore.ts'
// Импорт компонентов
import HeaderLogo from '@layouts/HeaderLogo.vue';
import HeaderMenu from '@layouts/HeaderMenu.vue';
import HeaderSeachBar from '@layouts/HeaderSeachBar.vue';
import HeaderAuth from '@layouts/HeaderAuth.vue';
// Импорт мобильных версий (иконок)
import MobileHeaderMenu from '@mobiles/MobileHeaderMenu.vue';
import MobileHeaderSearch from '@mobiles/MobileHeaderSearch.vue';
import MobileHeaderAuth from '@mobiles/MobileHeaderAuth.vue';

// === STORE ===
// UserStore
const userStore = useUserStore()
const { isAuthorized } = storeToRefs(userStore)
// DisplayStore
const { isLaptop, isTablet, isMobile } = storeToRefs(useDisplayStore());

// === ИСПОЛЬЗОВАНИЕ ROUTER ===
const router = useRouter();
const route = useRoute();

// === ВЫЧИСЛЯЕМЫЕ СВОЙСТВА ===
// Состояние для управления видимостью поиска в мобильной версии
const isSearchOpen = ref(false);

// === EVENTS ===
const emit = defineEmits<{
  (e: 'open'): void
  (e: 'open-account'): void
  (e: 'open-search'): void
}>()

// === МЕТОДЫ ===
const openModal = () => {
  emit('open')
}

const goToAccount = () => {
  emit('open-account')
  router.push("/account/favorites");
};

const handleAuthClick = () => {
  if (isAuthorized.value) {
    goToAccount()
  } else {
    openModal()
  }
}

const openSearchBar = () => {
  isSearchOpen.value = !isSearchOpen.value;
  emit('open-search')
}

const closeSearchBar = () => {
  isSearchOpen.value = false;
}

// Закрываем поиск при смене маршрута (например, при переходе на страницу фильма)
watch(
  () => route.fullPath,
  () => {
    if (isMobile.value) {
      isSearchOpen.value = false;
    }
  }
);

</script>

<template>
  <header id="top" class="header">
    <div class="container header__container">
      <HeaderLogo />

      <template v-if="!isLaptop">
        <HeaderMenu />
        <HeaderAuth @click="handleAuthClick" />
      </template>

      <template v-else>
        <div class="mobile-controls">

          <MobileHeaderMenu />

          <!-- Строка поиска фильмов и блок результата поисков -->
          <template v-if="!isMobile">
            <HeaderSeachBar />
          </template>
          <template v-else>
            <MobileHeaderSearch @click="openSearchBar" />
          </template>

          <MobileHeaderAuth @click="handleAuthClick" />
        </div>

        <!-- Мобильная версия поиска - показывается поверх контента -->
        <div v-if="isMobile && isSearchOpen" class="mobile-search-overlay" @click.self="closeSearchBar">
          <div class="mobile-search-container">
            <button class="mobile-search-close" @click="closeSearchBar">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
            </button>
            <HeaderSeachBar @open-movie="closeSearchBar" />
          </div>
        </div>
      </template>

    </div>
  </header>
</template>

<style scoped>
  .header {
    background-color: var(--background-header);
  }

  .header__container {
    padding-block: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 80px;
  }

  .mobile-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    gap: 40px;
    /* Расстояние между иконками */
  }

  /* Мобильная версия поиска */
  .mobile-search-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 80px;
    padding-inline: 20px;
  }

  .mobile-search-container {
    position: relative;
    width: 100%;
    max-width: 100%;
    background-color: var(--background-header);
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .mobile-search-close {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-primary, #fff);
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
  }

  .mobile-search-close:hover {
    opacity: 0.7;
  }

  @media (max-width: 768px) {
    .mobile-controls {
      justify-content: flex-end;
      gap: 20px;
    }
  }
</style>