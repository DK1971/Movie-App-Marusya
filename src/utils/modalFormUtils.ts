// Функция валидации email
export const validateEmail = (email: string): any => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
