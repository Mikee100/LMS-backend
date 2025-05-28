// utils/auth.js
export const getToken = () => {
  const token = localStorage.getItem('token');
  return token || null;
};

export const isAuthenticated = async () => {
  const token = getToken();
  if (!token) return false;

  try {
    const response = await fetch('http://localhost:5000/api/auth/verify-token', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    return response.ok;
  } catch (err) {
    console.error('Token verification error:', err);
    return false;
  }
};
