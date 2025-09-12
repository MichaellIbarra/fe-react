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
    
    // Configuraciones UI con valores por defecto
    this.uiSettings = {
      color: data.uiSettings?.color || '#6c5ce7',
      logo: data.uiSettings?.logo || null,
      ...data.uiSettings
    };
    
    // Sistema de evaluación con valores por defecto
    this.evaluationSystem = {
      scale: data.evaluationSystem?.scale || 20,
      minimumScore: data.evaluationSystem?.minimumScore || 11,
      gradeFormat: data.evaluationSystem?.gradeFormat || 'numeric',
      ...data.evaluationSystem
    };
    
    // Configuraciones de horario con valores por defecto
    this.scheduleSettings = {
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
      uiSettings: this.uiSettings,
      evaluationSystem: this.evaluationSystem,
      scheduleSettings: this.scheduleSettings,
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
