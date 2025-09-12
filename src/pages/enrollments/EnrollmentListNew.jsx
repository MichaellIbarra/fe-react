import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Form, InputGroup, Spinner, Modal, Card, Row, Col, Badge, Dropdown } from 'react-bootstrap';
import { enrollmentService, studentService } from '../../services/students';
import { EnrollmentStatus, EnrollmentStatusLabels, EnrollmentStatusColors } from '../../types/students/enrollment.types';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import CustomAlert from '../common/CustomAlert';
import './EnrollmentList.css';

const EnrollmentList = () => {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [studentDetails, setStudentDetails] = useState({});
  const [processingAction, setProcessingAction] = useState(false);
  const [filters, setFilters] = useState({
    status: 'ACTIVE'
  });
  const [alert, setAlert] = useState({
    show: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null
  });

  const loadStudentDetails = async (studentId) => {
    if (!studentId || studentDetails[studentId]) return;
    
    try {
      const response = await studentService.getStudentById(studentId);
      const student = response.data ? response.data : response;
      setStudentDetails(prev => ({
        ...prev,
        [studentId]: student
      }));
    } catch (error) {
      console.error(`Error al cargar estudiante ${studentId}:`, error);
    }
  };

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      setError('');
      
      let enrollmentsResponse;
      if (filters.status === 'all') {
        enrollmentsResponse = await enrollmentService.getAllEnrollments();
      } else {
        enrollmentsResponse = await enrollmentService.getEnrollmentsByStatus(filters.status);
      }
      
      const enrollmentsData = enrollmentsResponse.data ? enrollmentsResponse.data : enrollmentsResponse;
      setEnrollments(Array.isArray(enrollmentsData) ? enrollmentsData : []);

      // Cargar detalles de estudiantes para cada matrícula
      if (Array.isArray(enrollmentsData)) {
        const promises = enrollmentsData.map(enrollment => 
          loadStudentDetails(enrollment.studentId)
        );
        await Promise.all(promises);
      }
    } catch (error) {
      console.error('Error al cargar matrículas:', error);
      setError('Error al cargar los datos. Por favor, intente nuevamente.');
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnrollments();
  }, [filters.status]);

  const showAlert = ({ title, message, type, onConfirm, showCancel = true, autoClose = false }) => {
    setAlert({
      show: true,
      title,
      message,
      type,
      onConfirm,
      showCancel,
      autoClose
    });
  };

  const hideAlert = () => {
    setAlert(prev => ({ ...prev, show: false }));
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      setProcessingAction(true);
      await enrollmentService.updateEnrollmentStatus(id, newStatus);
      
      setEnrollments(prevEnrollments => 
        prevEnrollments.map(enrollment => 
          enrollment.id === id 
            ? { ...enrollment, status: newStatus }
            : enrollment
        )
      );

      showAlert({
        title: 'Éxito',
        message: `Estado de matrícula actualizado a ${EnrollmentStatusLabels[newStatus]}`,
        type: 'success',
        showCancel: false,
        autoClose: true
      });
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      showAlert({
        title: 'Error',
        message: error.message || 'No se pudo actualizar el estado de la matrícula',
        type: 'error',
        showCancel: false
      });
    } finally {
      setProcessingAction(false);
    }
  };

  const handleDelete = async (id) => {
    showAlert({
      title: '¿Está seguro?',
      message: 'Esta acción eliminará la matrícula permanentemente',
      type: 'warning',
      onConfirm: async () => {
        try {
          setProcessingAction(true);
          await enrollmentService.deleteEnrollment(id);
          setEnrollments(prevEnrollments => 
            prevEnrollments.filter(enrollment => enrollment.id !== id)
          );
          showAlert({
            title: 'Eliminado',
            message: 'La matrícula ha sido eliminada correctamente',
            type: 'success',
            showCancel: false,
            autoClose: true
          });
        } catch (error) {
          console.error('Error al eliminar matrícula:', error);
          showAlert({
            title: 'Error',
            message: error.message || 'No se pudo eliminar la matrícula',
            type: 'error',
            showCancel: false
          });
        } finally {
          setProcessingAction(false);
        }
      }
    });
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const filteredEnrollments = enrollments.filter(enrollment => {
    if (!enrollment) return false;

    if (searchTerm) {
      const searchString = searchTerm.toLowerCase();
      const student = studentDetails[enrollment.studentId];
      
      return (
        enrollment.enrollmentNumber?.toLowerCase().includes(searchString) ||
        enrollment.classroomId?.toLowerCase().includes(searchString) ||
        student?.firstName?.toLowerCase().includes(searchString) ||
        student?.lastName?.toLowerCase().includes(searchString) ||
        student?.documentNumber?.toLowerCase().includes(searchString)
      );
    }

    return true;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <Header />
        <Sidebar activeClassName="enrollment-list" />
        <div className="page-wrapper">
          <div className="content container-fluid">
            <div className="d-flex justify-content-center align-items-center" style={{minHeight: '400px'}}>
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Cargando...</span>
              </Spinner>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                  <i className="fas fa-users me-2"></i>
                  Matrículas
                </h3>
              </div>
              <div className="col-auto">
                <Button 
                  className="btn-add"
                  onClick={() => navigate('/add-enrollment')}
                >
                  <i className="fas fa-plus me-2"></i>
                  Agregar Matrícula
                </Button>
                <Dropdown style={{marginLeft: '10px'}}>
                  <Dropdown.Toggle variant="outline-secondary" id="dropdown-advanced">
                    <i className="fas fa-cogs me-2"></i>
                    Opciones Avanzadas
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => navigate('/enrollments/bulk-upload')}>
                      <i className="fas fa-upload me-2"></i>
                      Carga Masiva
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
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      {error}
                    </div>
                  )}

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
                            <option value="COMPLETED">Completados</option>
                            <option value="TRANSFERRED">Transferidos</option>
                            <option value="WITHDRAWN">Retirados</option>
                            <option value="SUSPENDED">Suspendidos</option>
                            <option value="all">Todos los estados</option>
                          </Form.Select>
                        </Form.Group>
                      </div>
                      <div className="col-12 col-sm-6 col-lg-9 mb-3">
                        <Form.Group>
                          <Form.Label>Buscar</Form.Label>
                          <InputGroup size="sm">
                            <Form.Control
                              placeholder="Buscar por número de matrícula, estudiante o aula"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Button variant="outline-secondary">
                              <i className="fas fa-search"></i>
                            </Button>
                          </InputGroup>
                        </Form.Group>
                      </div>
                    </div>
                  </div>

                  <div className="statistics-row mb-3">
                    Mostrando <strong>{filteredEnrollments.length}</strong> de <strong>{enrollments.length}</strong> matrículas
                  </div>

                  <div className="table-responsive">
                    <Table hover>
                      <thead>
                        <tr>
                          <th>Número de Matrícula</th>
                          <th>Estudiante</th>
                          <th>Aula/Período</th>
                          <th>Fecha de Matrícula</th>
                          <th>Estado</th>
                          <th className="text-end">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEnrollments.map((enrollment) => {
                          const student = studentDetails[enrollment.studentId];
                          return (
                            <tr key={enrollment.id}>
                              <td data-label="Número">
                                <span className="badge bg-light text-dark">
                                  {enrollment.enrollmentNumber}
                                </span>
                              </td>
                              <td data-label="Estudiante">
                                {student ? (
                                  <div>
                                    <strong>{student.firstName} {student.lastName}</strong>
                                    <br />
                                    <small className="text-muted">{student.documentType} - {student.documentNumber}</small>
                                  </div>
                                ) : (
                                  <Spinner animation="border" size="sm" />
                                )}
                              </td>
                              <td data-label="Aula">
                                <span className="badge bg-info">
                                  {enrollment.classroomId}
                                </span>
                              </td>
                              <td data-label="Fecha">
                                {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                              </td>
                              <td data-label="Estado">
                                <Badge 
                                  bg={EnrollmentStatusColors[enrollment.status] || 'secondary'}
                                >
                                  {EnrollmentStatusLabels[enrollment.status] || enrollment.status}
                                </Badge>
                              </td>
                              <td data-label="Acciones">
                                <div className="actions">
                                  <Dropdown>
                                    <Dropdown.Toggle variant="primary" size="sm">
                                      <i className="fas fa-edit me-1"></i>
                                      Estado
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                      <Dropdown.Item 
                                        onClick={() => handleStatusChange(enrollment.id, EnrollmentStatus.ACTIVE)}
                                        disabled={enrollment.status === EnrollmentStatus.ACTIVE}
                                      >
                                        Activo
                                      </Dropdown.Item>
                                      <Dropdown.Item 
                                        onClick={() => handleStatusChange(enrollment.id, EnrollmentStatus.COMPLETED)}
                                        disabled={enrollment.status === EnrollmentStatus.COMPLETED}
                                      >
                                        Completado
                                      </Dropdown.Item>
                                      <Dropdown.Item 
                                        onClick={() => handleStatusChange(enrollment.id, EnrollmentStatus.TRANSFERRED)}
                                        disabled={enrollment.status === EnrollmentStatus.TRANSFERRED}
                                      >
                                        Transferido
                                      </Dropdown.Item>
                                      <Dropdown.Item 
                                        onClick={() => handleStatusChange(enrollment.id, EnrollmentStatus.SUSPENDED)}
                                        disabled={enrollment.status === EnrollmentStatus.SUSPENDED}
                                      >
                                        Suspendido
                                      </Dropdown.Item>
                                      <Dropdown.Item 
                                        onClick={() => handleStatusChange(enrollment.id, EnrollmentStatus.WITHDRAWN)}
                                        disabled={enrollment.status === EnrollmentStatus.WITHDRAWN}
                                      >
                                        Retirado
                                      </Dropdown.Item>
                                    </Dropdown.Menu>
                                  </Dropdown>
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleDelete(enrollment.id)}
                                    disabled={processingAction}
                                  >
                                    <i className="fas fa-trash me-1"></i>
                                    Eliminar
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {filteredEnrollments.length === 0 && (
                          <tr>
                            <td colSpan="6" className="text-center py-4">
                              <i className="fas fa-inbox fa-2x text-muted mb-3"></i>
                              <p className="text-muted mb-0">No se encontraron matrículas</p>
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

export default EnrollmentList;
