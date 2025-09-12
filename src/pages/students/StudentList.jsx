import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Form, InputGroup, Spinner, Modal, Card, Row, Col, Badge, Dropdown } from 'react-bootstrap';
import { studentService } from '../../services/students';
import { StudentStatus, Gender, DocumentType } from '../../types/students/student.types';
import { exportStudentsCSV } from './studentReportService';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import CustomAlert from '../common/CustomAlert';
import './StudentList.css';

// Funciones auxiliares para formatear datos
const formatDate = (dateValue) => {
  if (!dateValue) return 'No especificada';
  
  try {
    let date;
    
    // Si es un array [año, mes, día] o [año, mes, día, hora, minuto, segundo, nanosegundos]
    if (Array.isArray(dateValue)) {
      const [year, month, day] = dateValue;
      date = new Date(year, month - 1, day); // month - 1 porque los meses van de 0-11
    } else {
      date = new Date(dateValue);
    }
    
    if (isNaN(date.getTime())) return 'Fecha inválida';
    
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  } catch (error) {
    return 'Fecha inválida';
  }
};

const formatDateTime = (dateTimeValue) => {
  if (!dateTimeValue) return 'No especificada';
  
  try {
    let date;
    
    // Si es un array [año, mes, día, hora, minuto, segundo, nanosegundos]
    if (Array.isArray(dateTimeValue)) {
      const [year, month, day, hour = 0, minute = 0, second = 0] = dateTimeValue;
      date = new Date(year, month - 1, day, hour, minute, second);
    } else {
      date = new Date(dateTimeValue);
    }
    
    if (isNaN(date.getTime())) return 'Fecha inválida';
    
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Fecha inválida';
  }
};

const formatDocumentType = (type) => {
  const types = {
    'DNI': 'DNI',
    'CE': 'Carnet de Extranjería',
    'PASAPORTE': 'Pasaporte',
    'TI': 'Tarjeta de Identidad'
  };
  return types[type] || type || 'No especificado';
};

const formatGender = (gender) => {
  const genders = {
    'MALE': 'Masculino',
    'FEMALE': 'Femenino',
    'M': 'Masculino',
    'F': 'Femenino'
  };
  return genders[gender] || gender || 'No especificado';
};

const formatStatus = (status) => {
  return status === 'ACTIVE' || status === 'A' ? 'Activo' : 'Inactivo';
};

const formatRelationship = (relationship) => {
  const relationships = {
    'MOTHER': 'Madre',
    'FATHER': 'Padre',
    'GUARDIAN': 'Tutor/a',
    'GRANDPARENT': 'Abuelo/a',
    'UNCLE_AUNT': 'Tío/a',
    'OTHER': 'Otro'
  };
  return relationships[relationship] || relationship || 'No especificado';
};

