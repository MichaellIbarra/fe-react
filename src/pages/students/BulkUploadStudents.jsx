import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Alert, Form, Row, Col, Table, Badge, Modal, ProgressBar } from 'react-bootstrap';
import { studentService } from '../../services/students';
import { DocumentType, Gender, StudentStatus } from '../../types/students/student.types';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';

const BulkUploadStudents = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [students, setStudents] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [progress, setProgress] = useState(0);

  // Template de ejemplo para descargar
  const csvTemplate = `documentType,documentNumber,firstName,secondName,lastName,secondLastName,birthDate,gender,email,phoneNumber,address,emergencyContact,emergencyPhone,status
CC,12345678,Juan,Carlos,Pérez,González,1990-01-15,MALE,juan.perez@email.com,3001234567,Calle 123 # 45-67,María Pérez,3009876543,ACTIVE
CC,87654321,Ana,María,López,Rodríguez,1995-03-22,FEMALE,ana.lopez@email.com,3002345678,Carrera 456 # 78-90,Pedro López,3008765432,ACTIVE`;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setStudents([]);
    setErrors([]);
    setShowPreview(false);
  };

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_estudiantes.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const parseCSV = (text) => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    const parseErrors = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;
      
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length !== headers.length) {
        parseErrors.push(`Línea ${i + 1}: Número incorrecto de columnas`);
        continue;
      }

      const student = {};
      headers.forEach((header, index) => {
        student[header] = values[index] || null;
      });

      // Validaciones básicas
      if (!student.documentNumber || !student.firstName || !student.lastName) {
        parseErrors.push(`Línea ${i + 1}: Faltan campos obligatorios (documentNumber, firstName, lastName)`);
        continue;
      }

      // Validar enums
      if (student.documentType && !Object.values(DocumentType).includes(student.documentType)) {
        parseErrors.push(`Línea ${i + 1}: Tipo de documento inválido: ${student.documentType}`);
        continue;
      }

      if (student.gender && !Object.values(Gender).includes(student.gender)) {
        parseErrors.push(`Línea ${i + 1}: Género inválido: ${student.gender}`);
        continue;
      }

      if (student.status && !Object.values(StudentStatus).includes(student.status)) {
        parseErrors.push(`Línea ${i + 1}: Estado inválido: ${student.status}`);
        continue;
      }

      // Validar fecha de nacimiento
      if (student.birthDate && !isValidDate(student.birthDate)) {
        parseErrors.push(`Línea ${i + 1}: Fecha de nacimiento inválida: ${student.birthDate}`);
        continue;
      }

      // Validar email
      if (student.email && !isValidEmail(student.email)) {
        parseErrors.push(`Línea ${i + 1}: Email inválido: ${student.email}`);
        continue;
      }

      data.push(student);
    }

    return { data, errors: parseErrors };
  };

  const isValidDate = (dateString) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date) && dateString.match(/^\d{4}-\d{2}-\d{2}$/);
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleFileUpload = async () => {
    if (!file) {
      setErrors(['Por favor seleccione un archivo CSV']);
      return;
    }

    setLoading(true);
    setErrors([]);
    setStudents([]);

    try {
      const text = await file.text();
      const { data, errors: parseErrors } = parseCSV(text);
      
      if (parseErrors.length > 0) {
        setErrors(parseErrors);
        setLoading(false);
        return;
      }

      setStudents(data);
      setShowPreview(true);
    } catch (error) {
      setErrors(['Error al leer el archivo. Asegúrese de que sea un archivo CSV válido.']);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCreate = async () => {
    if (students.length === 0) {
      setErrors(['No hay estudiantes para crear']);
      return;
    }

    setUploading(true);
    setProgress(0);
    
    try {
      // Simular progreso
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await studentService.bulkCreateStudents(students);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      const result = response.data ? response.data : response;
      setUploadResult(result);
      
      // Limpiar formulario después del éxito
      setFile(null);
      setStudents([]);
      setShowPreview(false);
      
    } catch (error) {
      console.error('Error en carga masiva:', error);
      setErrors([error.response?.data?.message || 'Error al crear los estudiantes masivamente']);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const getBadgeVariant = (status) => {
    switch (status) {
      case StudentStatus.ACTIVE: return 'success';
      case StudentStatus.INACTIVE: return 'warning';
      default: return 'secondary';
    }
  };

  const getGenderLabel = (gender) => {
    switch (gender) {
      case Gender.MALE: return 'Masculino';
      case Gender.FEMALE: return 'Femenino';
      case Gender.OTHER: return 'Otro';
      default: return gender || 'N/A';
    }
  };

  return (
    <>
      <Header />
      <Sidebar activeClassName="student-list" />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="row align-items-center">
              <div className="col">
                <h3 className="page-title">
                  <i className="fas fa-upload me-2"></i>
                  Carga Masiva de Estudiantes
                </h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <a href="/dashboard">Dashboard</a>
                  </li>
                  <li className="breadcrumb-item">
                    <a href="/students">Estudiantes</a>
                  </li>
                  <li className="breadcrumb-item active">Carga Masiva</li>
                </ul>
              </div>
              <div className="col-auto">
                <Button 
                  variant="outline-primary" 
                  onClick={() => navigate('/students')}
                >
                  <i className="fas fa-arrow-left me-1"></i>
                  Volver a Estudiantes
                </Button>
              </div>
            </div>
          </div>

          {/* Instrucciones */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="card-title mb-0">
                <i className="fas fa-info-circle me-2"></i>
                Instrucciones
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={8}>
                  <h6>Pasos para la carga masiva:</h6>
                  <ol>
                    <li>Descargue la plantilla CSV haciendo clic en el botón "Descargar Plantilla"</li>
                    <li>Complete la plantilla con los datos de los estudiantes</li>
                    <li>Suba el archivo completado usando el formulario a continuación</li>
                    <li>Revise los datos en la vista previa</li>
                    <li>Confirme la carga masiva</li>
                  </ol>
                </Col>
                <Col md={4} className="text-end">
                  <Button 
                    variant="outline-success" 
                    onClick={downloadTemplate}
                    className="mb-2"
                  >
                    <i className="fas fa-download me-1"></i>
                    Descargar Plantilla CSV
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Formulario de carga */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="card-title mb-0">
                <i className="fas fa-file-upload me-2"></i>
                Subir Archivo CSV
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={8}>
                  <Form.Group className="mb-3">
                    <Form.Label>Seleccionar archivo CSV</Form.Label>
                    <Form.Control
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      disabled={loading || uploading}
                    />
                    <Form.Text className="text-muted">
                      Seleccione un archivo CSV con los datos de los estudiantes
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={4} className="d-flex align-items-end">
                  <Button
                    variant="primary"
                    onClick={handleFileUpload}
                    disabled={!file || loading || uploading}
                    className="mb-3"
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-search me-1"></i>
                        Procesar Archivo
                      </>
                    )}
                  </Button>
                </Col>
              </Row>

              {uploading && (
                <div className="mt-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Creando estudiantes...</span>
                    <span>{progress}%</span>
                  </div>
                  <ProgressBar now={progress} animated />
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Errores */}
          {errors.length > 0 && (
            <Alert variant="danger" className="mb-4">
              <h6><i className="fas fa-exclamation-triangle me-2"></i>Errores encontrados:</h6>
              <ul className="mb-0">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}

          {/* Resultado de la carga */}
          {uploadResult && (
            <Alert variant="success" className="mb-4">
              <h6><i className="fas fa-check-circle me-2"></i>Carga completada exitosamente</h6>
              <p className="mb-1">
                <strong>Estudiantes creados:</strong> {uploadResult.created || 0}
              </p>
              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <div className="mt-2">
                  <strong>Errores:</strong>
                  <ul className="mb-0 mt-1">
                    {uploadResult.errors.map((error, index) => (
                      <li key={index} className="text-danger">{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Alert>
          )}

          {/* Vista previa */}
          {showPreview && students.length > 0 && (
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">
                  <i className="fas fa-eye me-2"></i>
                  Vista Previa ({students.length} estudiantes)
                </h5>
                <Button
                  variant="success"
                  onClick={handleBulkCreate}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Creando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-1"></i>
                      Crear Estudiantes
                    </>
                  )}
                </Button>
              </Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <Table striped hover>
                    <thead>
                      <tr>
                        <th>Documento</th>
                        <th>Nombre Completo</th>
                        <th>Email</th>
                        <th>Teléfono</th>
                        <th>Género</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.slice(0, 50).map((student, index) => (
                        <tr key={index}>
                          <td>
                            <div>{student.documentNumber}</div>
                            <small className="text-muted">{student.documentType}</small>
                          </td>
                          <td>
                            <div>{student.firstName} {student.lastName}</div>
                            {student.secondName && (
                              <small className="text-muted">{student.secondName}</small>
                            )}
                          </td>
                          <td>{student.email || 'N/A'}</td>
                          <td>{student.phoneNumber || 'N/A'}</td>
                          <td>{getGenderLabel(student.gender)}</td>
                          <td>
                            <Badge bg={getBadgeVariant(student.status)}>
                              {student.status || StudentStatus.ACTIVE}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
                {students.length > 50 && (
                  <Alert variant="info" className="mt-3">
                    <i className="fas fa-info-circle me-2"></i>
                    Se muestran los primeros 50 estudiantes. Total a crear: {students.length}
                  </Alert>
                )}
              </Card.Body>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default BulkUploadStudents;
