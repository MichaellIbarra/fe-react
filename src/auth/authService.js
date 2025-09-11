// Servicio de autenticación Gateway
const AUTH_URL = 'https://lab.vallegrande.edu.pe/school/gateway/api/v1/auth';
const REFRESH_URL = 'https://lab.vallegrande.edu.pe/school/gateway/api/v1/auth/refresh';

export async function loginKeycloak(username, password) {
  try {
    const response = await fetch(AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        password: password
      }),
    });
    const data = await response.json();
    if (response.ok && data.access_token) {
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('token_expires', Date.now() + data.expires_in * 1000);
      return { success: true, data };
    } else {
      return { success: false, error: data.error_description || 'Credenciales inválidas' };
    }
  } catch (error) {
    return { success: false, error: 'Error de red o servidor' };
  }
}

export async function refreshTokenKeycloak(refreshToken) {
  try {
    const response = await fetch(REFRESH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken: refreshToken
      }),
    });
    const data = await response.json();
    if (response.ok && data.access_token) {
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('token_expires', Date.now() + data.expires_in * 1000);
      return { success: true, data };
    } else {
      return { success: false, error: data.error_description || 'No se pudo refrescar el token' };
    }
  } catch (error) {
    return { success: false, error: 'Error de red o servidor' };
  }
}
