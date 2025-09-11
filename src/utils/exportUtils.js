// Utilidades de exportación para tablas
import { message } from 'antd';

export class ExportUtils {
  /**
   * Exporta datos a formato CSV
   * @param {Array} data - Array de objetos con los datos
   * @param {Array} headers - Array con los headers de las columnas
   * @param {Function} mapFunction - Función para mapear los datos
   * @param {string} filename - Nombre del archivo
   */
  static exportToCSV(data, headers, mapFunction, filename) {
    try {
      const csvContent = [
        // Headers
        headers.join(','),
        // Data
        ...data.map(item => mapFunction(item).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      message.success('Archivo CSV descargado correctamente');
    } catch (error) {
      message.error('Error al generar el archivo CSV');
      console.error('CSV Export Error:', error);
    }
  }

  /**
   * Exporta datos a formato PDF (para impresión)
   * @param {Array} data - Array de objetos con los datos
   * @param {Array} headers - Array con los headers de las columnas
   * @param {Function} mapFunction - Función para mapear los datos a HTML
   * @param {string} title - Título del reporte
   * @param {string} subtitle - Subtítulo del reporte (opcional)
   */
  static exportToPDF(data, headers, mapFunction, title, subtitle = '') {
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              font-size: 12px; 
            }
            h1 { 
              color: #333; 
              text-align: center; 
              font-size: 18px;
              margin-bottom: 10px;
            }
            h2 { 
              color: #666; 
              text-align: center; 
              font-size: 14px;
              margin-bottom: 20px; 
            }
            .info {
              text-align: center;
              margin-bottom: 20px;
              font-size: 11px;
              color: #666;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 10px;
              font-size: 10px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 6px; 
              text-align: left; 
            }
            th { 
              background-color: #f2f2f2; 
              font-weight: bold; 
              font-size: 10px;
            }
            tr:nth-child(even) { 
              background-color: #f9f9f9; 
            }
            .active { 
              color: #28a745; 
              font-weight: bold; 
            }
            .inactive { 
              color: #dc3545; 
              font-weight: bold; 
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          ${subtitle ? `<h2>${subtitle}</h2>` : ''}
          <div class="info">
            <p>Fecha de generación: ${new Date().toLocaleDateString('es-ES')} | Total de registros: ${data.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                ${headers.map(header => `<th>${header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(item => `<tr>${mapFunction(item)}</tr>`).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url, '_blank');
      
      if (printWindow) {
        printWindow.addEventListener('load', () => {
          setTimeout(() => {
            printWindow.print();
            setTimeout(() => {
              printWindow.close();
              URL.revokeObjectURL(url);
            }, 1000);
          }, 500);
        });
        message.success('PDF generado para impresión');
      } else {
        message.error('No se pudo abrir la ventana de impresión. Verifique que el bloqueador de ventanas emergentes esté deshabilitado.');
      }
    } catch (error) {
      message.error('Error al generar el PDF');
      console.error('PDF Export Error:', error);
    }
  }

  /**
   * Exporta datos a formato Excel
   * @param {Array} data - Array de objetos con los datos
   * @param {Array} headers - Array con los headers de las columnas
   * @param {Function} mapFunction - Función para mapear los datos
   * @param {string} filename - Nombre del archivo
   * @param {string} sheetName - Nombre de la hoja
   */
  static exportToExcel(data, headers, mapFunction, filename, sheetName = 'Datos') {
    try {
      const excelContent = `
        <?xml version="1.0"?>
        <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
          xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
          xmlns:html="http://www.w3.org/TR/REC-html40">
          <Worksheet ss:Name="${sheetName}">
            <Table>
              <Row>
                ${headers.map(header => `<Cell><Data ss:Type="String">${header}</Data></Cell>`).join('')}
              </Row>
              ${data.map(item => `
                <Row>
                  ${mapFunction(item).map(cell => `<Cell><Data ss:Type="String">${cell}</Data></Cell>`).join('')}
                </Row>
              `).join('')}
            </Table>
          </Worksheet>
        </Workbook>
      `;

      const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.xls`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      message.success('Archivo Excel descargado correctamente');
    } catch (error) {
      message.error('Error al generar el archivo Excel');
      console.error('Excel Export Error:', error);
    }
  }

  /**
   * Crea un menú de exportación estándar para Ant Design
   * @param {Function} csvExport - Función para exportar CSV
   * @param {Function} pdfExport - Función para exportar PDF  
   * @param {Function} excelExport - Función para exportar Excel
   */
  static createExportMenu(csvExport, pdfExport, excelExport) {
    const { Menu } = require('antd');
    
    return (
      <Menu>
        <Menu.Item key="csv" icon={<i className="fas fa-file-csv"></i>} onClick={csvExport}>
          Exportar CSV
        </Menu.Item>
        <Menu.Item key="pdf" icon={<i className="fas fa-file-pdf"></i>} onClick={pdfExport}>
          Exportar PDF
        </Menu.Item>
        <Menu.Item key="excel" icon={<i className="fas fa-file-excel"></i>} onClick={excelExport}>
          Exportar Excel
        </Menu.Item>
      </Menu>
    );
  }

  /**
   * Sanitiza texto para CSV (escapa comillas y agrega comillas si es necesario)
   * @param {string} text - Texto a sanitizar
   * @returns {string} Texto sanitizado
   */
  static sanitizeCSV(text) {
    if (text === null || text === undefined) return '';
    const stringValue = String(text);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  }

  /**
   * Sanitiza texto para HTML (escapa caracteres especiales)
   * @param {string} text - Texto a sanitizar
   * @returns {string} Texto sanitizado
   */
  static sanitizeHTML(text) {
    if (text === null || text === undefined) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}

export default ExportUtils;
