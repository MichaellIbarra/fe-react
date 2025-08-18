export const exportStudentsCSV = () => {
  try {
    window.open('http://localhost:8081/api/v1/students/export', '_blank');
  } catch (error) {
    console.error('Error al exportar estudiantes:', error);
    alert('Error al descargar el archivo CSV');
  }
};
