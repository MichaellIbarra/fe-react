import { apiClient } from '../../config/api.config';

const studentService = {
  // Obtener todos los estudiantes
  async getAllStudents() {
    try {
      const response = await apiClient.get('/students');
      // El API devuelve {metadata: {...}, data: [...]}
      return response.data?.data ? response.data : response;
    } catch (error) {
      console.error('Error al obtener estudiantes:', error);
      throw error;
    }
  },

  // Obtener estudiante por ID
  async getStudentById(id) {
    try {
      const response = await apiClient.get(`/students/${id}`);
      return response.data?.data ? response.data : response;
    } catch (error) {
      console.error(`Error al obtener estudiante ${id}:`, error);
      throw error;
    }
  },

  // Crear nuevo estudiante
  async createStudent(studentData) {
    try {
      const response = await apiClient.post('/students', studentData);
      return response.data?.data ? response.data : response;
    } catch (error) {
      console.error('Error al crear estudiante:', error);
      throw error;
    }
  },

  // Actualizar estudiante
  async updateStudent(id, studentData) {
    try {
      const response = await apiClient.put(`/students/${id}`, studentData);
      return response.data?.data ? response.data : response;
    } catch (error) {
      console.error('Error al actualizar estudiante:', error);
      throw error;
    }
  },

  // Eliminar estudiante (lógico)
  async deleteStudent(id) {
    try {
      const response = await apiClient.delete(`/students/${id}`);
      return response.data?.data ? response.data : response;
    } catch (error) {
      console.error('Error al eliminar estudiante:', error);
      throw error;
    }
  },

  // Restaurar estudiante
  async restoreStudent(id) {
    try {
      const response = await apiClient.put(`/students/${id}/restore`);
      return response.data?.data ? response.data : response;
    } catch (error) {
      console.error('Error al restaurar estudiante:', error);
      throw error;
    }
  },

  // Buscar estudiante por documento
  async getStudentByDocument(documentNumber) {
    try {
      const response = await apiClient.get(`/students/document/${documentNumber}`);
      return response.data?.data ? response.data : response;
    } catch (error) {
      console.error('Error al buscar estudiante por documento:', error);
      throw error;
    }
  },

  // Filtrar por estado
  async getStudentsByStatus(status) {
    try {
      const response = await apiClient.get(`/students/status/${status}`);
      return response.data?.data ? response.data : response;
    } catch (error) {
      console.error('Error al filtrar estudiantes por estado:', error);
      throw error;
    }
  },

  // Obtener estudiantes activos
  async getActiveStudents() {
    return this.getStudentsByStatus('ACTIVE');
  },

  // Filtrar por género
  async getStudentsByGender(gender) {
    try {
      const response = await apiClient.get(`/students/gender/${gender}`);
      return response.data?.data ? response.data : response;
    } catch (error) {
      console.error('Error al filtrar estudiantes por género:', error);
      throw error;
    }
  },

  // Buscar por nombre
  async searchByFirstName(firstName) {
    try {
      const response = await apiClient.get(`/students/search/firstname/${firstName}`);
      return response.data?.data ? response.data : response;
    } catch (error) {
      console.error('Error al buscar estudiantes por nombre:', error);
      throw error;
    }
  },

  // Buscar por apellido
  async searchByLastName(lastName) {
    try {
      const response = await apiClient.get(`/students/search/lastname/${lastName}`);
      return response.data?.data ? response.data : response;
    } catch (error) {
      console.error('Error al buscar estudiantes por apellido:', error);
      throw error;
    }
  },

  // Carga masiva de estudiantes
  async bulkCreateStudents(studentsData) {
    try {
      const response = await apiClient.post('/students/bulk', studentsData);
      return response.data?.data ? response.data : response;
    } catch (error) {
      console.error('Error en carga masiva de estudiantes:', error);
      throw error;
    }
  },

  // Estudiantes no matriculados (general)
  async getNotEnrolledStudents() {
    try {
      const response = await apiClient.get('/students/not-enrolled');
      return response.data?.data ? response.data : response;
    } catch (error) {
      console.error('Error al obtener estudiantes no matriculados:', error);
      throw error;
    }
  },

  // Estudiantes no matriculados en aula específica
  async getNotEnrolledInClassroom(classroomId) {
    try {
      const response = await apiClient.get(`/students/not-enrolled/classroom/${classroomId}`);
      return response.data?.data ? response.data : response;
    } catch (error) {
      console.error('Error al obtener estudiantes no matriculados en aula:', error);
      throw error;
    }
  },

  // Estadísticas de matrícula
  async getEnrollmentStats() {
    try {
      const response = await apiClient.get('/students/enrollment-stats');
      return response.data?.data ? response.data : response;
    } catch (error) {
      console.error('Error al obtener estadísticas de matrícula:', error);
      throw error;
    }
  }
};

export { studentService };
export default studentService; 