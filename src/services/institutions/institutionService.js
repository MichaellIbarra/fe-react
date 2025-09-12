import Institution from '../../types/institution';
import { refreshTokenKeycloak } from '../../auth/authService';

class InstitutionService {
  constructor() {
    this.apiUrl = 'https://lab.vallegrande.edu.pe/school/gateway/api/v1/institutions';
    this.headquartersUrl = 'https://lab.vallegrande.edu.pe/school/gateway/api/v1/headquarters';
  }

  // Función auxiliar para obtener el token de acceso
  getAuthToken() {
    return localStorage.getItem('access_token');
  }

  // Función auxiliar para obtener headers con autenticación
  getAuthHeaders() {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Función auxiliar para realizar peticiones con manejo automático de renovación de token
  async makeAuthenticatedRequest(url, options = {}) {
    try {
      let response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          ...this.getAuthHeaders()
        }
      });

      // Si obtenemos 401, intentar renovar el token
      if (response.status === 401) {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const refreshResult = await refreshTokenKeycloak(refreshToken);
          if (refreshResult.success) {
            // Reintentar la petición con el nuevo token
            response = await fetch(url, {
              ...options,
              headers: {
                ...options.headers,
                ...this.getAuthHeaders()
              }
            });
          } else {
            // Si no se puede renovar, redirigir al login
            localStorage.clear();
            window.location.href = '/auth/login';
            throw new Error('Session expired. Please login again.');
          }
        } else {
          // No hay refresh token, redirigir al login
          localStorage.clear();
          window.location.href = '/auth/login';
          throw new Error('No authentication token found. Please login again.');
        }
      }

      return response;
    } catch (error) {
      console.error('Error in authenticated request:', error);
      throw error;
    }
  }

  // Obtener todas las instituciones
  async getAllInstitutions() {
    try {
      const response = await this.makeAuthenticatedRequest(this.apiUrl, {
        method: 'GET'
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching institutions: ${response.status}`);
      }
      
      const data = await response.json();
      return data.map(institution => new Institution(institution));
    } catch (error) {
      console.error('Error in InstitutionService.getAllInstitutions:', error);
      throw error;
    }
  }

  // Obtener institución por ID
  async getInstitutionById(id) {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.apiUrl}/${id}`, {
        method: 'GET'
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching institution: ${response.status}`);
      }
      
      const data = await response.json();
      return new Institution(data);
    } catch (error) {
      console.error('Error in InstitutionService.getInstitutionById:', error);
      throw error;
    }
  }

  // Crear una nueva institución
  async createInstitution(institutionData) {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(institutionData),
      });
      
      if (!response.ok) {
        throw new Error(`Error creating institution: ${response.status}`);
      }
      
      const data = await response.json();
      return new Institution(data);
    } catch (error) {
      console.error('Error in InstitutionService.createInstitution:', error);
      throw error;
    }
  }

  // Actualizar una institución
  async updateInstitution(id, institutionData) {
    try {
      const response = await fetch(`${this.apiUrl}/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(institutionData),
      });
      
      if (!response.ok) {
        throw new Error(`Error updating institution: ${response.status}`);
      }
      
      const data = await response.json();
      return new Institution(data);
    } catch (error) {
      console.error('Error in InstitutionService.updateInstitution:', error);
      throw error;
    }
  }

  // Eliminar (inactivar) una institución
  async deleteInstitution(id) {
    try {
      const response = await fetch(`${this.apiUrl}/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Error deleting institution: ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error in InstitutionService.deleteInstitution:', error);
      throw error;
    }
  }

  // Restaurar una institución
  async restoreInstitution(id) {
    try {
      const response = await fetch(`${this.apiUrl}/restore/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Error restoring institution: ${response.status}`);
      }
      
      const data = await response.json();
      return new Institution(data);
    } catch (error) {
      console.error('Error in InstitutionService.restoreInstitution:', error);
      throw error;
    }
  }

  // Asignar director a una institución
  async assignDirector(id, directorData) {
    try {
      const response = await fetch(`${this.apiUrl}/assign/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(directorData),
      });
      
      if (!response.ok) {
        throw new Error(`Error assigning director: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in InstitutionService.assignDirector:', error);
      throw error;
    }
  }

  // Obtener directores de una institución
  async getInstitutionDirectors(id) {
    try {
      const response = await fetch(`${this.apiUrl}/${id}/directors`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching directors: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in InstitutionService.getInstitutionDirectors:', error);
      throw error;
    }
  }

  // Obtener sedes de una institución
  async getInstitutionHeadquarters(id) {
    try {
      const response = await fetch(`${this.apiUrl}/${id}/headquarters`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching headquarters: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in InstitutionService.getInstitutionHeadquarters:', error);
      throw error;
    }
  }

  // Eliminar (inactivar) una sede
  async deleteHeadquarter(id) {
    try {
      const response = await fetch(`${this.headquartersUrl}/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Error deleting headquarter: ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error in InstitutionService.deleteHeadquarter:', error);
      throw error;
    }
  }

  // Restaurar una sede
  async restoreHeadquarter(id) {
    try {
      const response = await fetch(`${this.headquartersUrl}/restore/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Error restoring headquarter: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in InstitutionService.restoreHeadquarter:', error);
      throw error;
    }
  }

  // Crear una nueva sede
  async createHeadquarter(headquarterData) {
    try {
      // Asegurar que el status no sea null
      if (headquarterData.status === null || headquarterData.status === undefined) {
        headquarterData.status = 'A'; // Establecer como Activo por defecto
      }
      
      console.log('Creating headquarter with data:', headquarterData);
      
      const response = await fetch(this.headquartersUrl, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(headquarterData),
      });
      
      if (!response.ok) {
        throw new Error(`Error creating headquarter: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in InstitutionService.createHeadquarter:', error);
      throw error;
    }
  }

  // Actualizar una sede
  async updateHeadquarter(id, headquarterData) {
    try {
      // Asegurar que el status no sea null
      if (headquarterData.status === null || headquarterData.status === undefined) {
        headquarterData.status = 'A'; // Establecer como Activo por defecto
      }
      
      console.log('Updating headquarter with data:', headquarterData);
      
      const response = await fetch(`${this.headquartersUrl}/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(headquarterData),
      });
      
      if (!response.ok) {
        throw new Error(`Error updating headquarter: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in InstitutionService.updateHeadquarter:', error);
      throw error;
    }
  }

  // Obtener sede por ID
  async getHeadquarterById(id) {
    try {
      const response = await fetch(`${this.headquartersUrl}/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching headquarter: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Headquarter data retrieved from API:', data);
      
      // Si el status es null, asignar 'A' por defecto
      if (data.status === null || data.status === undefined) {
        data.status = 'A';
      }
      
      return data;
    } catch (error) {
      console.error('Error in InstitutionService.getHeadquarterById:', error);
      throw error;
    }
  }

  // Método legacy para compatibilidad
  async getCurrentInstitution() {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching user profile: ${response.status}`);
      }
      
      const data = await response.json();
      return new Institution(data);
    } catch (error) {
      console.error('Error in InstitutionService.getCurrentUser:', error);
      throw error;
    }
  }
}

export default new InstitutionService();