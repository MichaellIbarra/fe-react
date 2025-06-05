class Institution {
  constructor(data = {}) {
    this.institution_id = data.institution_id || null;
    this.group_id = data.group_id || null;
    this.institution_name = data.institution_name || '';
    this.code_name = data.code_name || '';
    this.institution_logo = data.institution_logo || '';
    this.modular_code = data.modular_code || '';
    this.institution_color = data.institution_color || '';
    this.address = data.address || '';
    this.contact_email = data.contact_email || '';
    this.contact_phone = data.contact_phone || '';
    this.status = data.status || '';
    this.created_at = data.created_at ? new Date(data.created_at) : null;
    this.updated_at = data.updated_at ? new Date(data.updated_at) : null;
  }
}

export default Institution;
