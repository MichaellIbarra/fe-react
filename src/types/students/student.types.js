/**
 * @typedef {Object} Student
 * @property {string} id - ID único del estudiante (UUID)
 * @property {string} firstName - Nombre del estudiante
 * @property {string} lastName - Apellido del estudiante
 * @property {string} documentType - Tipo de documento (DNI, CE, PASSPORT)
 * @property {string} documentNumber - Número de documento (único)
 * @property {string} birthDate - Fecha de nacimiento (formato: YYYY-MM-DD)
 * @property {string} gender - Género (MALE, FEMALE)
 * @property {string} address - Dirección completa
 * @property {string} district - Distrito
 * @property {string} province - Provincia
 * @property {string} department - Departamento
 * @property {string} phone - Teléfono del estudiante
 * @property {string} email - Correo electrónico del estudiante
 * @property {string} guardianName - Nombre del apoderado
 * @property {string} guardianLastName - Apellido del apoderado
 * @property {string} guardianDocumentType - Tipo de documento del apoderado
 * @property {string} guardianDocumentNumber - Número de documento del apoderado
 * @property {string} guardianPhone - Teléfono del apoderado
 * @property {string} guardianEmail - Correo del apoderado
 * @property {string} guardianRelationship - Relación familiar (FATHER, MOTHER, GUARDIAN, etc.)
 * @property {string} status - Estado (ACTIVE, INACTIVE, TRANSFERRED, GRADUATED, DECEASED)
 * @property {string} createdAt - Fecha de creación
 * @property {string} updatedAt - Fecha de última actualización
 */

/**
 * Crea una nueva instancia de Student con los datos proporcionados
 * @param {Object} data - Datos del estudiante
 * @returns {Student} Nueva instancia de Student
 */
export class Student {
    constructor(data = {}) {
        this.id = data.id || null;
        this.firstName = data.firstName || '';
        this.lastName = data.lastName || '';
        this.documentType = data.documentType || 'DNI';
        this.documentNumber = data.documentNumber || '';
        this.birthDate = data.birthDate || '';
        this.gender = data.gender || 'MALE';
        this.address = data.address || '';
        this.district = data.district || '';
        this.province = data.province || '';
        this.department = data.department || '';
        this.phone = data.phone || '';
        this.email = data.email || '';
        this.guardianName = data.guardianName || '';
        this.guardianLastName = data.guardianLastName || '';
        this.guardianDocumentType = data.guardianDocumentType || 'DNI';
        this.guardianDocumentNumber = data.guardianDocumentNumber || '';
        this.guardianPhone = data.guardianPhone || '';
        this.guardianEmail = data.guardianEmail || '';
        this.guardianRelationship = data.guardianRelationship || 'FATHER';
        this.status = data.status || 'ACTIVE';
        this.createdAt = data.createdAt || null;
        this.updatedAt = data.updatedAt || null;
    }

    getFullName() {
        return `${this.firstName} ${this.lastName}`;
    }

    getGuardianFullName() {
        return `${this.guardianName} ${this.guardianLastName}`;
    }
}

// Enums para tipos de documento
export const DocumentType = {
    DNI: 'DNI',
    CE: 'CE',
    PASSPORT: 'PASSPORT'
};

// Enums para género
export const Gender = {
    MALE: 'MALE',
    FEMALE: 'FEMALE'
};

// Enums para estado del estudiante
export const StudentStatus = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    TRANSFERRED: 'TRANSFERRED',
    GRADUATED: 'GRADUATED',
    DECEASED: 'DECEASED'
};

// Enums para relación del apoderado
export const GuardianRelationship = {
    FATHER: 'FATHER',
    MOTHER: 'MOTHER',
    GUARDIAN: 'GUARDIAN',
    GRANDPARENT: 'GRANDPARENT',
    OTHER: 'OTHER'
};

