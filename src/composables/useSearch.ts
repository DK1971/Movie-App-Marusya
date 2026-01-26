import { ref, computed, watch } from 'vue';
import { debounce } from 'lodash-es';

export function useSearch(opts?: { minChars?: number; wait?: number }) {
  const minChars = opts?.minChars ?? 2;
  const wait = opts?.wait ?? 300;

  const query = ref('');
  const isSearching = ref(false);
  const results = ref<any[] | null>(null);
  const error = ref<string | null>(null);

  // provide a debounced search trigger to call external search function
  const triggerSearch = debounce(async (q: string, searchFn: (q: string) => Promise<any[]>) => {
    if (q.trim().length < minChars) {
      results.value = null;
      isSearching.value = false;
      return;
    }
    isSearching.value = true;
    try {
      const data = await searchFn(q);
      results.value = data;
    } catch (err: any) {
      error.value = err.message || 'Ошибка поиска';
    } finally {
      isSearching.value = false;
    }
  }, wait);

  watch(query, (val) => {
    triggerSearch(val, opts?.searchFn as any);
  });

  const hasMinChars = computed(() => query.value.trim().length >= minChars);

  return {
    query,
    results,
    isSearching,
    error,
    triggerSearch,
    hasMinChars,
  };
}