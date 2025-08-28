import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import ApexCharts from 'apexcharts';

const InstitutionStatsChart = ({ institutions }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current && institutions.length > 0) {
      // Limpiar gráfico anterior si existe
      if (chartRef.current.chart) {
        chartRef.current.chart.destroy();
      }

      const options = {
        chart: {
          height: 350,
          type: 'bar',
          toolbar: {
            show: true,
            tools: {
              download: true,
              selection: false,
              zoom: false,
              zoomin: false,
              zoomout: false,
              pan: false,
              reset: false
            }
          },
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '60%',
            endingShape: 'rounded',
            borderRadius: 8,
            dataLabels: {
              position: 'top',
            }
          },
        },
        dataLabels: {
          enabled: true,
          offsetY: -20,
          style: {
            fontSize: '12px',
            colors: ['#304758']
          }
        },
        stroke: {
          show: true,
          width: 2,
          colors: ['transparent']
        },
        series: [
          {
            name: 'Sedes Activas',
            data: institutions.map(inst => inst.headquartersCount),
            color: '#00E396'
          },
          {
            name: 'Total Sedes',
            data: institutions.map(inst => inst.totalHeadquarters),
            color: '#008FFB'
          }
        ],
        xaxis: {
          categories: institutions.map(inst => inst.codeName || inst.name.substring(0, 15)),
          title: {
            text: 'Instituciones'
          },
          labels: {
            rotate: -45,
            maxHeight: 120
          }
        },
        yaxis: {
          title: {
            text: 'Cantidad de Sedes'
          },
          min: 0
        },
        fill: {
          opacity: 0.8
        },
        tooltip: {
          y: {
            formatter: function (val, { seriesIndex }) {
              if (seriesIndex === 0) {
                return `${val} sedes activas`;
              } else {
                return `${val} sedes en total`;
              }
            }
          },
          // eslint-disable-next-line no-unused-vars
          custom: function({ series, seriesIndex, dataPointIndex, w }) {
            const institution = institutions[dataPointIndex];
            return `
              <div class="custom-tooltip p-3">
                <div class="tooltip-title mb-2"><strong>${institution.name}</strong></div>
                <div class="tooltip-content">
                  <div>Código: <strong>${institution.codeName}</strong></div>
                  <div>Sedes Activas: <strong>${institution.headquartersCount}</strong></div>
                  <div>Total Sedes: <strong>${institution.totalHeadquarters}</strong></div>
                  <div>Estado: <span class="badge ${institution.status === 'A' ? 'bg-success' : 'bg-danger'}">${institution.status === 'A' ? 'Activo' : 'Inactivo'}</span></div>
                </div>
              </div>
            `;
          }
        },
        legend: {
          position: 'top',
          horizontalAlign: 'left',
          offsetX: 40
        },
        colors: ['#00E396', '#008FFB'],
        grid: {
          borderColor: '#f1f1f1',
          strokeDashArray: 4
        }
      };

      const chart = new ApexCharts(chartRef.current, options);
      chart.render();

      // Guardar referencia del gráfico para poder destruirlo después
      chartRef.current.chart = chart;

      return () => {
        if (chartRef.current.chart) {
          chartRef.current.chart.destroy();
        }
      };
    }
  }, [institutions]);

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title">Comparativa de Sedes por Institución</h5>
        <p className="card-text text-muted">Visualización detallada de sedes activas vs total de sedes</p>
      </div>
      <div className="card-body">
        <div id="institution-stats-chart" ref={chartRef}></div>
      </div>
    </div>
  );
};

// PropTypes validation
InstitutionStatsChart.propTypes = {
  institutions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
      codeName: PropTypes.string,
      headquartersCount: PropTypes.number,
      totalHeadquarters: PropTypes.number,
      status: PropTypes.string,
    })
  ).isRequired,
};

export default InstitutionStatsChart;
