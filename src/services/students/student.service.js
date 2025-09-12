import { apiClient } from '../../config/api.config';
import { Student } from '../../types/students/student.types';

class StudentService {
    constructor() {
        this.endpoint = '/students';
    }

    /**
     * Obtiene todos los estudiantes
     * @returns {Promise<Student[]>} Lista de estudiantes
     */
    async getAllStudents() {
        const response = await apiClient.get(this.endpoint);
        // El API devuelve {metadata: {...}, data: [...]}
        const studentsData = response.data?.data ? response.data.data : response.data;
        return Array.isArray(studentsData) ? studentsData.map(student => new Student(student)) : [];
    }

    /**
     * Obtiene un estudiante por su ID
     * @param {string} id - ID del estudiante
     * @returns {Promise<Student>} Estudiante encontrado
     */
    async getStudentById(id) {
        const response = await apiClient.get(`${this.endpoint}/${id}`);
        const studentData = response.data?.data ? response.data.data : response.data;
        return new Student(studentData);
    }

    /**
     * Crea un nuevo estudiante
     * @param {Student} studentData - Datos del estudiante
     * @returns {Promise<Student>} Estudiante creado
     */
    async createStudent(studentData) {
        const { data } = await apiClient.post(this.endpoint, studentData);
        return new Student(data);
    }

    /**
     * Actualiza un estudiante existente
     * @param {string} id - ID del estudiante
     * @param {Student} studentData - Datos actualizados del estudiante
     * @returns {Promise<Student>} Estudiante actualizado
     */
    async updateStudent(id, studentData) {
        const { data } = await apiClient.put(`${this.endpoint}/${id}`, studentData);
        return new Student(data);
    }

    /**
     * Elimina un estudiante (baja lógica)
     * @param {string} id - ID del estudiante
     * @returns {Promise<void>}
     */
    async deleteStudent(id) {
        await apiClient.delete(`${this.endpoint}/${id}`);
    }

    /**
     * Busca estudiantes por institución
     * @param {string} institutionId - ID de la institución
     * @returns {Promise<Student[]>} Lista de estudiantes
     */
    async getStudentsByInstitution(institutionId) {
        const { data } = await apiClient.get(`${this.endpoint}/institution/${institutionId}`);
        return data.map(student => new Student(student));
    }

    /**
     * Busca estudiantes por estado
     * @param {string} status - Estado del estudiante (A/I)
     * @returns {Promise<Student[]>} Lista de estudiantes
     */
    async getStudentsByStatus(status) {
        const response = await apiClient.get(`${this.endpoint}/status/${status}`);
        const studentsData = response.data?.data ? response.data.data : response.data;
        return Array.isArray(studentsData) ? studentsData.map(student => new Student(student)) : [];
    }

    /**
     * Busca estudiantes por género
     * @param {string} gender - Género del estudiante (M/F)
     * @returns {Promise<Student[]>} Lista de estudiantes
     */
    async getStudentsByGender(gender) {
        const response = await apiClient.get(`${this.endpoint}/gender/${gender}`);
        const studentsData = response.data?.data ? response.data.data : response.data;
        return Array.isArray(studentsData) ? studentsData.map(student => new Student(student)) : [];
    }

    /**
     * Restaura un estudiante eliminado
     * @param {string} id - ID del estudiante
     * @returns {Promise<Student>} Estudiante restaurado
     */
    async restoreStudent(id) {
        const response = await apiClient.put(`${this.endpoint}/${id}/restore`);
        const studentData = response.data?.data ? response.data.data : response.data;
        return new Student(studentData);
    }

    /**
     * Obtiene estudiantes no matriculados
     * @returns {Promise<Student[]>} Lista de estudiantes no matriculados
     */
    async getNotEnrolledStudents() {
        try {
            const response = await apiClient.get(`${this.endpoint}/not-enrolled`);
            const studentsData = response.data?.data ? response.data.data : response.data;
            return Array.isArray(studentsData) ? studentsData.map(student => new Student(student)) : [];
        } catch (error) {
            console.error('Error al obtener estudiantes no matriculados:', error);
            throw error;
        }
    }

    /**
     * Obtiene estudiantes no matriculados en un aula específica
     * @param {string} classroomId - ID del aula
     * @returns {Promise<Student[]>} Lista de estudiantes no matriculados en el aula
     */
    async getNotEnrolledInClassroom(classroomId) {
        try {
            const response = await apiClient.get(`${this.endpoint}/not-enrolled/classroom/${classroomId}`);
            const studentsData = response.data?.data ? response.data.data : response.data;
            return Array.isArray(studentsData) ? studentsData.map(student => new Student(student)) : [];
        } catch (error) {
            console.error('Error al obtener estudiantes no matriculados en aula:', error);
            throw error;
        }
    }

    /**
     * Obtiene estadísticas de matrícula
     * @returns {Promise<Object>} Estadísticas de matrícula
     */
    async getEnrollmentStats() {
        try {
            const response = await apiClient.get(`${this.endpoint}/enrollment-stats`);
            // El API devuelve {metadata: {...}, data: {...}}
            return response.data?.data ? response.data.data : response.data;
        } catch (error) {
            console.error('Error al obtener estadísticas de matrícula:', error);
            throw error;
        }
    }
}

export default new StudentService(); 