const StudentList = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [processingAction, setProcessingAction] = useState(false);
  const [filters, setFilters] = useState({
    status: 'ACTIVE',
    gender: 'all',
    documentType: 'all'
  });
  const [showDetails, setShowDetails] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null
  });

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError('');
      
      let response;
      if (filters.status === 'all') {
        response = await studentService.getAllStudents();
      } else {
        response = await studentService.getStudentsByStatus(filters.status);
      }
      
      console.log('Response from API:', response);
      
      // Manejar diferentes formatos de respuesta
      let studentsData = [];
      if (response && response.data && Array.isArray(response.data)) {
        // Formato: {metadata: {...}, data: [...]}
        studentsData = response.data;
      } else if (Array.isArray(response)) {
        // Formato directo: [...]
        studentsData = response;
      } else if (response && Array.isArray(response.data)) {
        // Otro formato posible
        studentsData = response.data;
      }
      
      console.log('Students data processed:', studentsData);
      setStudents(studentsData);
      
    } catch (error) {
      console.error('Error al cargar estudiantes:', error);
      setError('Error al cargar los datos. Por favor, intente nuevamente.');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);
                  <Button 
                    onClick={exportStudentsCSV} 
                    style={{marginBottom: '1rem'}}
                  >
                    Exportar estudiantes CSV
                  </Button>

  const showAlert = (config) => {
    setAlert({ ...config, show: true });
  };

  const hideAlert = () => {
    setAlert(prev => ({ ...prev, show: false }));
  };

  const handleDelete = async (id) => {
    try {
      setProcessingAction(true);
      showAlert({
        title: '¿Está seguro?',
        message: 'Esta acción desactivará el estudiante temporalmente',
        type: 'warning',
        onConfirm: async () => {
          try {
            await studentService.deleteStudent(id);
            setStudents(prevStudents => 
              prevStudents.map(student => 
                student.id === id 
                  ? { ...student, status: 'INACTIVE' }
                  : student
              )
            );
            showAlert({
              title: 'Desactivado',
              message: 'El estudiante ha sido desactivado correctamente',
              type: 'success',
              showCancel: false,
              autoClose: true
            });
          } catch (error) {
            showAlert({
              title: 'Error',
              message: error.message || 'No se pudo desactivar el estudiante',
              type: 'error',
              showCancel: false
            });
          }
        }
      });
    } catch (error) {
      console.error('Error al desactivar estudiante:', error);
      showAlert({
        title: 'Error',
        message: error.message || 'No se pudo desactivar el estudiante',
        type: 'error',
        showCancel: false
      });
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRestore = async (id) => {
    try {
      setProcessingAction(true);
      showAlert({
        title: '¿Está seguro?',
        message: 'Esta acción restaurará el estudiante',
        type: 'warning',
        onConfirm: async () => {
          try {
            await studentService.restoreStudent(id);
            setStudents(prevStudents => 
              prevStudents.map(student => 
                student.id === id 
                  ? { ...student, status: 'ACTIVE' }
                  : student
              )
            );
            showAlert({
              title: 'Restaurado',
              message: 'El estudiante ha sido restaurado correctamente',
              type: 'success',
              showCancel: false,
              autoClose: true
            });
          } catch (error) {
            showAlert({
              title: 'Error',
              message: error.message || 'No se pudo restaurar el estudiante',
              type: 'error',
              showCancel: false
            });
          }
        }
      });
    } catch (error) {
      console.error('Error al restaurar estudiante:', error);
      showAlert({
        title: 'Error',
        message: error.message || 'No se pudo restaurar el estudiante',
        type: 'error',
        showCancel: false
      });
    } finally {
      setProcessingAction(false);
    }
  };

  const handleShowDetails = async (student) => {
    try {
      setLoadingDetails(true);
      const studentDetails = await studentService.getStudentById(student.id);
      setSelectedStudent(studentDetails);
      setShowDetails(true);
    } catch (error) {
      console.error('Error al cargar detalles del estudiante:', error);
      toast.error('Error al cargar los detalles del estudiante');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedStudent(null);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getUniqueValues = (field) => {
    if (!Array.isArray(students)) {
      return [];
    }
    const values = new Set(students.map(s => s[field]));
    return Array.from(values).sort();
  };

  const filteredStudents = Array.isArray(students) ? students.filter(student => {
    if (!student) return false;
    
    // Aplicar filtros
    if (filters.status !== 'all' && student.status !== filters.status) {
      return false;
    }

    if (filters.gender !== 'all' && student.gender !== filters.gender) {
      return false;
    }

    if (filters.documentType !== 'all' && student.documentType !== filters.documentType) {
      return false;
    }

    // Búsqueda por término
    if (searchTerm) {
      const searchString = searchTerm.toLowerCase();
      return (
        student.firstName?.toLowerCase().includes(searchString) ||
        student.lastName?.toLowerCase().includes(searchString) ||
        student.documentNumber?.toLowerCase().includes(searchString) ||
        student.email?.toLowerCase().includes(searchString) ||
        student.phone?.toLowerCase().includes(searchString) ||
        student.guardianName?.toLowerCase().includes(searchString) ||
        student.guardianLastName?.toLowerCase().includes(searchString)
      );
    }

    return true;
  }) : [];

  if (loading) {
    return (
      <>
        <Header />
        <Sidebar />
        <div className="page-wrapper">
          <div className="content container-fluid">
            <div className="text-center mt-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Cargando Data...</span>
              </Spinner>
            </div>
          </div>
        </div>
      </>
    );
  }

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
                  <i className="fas fa-user-graduate me-2"></i>
                  Estudiantes
                </h3>
              </div>
              <div className="col-auto">
                <Button 
                  className="btn-add"
                  onClick={() => navigate('/add-student')}
                >
                  <i className="fas fa-plus me-2"></i>
                  Agregar Estudiante
                </Button>
                <Button
                  variant="outline-primary"
                  onClick={exportStudentsCSV}
                  style={{marginLeft: '10px'}}
                >
                  <i className="fas fa-file-csv me-2"></i>
                  Exportar CSV
                </Button>
                <Dropdown style={{marginLeft: '10px'}}>
                  <Dropdown.Toggle variant="outline-secondary" id="dropdown-advanced">
                    <i className="fas fa-cogs me-2"></i>
                    Opciones Avanzadas
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => navigate('/students/not-enrolled')}>
                      <i className="fas fa-user-slash me-2"></i>
                      Estudiantes No Matriculados
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => navigate('/students/bulk-upload')}>
                      <i className="fas fa-upload me-2"></i>
                      Carga Masiva
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => navigate('/students/statistics')}>
                      <i className="fas fa-chart-bar me-2"></i>
                      Estadísticas de Matrícula
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <div className="filters-section">
                    <div className="row">
                      <div className="col-12 col-sm-6 col-lg-3 mb-3">
                        <Form.Group>
                          <Form.Label>Estado</Form.Label>
                          <Form.Select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="form-select-sm"
                          >
                            <option value="ACTIVE">Activos</option>
                            <option value="INACTIVE">Inactivos</option>
                            <option value="TRANSFERRED">Transferidos</option>
                            <option value="GRADUATED">Graduados</option>
                            <option value="DECEASED">Fallecidos</option>
                            <option value="all">Todos los estados</option>
                          </Form.Select>
                        </Form.Group>
                      </div>
                      <div className="col-12 col-sm-6 col-lg-3 mb-3">
                        <Form.Group>
                          <Form.Label>Género</Form.Label>
                          <Form.Select
                            value={filters.gender}
                            onChange={(e) => handleFilterChange('gender', e.target.value)}
                            className="form-select-sm"
                          >
                            <option value="all">Todos los géneros</option>
                            <option value="MALE">Masculino</option>
                            <option value="FEMALE">Femenino</option>
                          </Form.Select>
                        </Form.Group>
                      </div>
                      <div className="col-12 col-sm-6 col-lg-3 mb-3">
                        <Form.Group>
                          <Form.Label>Tipo de Documento</Form.Label>
                          <Form.Select
                            value={filters.documentType}
                            onChange={(e) => handleFilterChange('documentType', e.target.value)}
                            className="form-select-sm"
                          >
                            <option value="all">Todos los tipos</option>
                            {getUniqueValues('documentType').map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </div>
                      <div className="col-12 col-sm-6 col-lg-3 mb-3">
                        <Form.Group>
                          <Form.Label>Buscar</Form.Label>
                          <InputGroup size="sm">
                            <Form.Control
                              placeholder="Buscar por nombre, documento o email"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="form-control-sm"
                            />
                            <Button variant="outline-secondary" size="sm">
                              <i className="fas fa-search"></i>
                            </Button>
                          </InputGroup>
                        </Form.Group>
                      </div>
                    </div>
                  </div>

                  {/* Filtros activos */}
                  {Object.values(filters).some(value => value !== 'all') && (
                    <div className="active-filters mb-4">
                      {Object.entries(filters).map(([key, value]) => 
                        value !== 'all' && (
                          <span key={key} className="filter-badge">
                            <span className="me-1">
                              {key === 'status' && <i className="fas fa-circle me-1"></i>}
                              {key === 'gender' && <i className="fas fa-venus-mars me-1"></i>}
                              {key === 'documentType' && <i className="fas fa-id-card me-1"></i>}
                            </span>
                            {key === 'status' ? (value === 'A' ? 'Activos' : 'Inactivos') : 
                             key === 'gender' ? (value === 'M' ? 'Masculino' : 'Femenino') : 
                             value}
                            <button 
                              type="button" 
                              className="btn-close btn-close-white"
                              onClick={() => handleFilterChange(key, 'all')}
                              aria-label="Quitar filtro"
                            ></button>
                          </span>
                        )
                      )}
                      {Object.values(filters).some(value => value !== 'all') && (
                        <Button 
                          variant="link" 
                          className="text-muted p-0 ms-2" 
                          style={{ fontSize: '13px' }}
                          onClick={() => setFilters({
                            status: 'all',
                            gender: 'all',
                            documentType: 'all'
                          })}
                        >
                          Limpiar filtros
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Contador de resultados */}
                  <div className="results-count">
                    <i className="fas fa-list me-2"></i>
                    Mostrando <strong>{filteredStudents.length}</strong> de <strong>{students.length}</strong> estudiantes
                  </div>

                  {error && (
                    <div className="alert alert-danger" role="alert">
                      <i className="fas fa-exclamation-circle me-2"></i>
                      {error}
                    </div>
                  )}

                  <div className="table-responsive">
                    <Table hover>
                      <thead>
                        <tr>
                          <th>Datos del Estudiante</th>
                          <th>Documento</th>
                          <th>Género</th>
                          <th>Estado</th>
                          <th>Contacto</th>
                          <th className="text-end">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.map((student) => (
                          <tr key={student.id}>
                            <td data-label="Datos del Estudiante">
                              <div className="student-name">
                                <strong>{`${student.firstName} ${student.lastName}`}</strong>
                              </div>
                            </td>
                            <td data-label="Documento">
                              <span className="badge bg-light text-dark">
                                {`${student.documentType} - ${student.documentNumber}`}
                              </span>
                            </td>
                            <td data-label="Género">
                              <span className={`badge ${student.gender === 'MALE' ? 'bg-info' : 'bg-pink'}`}>
                                <i className={`fas fa-${student.gender === 'MALE' ? 'mars' : 'venus'} me-1`}></i>
                                {student.gender === 'MALE' ? 'Masculino' : 'Femenino'}
                              </span>
                            </td>
                            <td data-label="Estado">
                              <Badge 
                                bg={
                                  student.status === 'ACTIVE' ? 'success' :
                                  student.status === 'INACTIVE' ? 'secondary' :
                                  student.status === 'TRANSFERRED' ? 'warning' :
                                  student.status === 'GRADUATED' ? 'primary' :
                                  'danger'
                                }
                              >
                                {
                                  student.status === 'ACTIVE' ? 'Activo' :
                                  student.status === 'INACTIVE' ? 'Inactivo' :
                                  student.status === 'TRANSFERRED' ? 'Transferido' :
                                  student.status === 'GRADUATED' ? 'Graduado' :
                                  student.status === 'DECEASED' ? 'Fallecido' :
                                  student.status
                                }
                              </Badge>
                            </td>
                            <td data-label="Contacto">
                              <div className="contact-info">
                                <div>{student.email}</div>
                                <small className="text-muted">{student.phone}</small>
                              </div>
                            </td>
                            <td data-label="Acciones">
                              <div className="actions">
                                <Button
                                  variant="info"
                                  size="sm"
                                  onClick={() => handleShowDetails(student)}
                                  disabled={processingAction}
                                >
                                  <i className="fas fa-eye me-1"></i>
                                  Ver
                                </Button>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => navigate(`/editstudent/${student.id}`)}
                                  disabled={processingAction}
                                >
                                  <i className="fas fa-edit me-1"></i>
                                  Editar
                                </Button>
                                {student.status === 'ACTIVE' ? (
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleDelete(student.id)}
                                    disabled={processingAction}
                                  >
                                    <i className="fas fa-ban me-1"></i>
                                    Desactivar
                                  </Button>
                                ) : (
                                  <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() => handleRestore(student.id)}
                                    disabled={processingAction}
                                  >
                                    <i className="fas fa-redo me-1"></i>
                                    Restaurar
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredStudents.length === 0 && (
                          <tr>
                            <td colSpan="6" className="text-center py-4 text-muted">
                              <i className="fas fa-inbox fa-3x mb-3 d-block"></i>
                              No se encontraron estudiantes
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Detalles */}
      <Modal show={showDetails} onHide={handleCloseDetails} size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className="fas fa-info-circle me-2"></i>
            Detalles del Estudiante
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {loadingDetails ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-3 text-muted">Cargando detalles del estudiante...</p>
            </div>
          ) : selectedStudent ? (
            <div>
              {/* Información Personal */}
              <Card className="mb-4 border-0 shadow-sm">
                <Card.Header className="bg-primary text-white">
                  <h5 className="mb-0">
                    <i className="fas fa-user me-2"></i>
                    Información Personal
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="text-muted small fw-bold">ID del Estudiante</label>
                        <p className="h6 text-monospace">{selectedStudent.id || 'No disponible'}</p>
                      </div>
                      <div className="mb-3">
                        <label className="text-muted small fw-bold">Nombres</label>
                        <p className="h6">{selectedStudent.firstName || 'No especificado'}</p>
                      </div>
                      <div className="mb-3">
                        <label className="text-muted small fw-bold">Apellidos</label>
                        <p className="h6">{selectedStudent.lastName || 'No especificado'}</p>
                      </div>
                      <div className="mb-3">
                        <label className="text-muted small fw-bold">Tipo de Documento</label>
                        <p className="h6">
                          <span className="badge bg-light text-dark">
                            <i className="fas fa-id-card me-2"></i>
                            {formatDocumentType(selectedStudent.documentType)}
                          </span>
                        </p>
                      </div>
                      <div className="mb-3">
                        <label className="text-muted small fw-bold">Número de Documento</label>
                        <p className="h6">{selectedStudent.documentNumber || 'No especificado'}</p>
                      </div>
                      <div className="mb-3">
                        <label className="text-muted small fw-bold">Fecha de Nacimiento</label>
                        <p className="h6">
                          <i className="fas fa-birthday-cake me-2 text-muted"></i>
                          {formatDate(selectedStudent.birthDate)}
                        </p>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="text-muted small fw-bold">Género</label>
                        <p className="h6">
                          <span className={`badge ${selectedStudent.gender === 'MALE' ? 'bg-info' : 'bg-pink'}`}>
                            <i className={`fas fa-${selectedStudent.gender === 'MALE' ? 'mars' : 'venus'} me-1`}></i>
                            {formatGender(selectedStudent.gender)}
                          </span>
                        </p>
                      </div>
                      <div className="mb-3">
                        <label className="text-muted small fw-bold">Estado</label>
                        <p className="h6">
                          <span className={`badge ${selectedStudent.status === 'ACTIVE' ? 'bg-success' : 'bg-danger'}`}>
                            <i className={`fas fa-${selectedStudent.status === 'ACTIVE' ? 'check-circle' : 'times-circle'} me-1`}></i>
                            {formatStatus(selectedStudent.status)}
                          </span>
                        </p>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Información de Ubicación */}
              <Card className="mb-4 border-0 shadow-sm">
                <Card.Header className="bg-info text-white">
                  <h5 className="mb-0">
                    <i className="fas fa-map-marker-alt me-2"></i>
                    Información de Ubicación
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="text-muted small fw-bold">Dirección</label>
                        <p className="h6">
                          <i className="fas fa-home me-2 text-muted"></i>
                          {selectedStudent.address || 'No especificada'}
                        </p>
                      </div>
                      <div className="mb-3">
                        <label className="text-muted small fw-bold">Distrito</label>
                        <p className="h6">
                          <i className="fas fa-map me-2 text-muted"></i>
                          {selectedStudent.district || 'No especificado'}
                        </p>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="text-muted small fw-bold">Provincia</label>
                        <p className="h6">
                          <i className="fas fa-city me-2 text-muted"></i>
                          {selectedStudent.province || 'No especificada'}
                        </p>
                      </div>
                      <div className="mb-3">
                        <label className="text-muted small fw-bold">Departamento</label>
                        <p className="h6">
                          <i className="fas fa-globe-americas me-2 text-muted"></i>
                          {selectedStudent.department || 'No especificado'}
                        </p>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Información de Contacto del Estudiante */}
              <Card className="mb-4 border-0 shadow-sm">
                <Card.Header className="bg-success text-white">
                  <h5 className="mb-0">
                    <i className="fas fa-address-card me-2"></i>
                    Contacto del Estudiante
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="text-muted small fw-bold">Teléfono</label>
                        <p className="h6">
                          <i className="fas fa-phone me-2 text-muted"></i>
                          {selectedStudent.phone ? (
                            <a href={`tel:${selectedStudent.phone}`} className="text-primary">
                              {selectedStudent.phone}
                            </a>
                          ) : (
                            <span className="text-muted">No especificado</span>
                          )}
                        </p>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="text-muted small fw-bold">Email</label>
                        <p className="h6">
                          <i className="fas fa-envelope me-2 text-muted"></i>
                          {selectedStudent.email ? (
                            <a href={`mailto:${selectedStudent.email}`} className="text-primary">
                              {selectedStudent.email}
                            </a>
                          ) : (
                            <span className="text-muted">No especificado</span>
                          )}
                        </p>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Información del Tutor/Apoderado */}
              <Card className="mb-4 border-0 shadow-sm">
                <Card.Header className="bg-warning text-dark">
                  <h5 className="mb-0">
                    <i className="fas fa-user-shield me-2"></i>
                    Información del Tutor/Apoderado
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="text-muted small fw-bold">Nombres del Tutor</label>
                        <p className="h6">{selectedStudent.guardianName || 'No especificado'}</p>
                      </div>
                      <div className="mb-3">
                        <label className="text-muted small fw-bold">Apellidos del Tutor</label>
                        <p className="h6">{selectedStudent.guardianLastName || 'No especificado'}</p>
                      </div>
                      <div className="mb-3">
                        <label className="text-muted small fw-bold">Tipo de Documento del Tutor</label>
                        <p className="h6">
                          <span className="badge bg-secondary">
                            <i className="fas fa-id-card me-2"></i>
                            {formatDocumentType(selectedStudent.guardianDocumentType)}
                          </span>
                        </p>
                      </div>
                      <div className="mb-3">
                        <label className="text-muted small fw-bold">Número de Documento del Tutor</label>
                        <p className="h6">{selectedStudent.guardianDocumentNumber || 'No especificado'}</p>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="text-muted small fw-bold">Teléfono del Tutor</label>
                        <p className="h6">
                          <i className="fas fa-phone me-2 text-muted"></i>
                          {selectedStudent.guardianPhone ? (
                            <a href={`tel:${selectedStudent.guardianPhone}`} className="text-primary">
                              {selectedStudent.guardianPhone}
                            </a>
                          ) : (
                            <span className="text-muted">No especificado</span>
                          )}
                        </p>
                      </div>
                      <div className="mb-3">
                        <label className="text-muted small fw-bold">Email del Tutor</label>
                        <p className="h6">
                          <i className="fas fa-envelope me-2 text-muted"></i>
                          {selectedStudent.guardianEmail ? (
                            <a href={`mailto:${selectedStudent.guardianEmail}`} className="text-primary">
                              {selectedStudent.guardianEmail}
                            </a>
                          ) : (
                            <span className="text-muted">No especificado</span>
                          )}
                        </p>
                      </div>
                      <div className="mb-3">
                        <label className="text-muted small fw-bold">Relación con el Estudiante</label>
                        <p className="h6">
                          <span className="badge bg-info">
                            <i className="fas fa-heart me-2"></i>
                            {formatRelationship(selectedStudent.guardianRelationship)}
                          </span>
                        </p>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Información del Sistema */}
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-dark text-white">
                  <h5 className="mb-0">
                    <i className="fas fa-cogs me-2"></i>
                    Información del Sistema
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="text-muted small fw-bold">Fecha de Registro</label>
                        <p className="h6">
                          <i className="fas fa-calendar-plus me-2 text-muted"></i>
                          {formatDateTime(selectedStudent.createdAt)}
                        </p>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="text-muted small fw-bold">Última Actualización</label>
                        <p className="h6">
                          <i className="fas fa-calendar-check me-2 text-muted"></i>
                          {formatDateTime(selectedStudent.updatedAt)}
                        </p>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </div>
          ) : (
            <div className="text-center py-5">
              <p className="text-muted">No se pudieron cargar los detalles del estudiante</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={handleCloseDetails}>
            <i className="fas fa-times me-2"></i>
            Cerrar
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              handleCloseDetails();
              navigate(`/editstudent/${selectedStudent.id}`);
            }}
          >
            <i className="fas fa-edit me-2"></i>
            Editar Estudiante
          </Button>
        </Modal.Footer>
      </Modal>
      <CustomAlert
        show={alert.show}
        onClose={hideAlert}
        onConfirm={alert.onConfirm}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        showCancel={alert.showCancel}
        autoClose={alert.autoClose}
      />
    </>
  );
};

export default StudentList; 