// Servicio de autenticación Keycloak
const AUTH_URL = 'https://auth-school.matichain.dev/realms/auth-school/protocol/openid-connect/token';
const CLIENT_ID = 'auth-school-client';
const CLIENT_SECRET = 'WUsgJBE08rdylPM1zIYvdEZQoPJBfrL1';

export async function loginKeycloak(username, password) {
  const params = new URLSearchParams();
  params.append('client_id', CLIENT_ID);
  params.append('grant_type', 'password');
  params.append('username', username);
  params.append('password', password);
  params.append('client_secret', CLIENT_SECRET);

  try {
    const response = await fetch(AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
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
  const params = new URLSearchParams();
  params.append('client_id', CLIENT_ID);
  params.append('grant_type', 'refresh_token');
  params.append('refresh_token', refreshToken);
  params.append('client_secret', CLIENT_SECRET);

  try {
    const response = await fetch(AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
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
