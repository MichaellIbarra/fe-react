import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Badge, Spinner, Alert, Form, Row, Col, Dropdown } from 'react-bootstrap';
import { studentService } from '../../services/students';
import { StudentStatus } from '../../types/students/student.types';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';

const NotEnrolledStudents = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('firstName');
  const [filteredStudents, setFilteredStudents] = useState([]);

  useEffect(() => {
    loadNotEnrolledStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, searchType]);

  const loadNotEnrolledStudents = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await studentService.getNotEnrolledStudents();
      console.log('Response from getNotEnrolledStudents:', response);
      
      // Manejar diferentes formatos de respuesta
      let studentsData = [];
      if (response && Array.isArray(response)) {
        studentsData = response;
      } else if (response && response.data) {
        if (Array.isArray(response.data)) {
          studentsData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          studentsData = response.data.data;
        }
      }
      
      console.log('Processed students data:', studentsData);
      setStudents(studentsData);
    } catch (error) {
      console.error('Error al cargar estudiantes no matriculados:', error);
      
      // Mensaje de error más específico
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Error al cargar los estudiantes no matriculados. Por favor, intente nuevamente.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    if (!searchTerm) {
      setFilteredStudents(students);
      return;
    }

    const filtered = students.filter(student => {
      const searchValue = searchTerm.toLowerCase();
      switch (searchType) {
        case 'firstName':
          return student.firstName?.toLowerCase().includes(searchValue);
        case 'lastName':
          return student.lastName?.toLowerCase().includes(searchValue);
        case 'documentNumber':
          return student.documentNumber?.toLowerCase().includes(searchValue);
        case 'email':
          return student.email?.toLowerCase().includes(searchValue);
        default:
          return student.firstName?.toLowerCase().includes(searchValue) ||
                 student.lastName?.toLowerCase().includes(searchValue);
      }
    });

    setFilteredStudents(filtered);
  };

  const handleSearchTypeChange = (type) => {
    setSearchType(type);
  };

  const handleCreateEnrollment = (studentId) => {
    navigate('/enrollments/add', { state: { selectedStudentId: studentId } });
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    
    try {
      let date;
      
      // Si es un array [año, mes, día]
      if (Array.isArray(dateValue)) {
        const [year, month, day] = dateValue;
        date = new Date(year, month - 1, day); // month - 1 porque los meses van de 0-11
      } else {
        date = new Date(dateValue);
      }
      
      if (isNaN(date.getTime())) return 'Fecha inválida';
      
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const getStatusBadge = (status) => {
    const isActive = status === 'ACTIVE' || status === StudentStatus.ACTIVE;
    const variant = isActive ? 'success' : 'warning';
    const label = isActive ? 'Activo' : 'Inactivo';
    
    return <Badge bg={variant}>{label}</Badge>;
  };

  const getSearchTypeLabel = (type) => {
    const labels = {
      firstName: 'Nombre',
      lastName: 'Apellido',
      documentNumber: 'Documento',
      email: 'Email'
    };
    return labels[type] || 'Nombre';
  };

  if (loading) {
    return (
      <>
        <Header />
        <Sidebar activeClassName="student-list" />
        <div className="page-wrapper">
          <div className="content container-fluid">
            <div className="d-flex justify-content-center align-items-center" style={{minHeight: '400px'}}>
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Cargando estudiantes...</span>
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
                  <i className="fas fa-user-slash me-2"></i>
                  Estudiantes No Matriculados
                </h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <a href="/dashboard">Dashboard</a>
                  </li>
                  <li className="breadcrumb-item">
                    <a href="/students">Estudiantes</a>
                  </li>
                  <li className="breadcrumb-item active">No Matriculados</li>
                </ul>
              </div>
              <div className="col-auto">
                <Button 
                  variant="outline-success" 
                  onClick={loadNotEnrolledStudents}
                  disabled={loading}
                  className="me-2"
                >
                  <i className="fas fa-sync-alt me-1"></i>
                  {loading ? 'Actualizando...' : 'Actualizar'}
                </Button>
                <Button 
                  variant="outline-primary" 
                  onClick={() => navigate('/students/enrollment-stats')}
                  className="me-2"
                >
                  <i className="fas fa-chart-bar me-1"></i>
                  Ver Estadísticas
                </Button>
                <Button 
                  variant="primary" 
                  onClick={() => navigate('/studentlist')}
                >
                  <i className="fas fa-arrow-left me-1"></i>
                  Volver a Estudiantes
                </Button>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="danger" className="mb-4">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
              <Button 
                variant="outline-danger" 
                size="sm" 
                className="ms-2"
                onClick={loadNotEnrolledStudents}
                disabled={loading}
              >
                {loading ? 'Reintentando...' : 'Reintentar'}
              </Button>
            </Alert>
          )}

          {!loading && !error && students.length === 0 && (
            <Alert variant="success" className="mb-4">
              <div className="d-flex align-items-center">
                <i className="fas fa-check-circle me-3" style={{fontSize: '24px'}}></i>
                <div>
                  <strong>¡Excelente trabajo!</strong>
                  <p className="mb-0">Todos los estudiantes activos están matriculados correctamente.</p>
                </div>
              </div>
            </Alert>
          )}

          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">
                <i className="fas fa-users me-2"></i>
                Estudiantes Sin Matrícula ({filteredStudents.length})
              </h5>
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={loadNotEnrolledStudents}
                disabled={loading}
              >
                <i className="fas fa-sync-alt me-1"></i>
                Actualizar
              </Button>
            </Card.Header>
            
            <Card.Body>
              {/* Filtros de búsqueda */}
              <Row className="mb-4">
                <Col md={6}>
                  <div className="input-group">
                    <Dropdown>
                      <Dropdown.Toggle variant="outline-secondary" size="sm">
                        {getSearchTypeLabel(searchType)}
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => handleSearchTypeChange('firstName')}>
                          Nombre
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleSearchTypeChange('lastName')}>
                          Apellido
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleSearchTypeChange('documentNumber')}>
                          Documento
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleSearchTypeChange('email')}>
                          Email
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                    <Form.Control
                      type="text"
                      placeholder={`Buscar por ${getSearchTypeLabel(searchType).toLowerCase()}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <Button 
                        variant="outline-secondary"
                        onClick={() => setSearchTerm('')}
                      >
                        <i className="fas fa-times"></i>
                      </Button>
                    )}
                  </div>
                </Col>
              </Row>

              {filteredStudents.length === 0 ? (
                <div className="text-center py-4">
                  {students.length === 0 ? (
                    <div>
                      <i className="fas fa-check-circle text-success" style={{fontSize: '48px'}}></i>
                      <h5 className="mt-3">¡Excelente!</h5>
                      <p className="text-muted">Todos los estudiantes activos están matriculados</p>
                    </div>
                  ) : (
                    <div>
                      <i className="fas fa-search text-muted" style={{fontSize: '48px'}}></i>
                      <h5 className="mt-3">No se encontraron resultados</h5>
                      <p className="text-muted">No hay estudiantes que coincidan con los criterios de búsqueda</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="table-responsive">
                  <Table striped hover>
                    <thead>
                      <tr>
                        <th>Documento</th>
                        <th>Nombre Completo</th>
                        <th>Email</th>
                        <th>Teléfono</th>
                        <th>Fecha Nacimiento</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student) => (
                        <tr key={student.id}>
                          <td>
                            <div className="font-weight-bold">{student.documentNumber}</div>
                            <small className="text-muted">{student.documentType}</small>
                          </td>
                          <td>
                            <div className="font-weight-bold">
                              {student.firstName} {student.lastName}
                            </div>
                            {student.secondName && (
                              <small className="text-muted">{student.secondName}</small>
                            )}
                          </td>
                          <td>{student.email || 'N/A'}</td>
                          <td>{student.phoneNumber || 'N/A'}</td>
                          <td>{formatDate(student.birthDate)}</td>
                          <td>{getStatusBadge(student.status)}</td>
                          <td>
                            <div className="btn-group" role="group">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => navigate(`/students/view/${student.id}`)}
                                title="Ver detalles"
                              >
                                <i className="fas fa-eye"></i>
                              </Button>
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleCreateEnrollment(student.id)}
                                title="Crear matrícula"
                                disabled={student.status !== StudentStatus.ACTIVE}
                              >
                                <i className="fas fa-plus"></i> Matricular
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>

          {filteredStudents.length > 0 && (
            <div className="mt-3">
              <Alert variant="info">
                <i className="fas fa-info-circle me-2"></i>
                Se muestran {filteredStudents.length} estudiantes sin matrícula activa.
                <strong> Puede crear matrículas directamente desde esta vista.</strong>
              </Alert>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotEnrolledStudents;
