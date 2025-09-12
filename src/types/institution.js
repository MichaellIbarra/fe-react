class Institution {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.codeName = data.codeName || '';
    this.logo = data.logo || '';
    this.modularCode = data.modularCode || '';
    this.address = data.address || '';
    this.contactEmail = data.contactEmail || '';
    this.contactPhone = data.contactPhone || '';
    this.status = data.status || 'A';
    this.userId = data.userId || null;
    
    // Configuraciones UI con valores por defecto - mapeando nombres de la API
    this.uiSettings = {
      color: data.uiSettings?.color || '#6c5ce7',
      logoPosition: data.uiSettings?.logoPosition || 'LEFT',
      showStudentPhotos: data.uiSettings?.showStudentPhotos !== undefined 
        ? data.uiSettings.showStudentPhotos 
        : true,
      logo: data.uiSettings?.logo || null,
      ...data.uiSettings
    };
    
    // Sistema de evaluación con valores por defecto - mapeando nombres de la API
    this.evaluationSystem = {
      gradeScale: data.evaluationSystem?.gradeScale || 'NUMERICAL_0_20',
      minimumPassingGrade: data.evaluationSystem?.minimumPassingGrade || 11,
      showDecimals: data.evaluationSystem?.showDecimals !== undefined 
        ? data.evaluationSystem.showDecimals 
        : true,
      // Mantener compatibilidad con nombres antiguos
      scale: data.evaluationSystem?.scale || 20,
      minimumScore: data.evaluationSystem?.minimumScore || 11,
      gradeFormat: data.evaluationSystem?.gradeFormat || 'numeric',
      ...data.evaluationSystem
    };
    
    // Configuraciones de horario con valores por defecto - mapeando nombres de la API
    this.scheduleSettings = {
      morningStartTime: data.scheduleSettings?.morningStartTime || '08:00:00',
      morningEndTime: data.scheduleSettings?.morningEndTime || '12:00:00',
      afternoonStartTime: data.scheduleSettings?.afternoonStartTime || '13:00:00',
      afternoonEndTime: data.scheduleSettings?.afternoonEndTime || '17:00:00',
      // Mantener compatibilidad con nombres antiguos
      startTime: data.scheduleSettings?.startTime || '08:00',
      endTime: data.scheduleSettings?.endTime || '18:00',
      breakDuration: data.scheduleSettings?.breakDuration || 15,
      ...data.scheduleSettings
    };
    
    this.headquarterIds = data.headquarterIds || [];
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
    
    // Mantener compatibilidad con nombres antiguos
    this.institutionName = data.institutionName || this.name;
    this.institutionLogo = data.institutionLogo || this.logo;
  }

  // Método para obtener el estado legible
  getStatusText() {
    return this.status === 'A' ? 'Activo' : 'Inactivo';
  }

  // Método para verificar si está activo
  isActive() {
    return this.status === 'A';
  }

  // Método para obtener información básica
  getBasicInfo() {
    return {
      id: this.id,
      name: this.name,
      code: this.codeName,
      email: this.contactEmail,
      phone: this.contactPhone,
      status: this.getStatusText()
    };
  }

  // Método para validar campos requeridos
  isValid() {
    return !!(
      this.name &&
      this.codeName &&
      this.contactEmail &&
      this.contactPhone
    );
  }

  // Método para obtener datos para enviar a la API
  toAPIFormat() {
    return {
      id: this.id,
      name: this.name,
      codeName: this.codeName,
      logo: this.logo,
      modularCode: this.modularCode,
      address: this.address,
      contactEmail: this.contactEmail,
      contactPhone: this.contactPhone,
      status: this.status,
      userId: this.userId,
      uiSettings: {
        color: this.uiSettings.color,
        logoPosition: this.uiSettings.logoPosition,
        showStudentPhotos: this.uiSettings.showStudentPhotos
      },
      evaluationSystem: {
        gradeScale: this.evaluationSystem.gradeScale,
        minimumPassingGrade: this.evaluationSystem.minimumPassingGrade,
        showDecimals: this.evaluationSystem.showDecimals
      },
      scheduleSettings: {
        morningStartTime: this.scheduleSettings.morningStartTime,
        morningEndTime: this.scheduleSettings.morningEndTime,
        afternoonStartTime: this.scheduleSettings.afternoonStartTime,
        afternoonEndTime: this.scheduleSettings.afternoonEndTime
      },
      headquarterIds: this.headquarterIds
    };
  }

  // Método para obtener el color del tema
  getThemeColor() {
    return this.uiSettings.color || '#6c5ce7';
  }

  // Método para obtener el logo de la institución
  getLogoUrl() {
    return this.logo || this.uiSettings.logo;
  }
}

export default Institution;
