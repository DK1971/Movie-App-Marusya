<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import type { IMovies } from "../types/movies";
import { useFavoriteMoviesStore } from "../store/favoriteMoviesStore"
import { useUserStore } from "../store/userStore"
import { storeToRefs } from 'pinia'

interface MovieCardProps {
  movie: IMovies,
  rank?: number,
  showDelete?: boolean
}

const favoriteStore = useFavoriteMoviesStore()
const { favoriteMovies } = storeToRefs(favoriteStore)
const userStore = useUserStore()
const { isAuthorized } = storeToRefs(userStore)

// Состояние для отслеживания события :hover 
const isHovered = ref(false);

const props = defineProps<MovieCardProps>()
const router = useRouter();

const emit = defineEmits<{
  (e: 'open'): void
  (e: 'delete'): void
  (e: 'open-modal'): void
}>()

const openCard = () => {
  if (!isAuthorized.value) router.push('/')
  // Навигация на страницу инфо о фильме по ID
  if (props.movie?.id) {
    router.push(`/movie/${props.movie.id}`);
    emit('open');
  }
}

// Удаляем карточку из Избранного
const deleteCardFromFavorites = async (evt?: Event) => {
  // предотвращаем всплытие чтобы не открывать карточку
  if (evt && typeof evt.stopPropagation === 'function') evt.stopPropagation()

  // если удаление не разрешено — ничего не делаем
  if (!props.showDelete) return

  try {
    await favoriteStore.removeFavoriteMovies(props.movie.id)
    // обновляем список и уведомляем родителя
    await favoriteStore.getFavoriteMovies()
    emit('delete')
  } catch (error) {
    console.error('Ошибка удаления фильма из Избранного ', error)
  }
}

// Текущее значение src для постера — меняется при ошибке или при отсутствии posterUrl
const currentPoster = ref(props.movie?.posterUrl ?? '/dummy_default.jpg')

// Если меняется входной posterUrl — обновляем currentPoster
watch(() => props.movie?.posterUrl, (newVal) => {
  currentPoster.value = newVal ?? '/dummy_default.jpg'
})

const imageLoaded = ref(true)
const posterError = () => {
  imageLoaded.value = false;
  currentPoster.value = '/dummy_default.jpg'
};

</script>

<template>
  <li
      class="movies__top-item"
      @click="openCard"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false">
    <div class="movies__wrapper">
      <img
           :src="currentPoster"
           @error="posterError"
           width="221"
           :title="props.movie?.title"
           :alt="props.movie?.originalTitle"
           class="movies__poster" />
    </div>
    <!-- Отображаем нумерацию только если index передан -->
    <div v-if="props.rank !== undefined" class="top-item-label">{{ props.rank }}</div>
    <!-- Кнопка удаления карточки из Избранного -->
    <button
            v-if="isHovered && props.showDelete"
            @click.stop="deleteCardFromFavorites"
            class="btn-close card-delete">
      <img
           src="/icons/x-icon.svg"
           alt="Удалить" />
    </button>
  </li>
</template>

<style scoped>
  .movies__top-item {
    position: relative;
    width: 222px;
    background: rgba(60, 60, 60, 1);
    border: 1px solid rgba(255, 255, 255, 0.33);
    border-radius: 16px;
    box-shadow: 0px 0px 80px 0px rgba(255, 255, 255, 0.33);

    transition: transform 0.3s ease;
  }

  .movies__top-item:hover {
    /* Эффект увеличения при наведении */
    transform: scale(1.05);
  }

  .movies__wrapper {
    height: 100%;
    border-radius: 16px;
    overflow: hidden;
  }

  .movies__wrapper img {
    height: 100%;
  }

  .movies__poster {
    text-align: end;
    color: var(--main-white);
    font-size: 24px;
    object-fit: cover;
  }

  .top-item-label {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    top: -15px;
    left: -15px;
    z-index: 100;
    background-color: var(--main-white);
    border: none;
    border-radius: 50px;
    padding: 8px 24px;

    font-family: var(--font-family);
    font-weight: 700;
    font-size: 24px;
    line-height: 1.33;
    color: rgb(88, 86, 214);
    cursor: pointer;
  }

  .card-delete {
    position: absolute;
    top: -15px;
    right: -15px;
    cursor: pointer;
    opacity: 0;
    background: var(--main-white);
    border: none;
    padding: 6px;
  }

  .movies__top-item:hover .card-delete {
    opacity: 1;
  }
</style>