<script setup lang="ts">
import { computed } from "vue"

interface MovieCardProps {
  movie: string
}

const props = defineProps<MovieCardProps>()

const emit = defineEmits<{
  (e: 'open'): void
}>()

const openCard = () => {
  // Эмитим событие раскрытия карточки жанра
  emit('open');
}

// Генерируем URL изображения на основе жанра
const genreImageMap: Record<string, string> = {
  'action': '/img-for-genres/action.jpg',
  'adventure': '/img-for-genres/adventure.jpg',
  'animation': '/img-for-genres/animation.jpg',
  'comedy': '/img-for-genres/comedy.jpg',
  'crime': '/img-for-genres/crime.jpg',
  'documentary': '/img-for-genres/documentary.jpg',
  'drama': '/img-for-genres/drama.jpg',
  'family': '/img-for-genres/family.jpg',
  'fantasy': '/img-for-genres/fantasy.jpg',
  'history': '/img-for-genres/history.jpg',
  'horror': '/img-for-genres/horror.jpg',
  'music': '/img-for-genres/music.jpg',
  'mystery': '/img-for-genres/mystery.jpg',
  'romance': '/img-for-genres/romance.jpg',
  'scifi': '/img-for-genres/scifi.jpg',
  'stand-up': '/img-for-genres/stand-up.jpg',
  'thriller': '/img-for-genres/thriller.jpg',
  'tv-movie': '/img-for-genres/tv-movie.jpg',
  'war': '/img-for-genres/war.jpg',
  'western': '/img-for-genres/western.jpg',
}

// Словарь для преобразования жанров в русские названия
const genreTranslations: Record<string, string> = {
  'action': 'Боевик',
  'adventure': 'Приключение',
  'animation': 'Мультфильм',
  'comedy': 'Комедия',
  'crime': 'Детектив',
  'documentary': 'Документальный',
  'drama': 'Драма',
  'family': 'Семейный',
  'fantasy': 'Фантастика',
  'history': 'Исторический',
  'horror': 'Ужасы',
  'music': 'Музыкальный',
  'mystery': 'Мистика',
  'romance': 'Романтика',
  'scifi': 'Научно-фантастический',
  'stand-up': 'Стендап',
  'thriller': 'Триллер',
  'tv-movie': 'Телефильм',
  'war': 'Военный',
  'western': 'Вестерн',
}

const imageUrl = computed(() => {
  if (!props.movie) {
    return '/img-for-genres/default.jpg'
  }
  return genreImageMap[props.movie] || '/img-for-genres/default.jpg'
})

const genreTitle = computed(() => {
  if (!props.movie) {
    return 'Жанр не определён'
  }
  // Используем перевод, если есть, иначе преобразуем первую букву в заглавную
  return genreTranslations[props.movie] || (props.movie.charAt(0).toUpperCase() + props.movie.slice(1))
})
</script>

<template>
  <li class="card-genres" @click="openCard">
    <div class="card-genres__img">
      <img
           :src="imageUrl || '/img-for-genres/default.jpg'"
           :alt="genreTitle"
           class="card-genres__image">
    </div>
    <h3 class="card-genres__title">{{ genreTitle }}</h3>
  </li>
</template>

<style scoped>
  .card-genres {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;

    width: 290px;
    height: 304px;

    border: 1px solid rgba(255, 255, 255, 0.25);
    box-shadow: 0px 0px 80px 0px rgba(255, 255, 255, 0.33);
    border-radius: 24px;

    overflow: hidden;
    transition: transform 0.3s ease;
  }

  .card-genres:hover {
    transform: scale(1.05);
  }

  .card-genres__img {
    width: 100%;
    height: 220px;
    background-color: var(--background-card);
    overflow: hidden;
  }

  .card-genres__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .card-genres__title {
    padding-block: 22px 30px;
    width: 100%;
    height: 84px;
    font-size: 24px;
    font-weight: 700;
    text-align: center;
    background-color: rgba(10, 11, 11, 1);
    color: var(--main-white);
  }
</style>