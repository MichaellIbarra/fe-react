export const exportClassroomStudentsCSV = async () => {
  try {
    const baseUrl = 'https://lab.vallegrande.edu.pe/school/gateway/api/v1';
    const response = await fetch(`${baseUrl}/enrollments/export`, {
      method: 'GET',
      headers: {
        'Accept': 'text/csv',
        'Content-Type': 'text/csv',
      }
    });
    
    if (!response.ok) {
      throw new Error('Error al descargar el archivo');
    }
    
    // Obtener el blob del CSV
    const blob = await response.blob();
    
    // Crear URL temporal y link para descarga
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'matriculas.csv');
    
    // Trigger descarga
    document.body.appendChild(link);
    link.click();
    
    // Limpieza
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al exportar matrículas:', error);
    alert('Error al descargar el archivo CSV');
  }
};
