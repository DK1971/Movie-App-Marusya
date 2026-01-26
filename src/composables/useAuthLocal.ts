import { ref, watch } from 'vue';

export function useAuthLocal() {
  const user = ref<any | null>(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null);
  const token = ref<string>(localStorage.getItem('token') || '');
  const isAuthorized = ref(localStorage.getItem('isAuthorized') === 'true');

  watch(user, (val) => {
    if (val) localStorage.setItem('user', JSON.stringify(val));
    else localStorage.removeItem('user');
  });

  watch(token, (val) => {
    if (val) localStorage.setItem('token', val);
    else localStorage.removeItem('token');
  });

  watch(isAuthorized, (val) => {
    localStorage.setItem('isAuthorized', val ? 'true' : 'false');
  });

  const setAuth = (u: any, t: string) => {
    user.value = u;
    token.value = t;
    isAuthorized.value = true;
  };

  const clearAuth = () => {
    user.value = null;
    token.value = '';
    isAuthorized.value = false;
  };

  return { user, token, isAuthorized, setAuth, clearAuth };
}