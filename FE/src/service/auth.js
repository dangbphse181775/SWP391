// Decode JWT token without external library
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT:', error);
    return null;
  }
}

export function getAccessToken() {
  // Ưu tiên token của tab hiện tại (sessionStorage)
  let token = sessionStorage.getItem('access_token');
  // Nếu không có, lấy từ localStorage (Remember Me)
  if (!token) {
    const rememberMe = localStorage.getItem('remember_me') === 'true';
    if (rememberMe) {
      token = localStorage.getItem('access_token');
    }
  }
  return token;
}

export function getRoleFromToken() {
  const token = getAccessToken();
  if (!token) return null;

  const decoded = parseJwt(token);
  if (!decoded) return null;

  // Common JWT role claim names
  return decoded.role || decoded.Role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || null;
}

export function getUserFromToken() {
  const token = getAccessToken();
  if (!token) return null;

  const decoded = parseJwt(token);
  return decoded;
}

export function isTokenExpired() {
  const token = getAccessToken();
  if (!token) return true;

  const decoded = parseJwt(token);
  if (!decoded || !decoded.exp) return true;

  return decoded.exp * 1000 < Date.now();
}

export function logout() {
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem('user_data');
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_data');
  localStorage.removeItem('remember_me');
  window.location.href = '/login';
}
