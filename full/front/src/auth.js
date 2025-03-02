export const logout = () => {
  localStorage.removeItem('userId');
  window.location.href = '/login';
};