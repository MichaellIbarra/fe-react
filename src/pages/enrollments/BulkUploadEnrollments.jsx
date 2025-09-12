import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Alert, Form, Row, Col, Table, Badge, ProgressBar } from 'react-bootstrap';
import { enrollmentService } from '../../services/students';
import { EnrollmentStatus } from '../../types/students/enrollment.types';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';

const BulkUploadEnrollments = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [progress, setProgress] = useState(0);

  // Template de ejemplo para descargar
  const csvTemplate = `studentId,classroomId,enrollmentDate,status,observations,academicYear,period
1,1,2024-01-15,ACTIVE,Matrícula regular,2024,1
2,1,2024-01-16,ACTIVE,Estudiante nuevo,2024,1
3,2,2024-01-17,ACTIVE,Transferido de otra institución,2024,1`;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setEnrollments([]);
    setErrors([]);
    setShowPreview(false);
  };

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_matriculas.csv';
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

      const enrollment = {};
      headers.forEach((header, index) => {
        enrollment[header] = values[index] || null;
      });

      // Validaciones básicas
      if (!enrollment.studentId || !enrollment.classroomId) {
        parseErrors.push(`Línea ${i + 1}: Faltan campos obligatorios (studentId, classroomId)`);
        continue;
      }

      // Convertir IDs a números
      enrollment.studentId = parseInt(enrollment.studentId);
      enrollment.classroomId = parseInt(enrollment.classroomId);

      if (isNaN(enrollment.studentId) || isNaN(enrollment.classroomId)) {
        parseErrors.push(`Línea ${i + 1}: studentId y classroomId deben ser números válidos`);
        continue;
      }

      // Validar estado si está presente
      if (enrollment.status && !Object.values(EnrollmentStatus).includes(enrollment.status)) {
        parseErrors.push(`Línea ${i + 1}: Estado inválido: ${enrollment.status}`);
        continue;
      }

      // Validar fecha de matrícula
      if (enrollment.enrollmentDate && !isValidDate(enrollment.enrollmentDate)) {
        parseErrors.push(`Línea ${i + 1}: Fecha de matrícula inválida: ${enrollment.enrollmentDate}`);
        continue;
      }

      // Convertir campos numéricos
      if (enrollment.academicYear) {
        enrollment.academicYear = parseInt(enrollment.academicYear);
        if (isNaN(enrollment.academicYear)) {
          parseErrors.push(`Línea ${i + 1}: Año académico debe ser un número válido`);
          continue;
        }
      }

      if (enrollment.period) {
        enrollment.period = parseInt(enrollment.period);
        if (isNaN(enrollment.period)) {
          parseErrors.push(`Línea ${i + 1}: Período debe ser un número válido`);
          continue;
        }
      }

      // Establecer valores por defecto
      if (!enrollment.status) {
        enrollment.status = EnrollmentStatus.ACTIVE;
      }
      
      if (!enrollment.enrollmentDate) {
        enrollment.enrollmentDate = new Date().toISOString().split('T')[0];
      }

      data.push(enrollment);
    }

    return { data, errors: parseErrors };
  };

  const isValidDate = (dateString) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date) && dateString.match(/^\d{4}-\d{2}-\d{2}$/);
  };

  const handleFileUpload = async () => {
    if (!file) {
      setErrors(['Por favor seleccione un archivo CSV']);
      return;
    }

    setLoading(true);
    setErrors([]);
    setEnrollments([]);

    try {
      const text = await file.text();
      const { data, errors: parseErrors } = parseCSV(text);
      
      if (parseErrors.length > 0) {
        setErrors(parseErrors);
        setLoading(false);
        return;
      }

      setEnrollments(data);
      setShowPreview(true);
    } catch (error) {
      setErrors(['Error al leer el archivo. Asegúrese de que sea un archivo CSV válido.']);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCreate = async () => {
    if (enrollments.length === 0) {
      setErrors(['No hay matrículas para crear']);
      return;
    }

    setUploading(true);
    setProgress(0);
    
    try {
      // Simular progreso
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await enrollmentService.bulkCreateEnrollments(enrollments);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      const result = response.data ? response.data : response;
      setUploadResult(result);
      
      // Limpiar formulario después del éxito
      setFile(null);
      setEnrollments([]);
      setShowPreview(false);
      
    } catch (error) {
      console.error('Error en carga masiva:', error);
      setErrors([error.response?.data?.message || 'Error al crear las matrículas masivamente']);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      [EnrollmentStatus.ACTIVE]: { variant: 'success', label: 'Activa' },
      [EnrollmentStatus.COMPLETED]: { variant: 'primary', label: 'Completada' },
      [EnrollmentStatus.WITHDRAWN]: { variant: 'danger', label: 'Retirada' },
      [EnrollmentStatus.TRANSFERRED]: { variant: 'warning', label: 'Transferida' },
      [EnrollmentStatus.SUSPENDED]: { variant: 'secondary', label: 'Suspendida' },
      [EnrollmentStatus.INACTIVE]: { variant: 'dark', label: 'Inactiva' }
    };

    const config = statusConfig[status] || { variant: 'secondary', label: status };
    return <Badge bg={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  return (
    <>
      <Header />
      <Sidebar activeClassName="enrollment-list" />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="row align-items-center">
              <div className="col">
                <h3 className="page-title">
                  <i className="fas fa-upload me-2"></i>
                  Carga Masiva de Matrículas
                </h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <a href="/dashboard">Dashboard</a>
                  </li>
                  <li className="breadcrumb-item">
                    <a href="/enrollments">Matrículas</a>
                  </li>
                  <li className="breadcrumb-item active">Carga Masiva</li>
                </ul>
              </div>
              <div className="col-auto">
                <Button 
                  variant="outline-primary" 
                  onClick={() => navigate('/enrollments')}
                >
                  <i className="fas fa-arrow-left me-1"></i>
                  Volver a Matrículas
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
                    <li>Complete la plantilla con los datos de las matrículas</li>
                    <li>Asegúrese de que los IDs de estudiantes y aulas existan en el sistema</li>
                    <li>Suba el archivo completado usando el formulario a continuación</li>
                    <li>Revise los datos en la vista previa</li>
                    <li>Confirme la carga masiva</li>
                  </ol>
                  <Alert variant="info" className="mt-3">
                    <strong>Nota:</strong> Los campos studentId y classroomId deben corresponder a 
                    estudiantes y aulas existentes en el sistema.
                  </Alert>
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
                      Seleccione un archivo CSV con los datos de las matrículas
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
                    <span>Creando matrículas...</span>
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
                <strong>Matrículas creadas:</strong> {uploadResult.created || 0}
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
          {showPreview && enrollments.length > 0 && (
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">
                  <i className="fas fa-eye me-2"></i>
                  Vista Previa ({enrollments.length} matrículas)
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
                      Crear Matrículas
                    </>
                  )}
                </Button>
              </Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <Table striped hover>
                    <thead>
                      <tr>
                        <th>ID Estudiante</th>
                        <th>ID Aula</th>
                        <th>Fecha Matrícula</th>
                        <th>Estado</th>
                        <th>Año Académico</th>
                        <th>Período</th>
                        <th>Observaciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrollments.slice(0, 50).map((enrollment, index) => (
                        <tr key={index}>
                          <td>{enrollment.studentId}</td>
                          <td>{enrollment.classroomId}</td>
                          <td>{formatDate(enrollment.enrollmentDate)}</td>
                          <td>{getStatusBadge(enrollment.status)}</td>
                          <td>{enrollment.academicYear || 'N/A'}</td>
                          <td>{enrollment.period || 'N/A'}</td>
                          <td>
                            {enrollment.observations ? (
                              <span title={enrollment.observations}>
                                {enrollment.observations.length > 30 
                                  ? enrollment.observations.substring(0, 30) + '...'
                                  : enrollment.observations
                                }
                              </span>
                            ) : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
                {enrollments.length > 50 && (
                  <Alert variant="info" className="mt-3">
                    <i className="fas fa-info-circle me-2"></i>
                    Se muestran las primeras 50 matrículas. Total a crear: {enrollments.length}
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

export default BulkUploadEnrollments;
