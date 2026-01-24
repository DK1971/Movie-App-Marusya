# Alias Configuration Guide

Все пути импортов в проекте настроены на использование alias для лучшей читаемости и удобства разработки.

## Настроенные Alias

| Alias           | Путь                       | Описание                |
| --------------- | -------------------------- | ----------------------- |
| `@/`            | `src/`                     | Корневая папка src      |
| `@components/*` | `src/components/*`         | Основные компоненты     |
| `@bases/*`      | `src/components/bases/*`   | Базовые компоненты      |
| `@layouts/*`    | `src/components/Layouts/*` | Layout компоненты       |
| `@mobiles/*`    | `src/components/mobiles/*` | Мобильные компоненты    |
| `@modals/*`     | `src/components/modals/*`  | Modal компоненты        |
| `@views/*`      | `src/views/*`              | Page компоненты (views) |

## Примеры использования

### Импорт компонентов

```typescript
// ✅ Правильно - с использованием alias
import BaseButtonFavorite from "@components/BaseButtonFavorite.vue";
import TrailerModal from "@modals/TrailerModal.vue";
import HeaderSeachBar from "@layouts/HeaderSeachBar.vue";
import BaseCardMovies from "@bases/BaseCardMovies.vue";

// ❌ Неправильно - относительные пути
import BaseButtonFavorite from "./BaseButtonFavorite.vue";
import TrailerModal from "../modals/TrailerModal.vue";
```

### Импорт TypeScript файлов (store, types, utils)

```typescript
// ✅ Правильно - с использованием alias
import { useMoviesStore } from "@/store/moviesStore.ts";
import { useUserStore } from "@/store/userStore.ts";
import type { IMovies } from "@/types/movies.ts";
import { formatRating, getRatingColor } from "@/utils/movieUtils.ts";
import CINEMA_API from "@/api/cinemaguideAPI";

// ❌ Неправильно - относительные пути
import { useMoviesStore } from "../../store/moviesStore.ts";
import { formatRating } from "../utils/movieUtils.ts";
```

### Импорт в Views

```typescript
// ✅ Правильно
import AppMain from "@components/AppMain.vue";
import CardGenres from "@bases/BaseCardGenres.vue";
import { useMoviesStore } from "@/store/moviesStore.ts";
```

## Конфигурационные файлы

### tsconfig.json

Определяет alias для TypeScript компилятора

### vite.config.ts

Определяет alias для Vite бандлера и development сервера

**Важно:** Оба файла синхронизированы для правильной работы TypeScript и Vite.

## Преимущества использования alias

1. **Читаемость** - Ясно видно, из какой части проекта импортируется модуль
2. **Безопасность от рефакторинга** - При перемещении файла не нужно менять импорты
3. **Консистентность** - Единообразный стиль импортов по всему проекту
4. **IDE поддержка** - VS Code правильно распознает alias и предоставляет автодополнение
