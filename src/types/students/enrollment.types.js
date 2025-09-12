/**
 * @typedef {Object} Enrollment
 * @property {string} id - ID único de la matrícula (UUID)
 * @property {string} studentId - ID del estudiante
 * @property {string} classroomId - ID del aula/período académico
 * @property {string} enrollmentNumber - Código único de matrícula por período
 * @property {string} enrollmentDate - Fecha de matrícula (formato: YYYY-MM-DD)
 * @property {string} status - Estado de la matrícula
 * @property {string} createdAt - Fecha de creación
 * @property {string} updatedAt - Fecha de última actualización
 */

/**
 * Crea una nueva instancia de Enrollment con los datos proporcionados
 * @param {Object} data - Datos de la matrícula
 * @returns {Enrollment} Nueva instancia de Enrollment
 */
export class Enrollment {
    constructor(data = {}) {
        this.id = data.id || null;
        this.studentId = data.studentId || '';
        this.classroomId = data.classroomId || '';
        this.enrollmentNumber = data.enrollmentNumber || '';
        this.enrollmentDate = data.enrollmentDate || '';
        this.status = data.status || 'ACTIVE';
        this.createdAt = data.createdAt || null;
        this.updatedAt = data.updatedAt || null;
    }

    isActive() {
        return this.status === EnrollmentStatus.ACTIVE;
    }

    isCompleted() {
        return this.status === EnrollmentStatus.COMPLETED;
    }

    canBeModified() {
        return this.status === EnrollmentStatus.ACTIVE || this.status === EnrollmentStatus.SUSPENDED;
    }
}

// Enums para estado de matrícula
export const EnrollmentStatus = {
    ACTIVE: 'ACTIVE',
    COMPLETED: 'COMPLETED',
    TRANSFERRED: 'TRANSFERRED',
    WITHDRAWN: 'WITHDRAWN',
    SUSPENDED: 'SUSPENDED'
};

// Labels para mostrar en UI
export const EnrollmentStatusLabels = {
    [EnrollmentStatus.ACTIVE]: 'Activo',
    [EnrollmentStatus.COMPLETED]: 'Completado',
    [EnrollmentStatus.TRANSFERRED]: 'Transferido',
    [EnrollmentStatus.WITHDRAWN]: 'Retirado',
    [EnrollmentStatus.SUSPENDED]: 'Suspendido'
};

// Colores para badges de estado
export const EnrollmentStatusColors = {
    [EnrollmentStatus.ACTIVE]: 'success',
    [EnrollmentStatus.COMPLETED]: 'primary',
    [EnrollmentStatus.TRANSFERRED]: 'warning',
    [EnrollmentStatus.WITHDRAWN]: 'danger',
    [EnrollmentStatus.SUSPENDED]: 'secondary'
};
