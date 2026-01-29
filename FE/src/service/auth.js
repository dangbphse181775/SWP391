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

export function getRoleFromToken() {
  const token = localStorage.getItem('access_token');
  if (!token) return null;
  
  const decoded = parseJwt(token);
  if (!decoded) return null;
  
  // Common JWT role claim names
  return decoded.role || decoded.Role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || null;
}

export function getUserFromToken() {
  const token = localStorage.getItem('access_token');
  if (!token) return null;
  
  const decoded = parseJwt(token);
  return decoded;
}

export function isTokenExpired() {
  const token = localStorage.getItem('access_token');
  if (!token) return true;
  
  const decoded = parseJwt(token);
  if (!decoded || !decoded.exp) return true;
  
  return decoded.exp * 1000 < Date.now();
}

export function logout() {
  localStorage.removeItem('access_token');
  window.location.href = '/login';
}
