import { ref } from 'vue';

export function usePagination<T>(items: T[] = [], initial = 10, batch = 5) {
  const displayed = ref<T[]>(items.slice(0, initial));
  const index = ref(initial);
  const allLoaded = ref(displayed.value.length >= items.length);

  const reset = (newItems: T[] = []) => {
    index.value = initial;
    displayed.value = newItems.slice(0, initial);
    allLoaded.value = displayed.value.length >= newItems.length;
  };

  const appendNext = (allItems: T[]) => {
    if (allLoaded.value) return;
    const next = allItems.slice(index.value, index.value + batch);
    displayed.value = displayed.value.concat(next);
    index.value += next.length;
    if (displayed.value.length >= allItems.length) allLoaded.value = true;
  };

  return {
    displayed,
    allLoaded,
    reset,
    appendNext,
  };
}