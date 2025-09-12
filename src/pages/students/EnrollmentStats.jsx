import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { studentService, enrollmentService } from '../../services/students';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';

const EnrollmentStats = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await studentService.getEnrollmentStats();
      console.log('Respuesta completa de estadísticas:', response);
      
      // La API devuelve {metadata: {...}, data: {...}}
      const statsData = response.data || response;
      console.log('Datos de estadísticas extraídos:', statsData);
      
      setStats(statsData);
      
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      setError('Error al cargar las estadísticas. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatPercentage = (value) => {
    // El backend ya devuelve el porcentaje como número entero (ej: 50)
    return `${value}%`;
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
                <span className="visually-hidden">Cargando estadísticas...</span>
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
                  <i className="fas fa-chart-bar me-2"></i>
                  Estadísticas de Matrícula
                </h3>
              </div>
              <div className="col-auto">
                <button 
                  className="btn btn-primary"
                  onClick={loadStats}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Cargando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sync-alt me-2"></i>
                      Actualizar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="danger">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          )}

          {stats && (
            <div className="row">
              {/* Estudiantes Totales */}
              <div className="col-xl-3 col-sm-6 col-12">
                <Card className="dash-widget">
                  <Card.Body>
                    <div className="dash-widgetimg">
                      <span><i className="fas fa-user-graduate text-primary"></i></span>
                    </div>
                    <div className="dash-widgetcontent">
                      <h5 className="dash-widget-color">{stats.totalActiveStudents || 0}</h5>
                      <h6>Estudiantes Activos</h6>
                    </div>
                  </Card.Body>
                </Card>
              </div>

              {/* Estudiantes Matriculados */}
              <div className="col-xl-3 col-sm-6 col-12">
                <Card className="dash-widget">
                  <Card.Body>
                    <div className="dash-widgetimg">
                      <span><i className="fas fa-users text-success"></i></span>
                    </div>
                    <div className="dash-widgetcontent">
                      <h5 className="dash-widget-color">{stats.uniqueStudentsEnrolled || 0}</h5>
                      <h6>Estudiantes Matriculados</h6>
                    </div>
                  </Card.Body>
                </Card>
              </div>

              {/* Estudiantes No Matriculados */}
              <div className="col-xl-3 col-sm-6 col-12">
                <Card className="dash-widget">
                  <Card.Body>
                    <div className="dash-widgetimg">
                      <span><i className="fas fa-user-slash text-warning"></i></span>
                    </div>
                    <div className="dash-widgetcontent">
                      <h5 className="dash-widget-color">{stats.studentsNotEnrolled || 0}</h5>
                      <h6>No Matriculados</h6>
                    </div>
                  </Card.Body>
                </Card>
              </div>

              {/* Tasa de Matrícula */}
              <div className="col-xl-3 col-sm-6 col-12">
                <Card className="dash-widget">
                  <Card.Body>
                    <div className="dash-widgetimg">
                      <span><i className="fas fa-percentage text-info"></i></span>
                    </div>
                    <div className="dash-widgetcontent">
                      <h5 className="dash-widget-color">{formatPercentage(stats.enrollmentRate || 0)}</h5>
                      <h6>Tasa de Matrícula</h6>
                    </div>
                  </Card.Body>
                </Card>
              </div>

              {/* Matrículas por Estado */}
              <div className="col-xl-6 col-12">
                <Card>
                  <Card.Header>
                    <h5 className="card-title">Estado de Matrículas</h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="row">
                      <div className="col-6">
                        <div className="stats-item">
                          <div className="stats-number text-success">{stats.totalActiveEnrollments || 0}</div>
                          <div className="stats-label">Matrículas Activas</div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="stats-item">
                          <div className="stats-number text-primary">{stats.totalCompletedEnrollments || 0}</div>
                          <div className="stats-label">Completadas</div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="stats-item">
                          <div className="stats-number text-warning">{stats.totalTransferredEnrollments || 0}</div>
                          <div className="stats-label">Transferidas</div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="stats-item">
                          <div className="stats-number text-secondary">{stats.totalSuspendedEnrollments || 0}</div>
                          <div className="stats-label">Suspendidas</div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="stats-item">
                          <div className="stats-number text-danger">{stats.totalWithdrawnEnrollments || 0}</div>
                          <div className="stats-label">Retiradas</div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="stats-item">
                          <div className="stats-number text-muted">{stats.totalInactiveEnrollments || 0}</div>
                          <div className="stats-label">Inactivas</div>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </div>

              {/* Resumen */}
              <div className="col-xl-6 col-12">
                <Card>
                  <Card.Header>
                    <h5 className="card-title">Resumen General</h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="summary-stats">
                      <div className="summary-item">
                        <strong>Total de Estudiantes Activos:</strong> {stats.totalActiveStudents || 0}
                      </div>
                      <div className="summary-item">
                        <strong>Estudiantes con Matrícula:</strong> {stats.uniqueStudentsEnrolled || 0}
                      </div>
                      <div className="summary-item">
                        <strong>Estudiantes sin Matrícula:</strong> {stats.studentsNotEnrolled || 0}
                      </div>
                      <div className="summary-item">
                        <strong>Tasa de Matrícula:</strong> {formatPercentage(stats.enrollmentRate || 0)}
                      </div>
                      <div className="summary-item mt-3">
                        <small className="text-muted">
                          La tasa de matrícula se calcula como el porcentaje de estudiantes activos que tienen al menos una matrícula.
                        </small>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>
        {`
        .dash-widget {
          border: 1px solid #e9ecef;
          border-radius: 8px;
          margin-bottom: 20px;
          transition: box-shadow 0.15s ease-in-out;
        }
        
        .dash-widget:hover {
          box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
        }
        
        .dash-widgetimg {
          float: left;
          width: 60px;
          height: 60px;
          background: #f8f9fa;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
        }
        
        .dash-widgetimg i {
          font-size: 24px;
        }
        
        .dash-widgetcontent h5 {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 5px;
          color: #333;
        }
        
        .dash-widgetcontent h6 {
          font-size: 14px;
          color: #6c757d;
          margin-bottom: 0;
        }
        
        .stats-item {
          text-align: center;
          padding: 15px 0;
        }
        
        .stats-number {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .stats-label {
          font-size: 12px;
          color: #6c757d;
        }
        
        .summary-stats .summary-item {
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .summary-stats .summary-item:last-child {
          border-bottom: none;
        }
        `}
      </style>
    </>
  );
};

export default EnrollmentStats;
