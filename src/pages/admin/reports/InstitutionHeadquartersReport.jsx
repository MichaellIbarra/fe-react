/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import InstitutionStatsChart from '../../../components/Dashboard/Reports/InstitutionStatsChart';
import institutionService from '../../../services/institutions/institutionService';
import { Spin, Card, Row, Col, Statistic, Select, DatePicker } from 'antd';
import { FeatherIcon } from 'feather-icons-react';
import '../../../assets/css/institution-reports.css';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const { Option } = Select;
const { RangePicker } = DatePicker;

const InstitutionHeadquartersReport = () => {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    totalInstitutions: 0,
    totalHeadquarters: 0,
    activeInstitutions: 0,
    inactiveInstitutions: 0,
    institutionsData: []
  });
  const [chartType, setChartType] = useState('bar');

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const institutionsData = await institutionService.getAllInstitutions();
      
      const reportInfo = {
        totalInstitutions: institutionsData.length,
        totalHeadquarters: 0,
        activeInstitutions: institutionsData.filter(inst => inst.status === 'A').length,
        inactiveInstitutions: institutionsData.filter(inst => inst.status === 'I').length,
        institutionsData: []
      };

      // Obtener datos de sedes para cada institución
      const institutionsWithHeadquarters = await Promise.all(
        institutionsData.map(async (institution) => {
          try {
            const headquarters = await institutionService.getInstitutionHeadquarters(institution.id);
            const activeHeadquarters = headquarters.filter(hq => hq.status === 'A').length;
            reportInfo.totalHeadquarters += activeHeadquarters;
            
            return {
              id: institution.id,
              name: institution.institutionName,
              codeName: institution.codeName,
              status: institution.status,
              headquartersCount: activeHeadquarters,
              totalHeadquarters: headquarters.length,
              address: institution.address
            };
          } catch (error) {
            console.error(`Error loading headquarters for institution ${institution.id}:`, error);
            return {
              id: institution.id,
              name: institution.institutionName,
              codeName: institution.codeName,
              status: institution.status,
              headquartersCount: 0,
              totalHeadquarters: 0,
              address: institution.address
            };
          }
        })
      );

      reportInfo.institutionsData = institutionsWithHeadquarters;
      setReportData(reportInfo);
      setInstitutions(institutionsWithHeadquarters);
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Configuración del gráfico de barras
  const getBarChartData = () => {
    const labels = institutions.map(inst => inst.codeName || inst.name.substring(0, 15));
    const data = institutions.map(inst => inst.headquartersCount);
    const backgroundColors = institutions.map((inst, index) => {
      const colors = [
        'rgba(75, 192, 192, 0.8)',
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)',
        'rgba(199, 199, 199, 0.8)',
        'rgba(83, 102, 255, 0.8)'
      ];
      return colors[index % colors.length];
    });

    return {
      labels,
      datasets: [
        {
          label: 'Cantidad de Sedes',
          data,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map(color => color.replace('0.8', '1')),
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        }
      ]
    };
  };

  // Configuración del gráfico circular
  const getDoughnutChartData = () => {
    const labels = institutions.map(inst => inst.codeName || inst.name.substring(0, 20));
    const data = institutions.map(inst => inst.headquartersCount);
    
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
      '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
      '#4BC0C0', '#36A2EB', '#FFCE56', '#9966FF'
    ];

    return {
      labels,
      datasets: [
        {
          label: 'Distribución de Sedes',
          data,
          backgroundColor: colors.slice(0, data.length),
          borderColor: '#fff',
          borderWidth: 2,
          hoverOffset: 10
        }
      ]
    };
  };

  // Configuración del gráfico de líneas
  const getLineChartData = () => {
    const labels = institutions.map((inst, index) => `Inst ${index + 1}`);
    const data = institutions.map(inst => inst.headquartersCount);

    return {
      labels,
      datasets: [
        {
          label: 'Tendencia de Sedes por Institución',
          data,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgb(75, 192, 192)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Reporte de Sedes por Institución',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          afterLabel: function(context) {
            const institution = institutions[context.dataIndex];
            if (institution) {
              return `Total: ${institution.totalHeadquarters} sedes`;
            }
            return '';
          }
        }
      }
    },
    scales: chartType === 'doughnut' ? {} : {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return <Bar data={getBarChartData()} options={chartOptions} />;
      case 'doughnut':
        return <Doughnut data={getDoughnutChartData()} options={chartOptions} />;
      case 'line':
        return <Line data={getLineChartData()} options={chartOptions} />;
      default:
        return <Bar data={getBarChartData()} options={chartOptions} />;
    }
  };

  if (loading) {
    return (
      <div className="main-wrapper">
        <Header />
        <Sidebar id="menu-item15" id1="menu-items15" activeClassName="reports" />
        <div className="page-wrapper">
          <div className="content">
            <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
              <Spin size="large" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-wrapper">
      <Header />
      <Sidebar id="menu-item15" id1="menu-items15" activeClassName="reports" />
      
      <div className="page-wrapper">
        <div className="content">
          {/* Page Header */}
          <div className="page-header">
            <div className="row">
              <div className="col-sm-12">
                <div className="page-sub-header">
                  <h3 className="page-title">Reporte de Instituciones y Sedes</h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/admin">Inicio</Link>
                    </li>
                    <li className="breadcrumb-item active">
                      Reporte Instituciones - Sedes
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <Row gutter={16} className="mb-4 institution-report-stats">
            <Col span={6}>
              <Card>
                <Statistic
                  title="Total Instituciones"
                  value={reportData.totalInstitutions}
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<i className="fas fa-building" />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Total Sedes"
                  value={reportData.totalHeadquarters}
                  valueStyle={{ color: '#1890ff' }}
                  prefix={<i className="fas fa-map-marker-alt" />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Instituciones Activas"
                  value={reportData.activeInstitutions}
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<i className="fas fa-check-circle" />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Promedio Sedes/Institución"
                  value={(reportData.totalHeadquarters / reportData.totalInstitutions || 0).toFixed(1)}
                  valueStyle={{ color: '#722ed1' }}
                  prefix={<i className="fas fa-chart-line" />}
                />
              </Card>
            </Col>
          </Row>

          {/* Chart Controls */}
          <div className="row mb-4">
            <div className="col-md-12">
              <div className="card">
                <div className="card-header">
                  <div className="row align-items-center">
                    <div className="col">
                      <h5 className="card-title">Gráfico de Distribución</h5>
                    </div>
                    <div className="col-auto">
                      <Select
                        value={chartType}
                        onChange={setChartType}
                        style={{ width: 150 }}
                        placeholder="Tipo de gráfico"
                      >
                        <Option value="bar">Barras</Option>
                        <Option value="doughnut">Circular</Option>
                        <Option value="line">Líneas</Option>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div style={{ height: '400px', position: 'relative' }}>
                    {renderChart()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ApexCharts Comparative Chart */}
          <div className="row mb-4">
            <div className="col-md-12">
              <InstitutionStatsChart institutions={institutions} />
            </div>
          </div>

          {/* Detailed Table */}
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title">Detalle por Institución</h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead className="thead-dark">
                        <tr>
                          <th>Institución</th>
                          <th>Código</th>
                          <th>Sedes Activas</th>
                          <th>Total Sedes</th>
                          <th>Estado</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {institutions.map((institution, index) => (
                          <tr key={institution.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div 
                                  className="avatar avatar-sm me-2 d-flex align-items-center justify-content-center rounded-circle text-white"
                                  style={{ 
                                    backgroundColor: index % 2 === 0 ? '#007bff' : '#28a745',
                                    minWidth: '35px',
                                    height: '35px'
                                  }}
                                >
                                  {institution.name.charAt(0)}
                                </div>
                                <div>
                                  <h6 className="mb-0">{institution.name}</h6>
                                  <small className="text-muted">{institution.address}</small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-info">
                                {institution.codeName}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <span className="me-2">{institution.headquartersCount}</span>
                                <div className="progress flex-grow-1" style={{ height: '6px' }}>
                                  <div 
                                    className="progress-bar bg-success" 
                                    style={{ 
                                      width: `${Math.max((institution.headquartersCount / Math.max(...institutions.map(i => i.headquartersCount))) * 100, 10)}%` 
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td>{institution.totalHeadquarters}</td>
                            <td>
                              <span className={`badge ${institution.status === 'A' ? 'bg-success' : 'bg-danger'}`}>
                                {institution.status === 'A' ? 'Activo' : 'Inactivo'}
                              </span>
                            </td>
                            <td>
                              <div className="actions">
                                <Link 
                                  to={`/institution/${institution.id}`} 
                                  className="btn btn-sm btn-outline-info me-1"
                                  title="Ver detalles"
                                >
                                  <i className="fas fa-eye"></i>
                                </Link>
                                <Link 
                                  to={`/institution-headquarters/${institution.id}`} 
                                  className="btn btn-sm btn-outline-primary"
                                  title="Ver sedes"
                                >
                                  <i className="fas fa-map-marker-alt"></i>
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionHeadquartersReport;
