import User from '../types/institution';

class InstitutionService {
  constructor() {
    this.apiUrl = 'https://mocki.io/v1/5d9b9c36-1a59-4b31-ac58-f8bc519e11af';
  }

  async getCurrentInstitution() {
    try {
      const response = await fetch(this.apiUrl);
      
      if (!response.ok) {
        throw new Error(`Error fetching user profile: ${response.status}`);
      }
      
      const data = await response.json();
      return new User(data);
    } catch (error) {
      console.error('Error in InstitutionService.getCurrentUser:', error);
      throw error;
    }
  }


}

export default new InstitutionService();