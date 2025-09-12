import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import { studentService } from '../../services/students';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';

// Función auxiliar para convertir fecha string a array [año, mes, día]
const formatDateToArray = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return [
    date.getFullYear(),
    date.getMonth() + 1, // Los meses van de 0-11, necesitamos 1-12
    date.getDate()
  ];
};

const AddStudent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    // Información personal del estudiante
    firstName: '',
    lastName: '',
    documentType: 'DNI',
    documentNumber: '',
    birthDate: '',
    gender: '',
    
    // Información de ubicación
    address: '',
    district: '',
    province: '',
    department: '',
    
    // Información de contacto del estudiante
    phone: '',
    email: '',
    
    // Información del tutor/apoderado
    guardianName: '',
    guardianLastName: '',
    guardianDocumentType: 'DNI',
    guardianDocumentNumber: '',
    guardianPhone: '',
    guardianEmail: '',
    guardianRelationship: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar mensajes al cambiar datos
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    const errors = [];

    // Validaciones obligatorias del estudiante
    if (!formData.firstName.trim()) errors.push('Los nombres son obligatorios');
    if (!formData.lastName.trim()) errors.push('Los apellidos son obligatorios');
    if (!formData.documentNumber.trim()) errors.push('El número de documento es obligatorio'); 
    if (!formData.birthDate) errors.push('La fecha de nacimiento es obligatoria');
    if (!formData.gender) errors.push('El género es obligatorio');
    if (!formData.address.trim()) errors.push('La dirección es obligatoria');
    if (!formData.district.trim()) errors.push('El distrito es obligatorio');
    if (!formData.province.trim()) errors.push('La provincia es obligatoria');
    if (!formData.department.trim()) errors.push('El departamento es obligatorio');
    if (!formData.phone.trim()) errors.push('El teléfono es obligatorio');
    if (!formData.email.trim()) errors.push('El email es obligatorio');

    // Validaciones del tutor/apoderado
    if (!formData.guardianName.trim()) errors.push('Los nombres del tutor son obligatorios');
    if (!formData.guardianLastName.trim()) errors.push('Los apellidos del tutor son obligatorios');
    if (!formData.guardianDocumentNumber.trim()) errors.push('El documento del tutor es obligatorio');
    if (!formData.guardianPhone.trim()) errors.push('El teléfono del tutor es obligatorio');
    if (!formData.guardianEmail.trim()) errors.push('El email del tutor es obligatorio');
    if (!formData.guardianRelationship) errors.push('La relación con el tutor es obligatoria');

    // Validación de documento del estudiante
    if (formData.documentType === 'DNI' && !/^\d{8}$/.test(formData.documentNumber)) {
      errors.push('El DNI debe tener 8 dígitos');
    }

    // Validación de documento del tutor
    if (formData.guardianDocumentType === 'DNI' && !/^\d{8}$/.test(formData.guardianDocumentNumber)) {
      errors.push('El DNI del tutor debe tener 8 dígitos');
    }

    // Validación de email del estudiante
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('El email del estudiante no tiene un formato válido');
    }

    // Validación de email del tutor
    if (formData.guardianEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.guardianEmail)) {
      errors.push('El email del tutor no tiene un formato válido');
    }

    // Validación de teléfono del estudiante
    if (formData.phone && !/^9\d{8}$/.test(formData.phone)) {
      errors.push('El teléfono del estudiante debe empezar con 9 y tener 9 dígitos');
    }

    // Validación de teléfono del tutor
    if (formData.guardianPhone && !/^9\d{8}$/.test(formData.guardianPhone)) {
      errors.push('El teléfono del tutor debe empezar con 9 y tener 9 dígitos');
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '));
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Preparar datos en el formato que espera la API
      const studentData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        documentType: formData.documentType,
        documentNumber: formData.documentNumber.trim(),
        birthDate: formatDateToArray(formData.birthDate),
        gender: formData.gender,
        address: formData.address.trim(),
        district: formData.district.trim(),
        province: formData.province.trim(),
        department: formData.department.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        guardianName: formData.guardianName.trim(),
        guardianLastName: formData.guardianLastName.trim(),
        guardianDocumentType: formData.guardianDocumentType,
        guardianDocumentNumber: formData.guardianDocumentNumber.trim(),
        guardianPhone: formData.guardianPhone.trim(),
        guardianEmail: formData.guardianEmail.trim(),
        guardianRelationship: formData.guardianRelationship
      };

      console.log('Datos a enviar:', studentData);
      
      await studentService.createStudent(studentData);
      
      setSuccess('Estudiante creado exitosamente');
      
      setTimeout(() => {
        navigate('/studentlist');
      }, 2000);
      
    } catch (error) {
      console.error('Error al crear el estudiante:', error);
      setError(error.response?.data?.message || 'Error al crear el estudiante. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('¿Está seguro de que desea cancelar? Se perderán los datos ingresados.')) {
      navigate('/studentlist');
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
                  <i className="fas fa-user-plus me-2"></i>
                  Agregar Estudiante
                </h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <a href="/dashboard">Dashboard</a>
                  </li>
                  <li className="breadcrumb-item">
                    <a href="/students">Estudiantes</a>
                  </li>
                  <li className="breadcrumb-item active">Agregar</li>
                </ul>
              </div>
              <div className="col-auto">
                <Button 
                  variant="outline-secondary" 
                  onClick={handleCancel}
                  disabled={loading}
                >
                  <i className="fas fa-arrow-left me-1"></i>
                  Volver
                </Button>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="danger" className="mb-4">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" className="mb-4">
              <i className="fas fa-check-circle me-2"></i>
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            {/* Información Personal del Estudiante */}
            <Card className="mb-4" style={{ backgroundColor: '#f8f9fa' }}>
              <Card.Header className="bg-primary text-white">
                <h5 className="card-title mb-0">
                  <i className="fas fa-user me-2"></i>
                  📋 Información Personal del Estudiante
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nombres *</Form.Label>
                      <Form.Control
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Ingrese los nombres del estudiante"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Apellidos *</Form.Label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Ingrese los apellidos del estudiante"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tipo de Documento *</Form.Label>
                      <Form.Select
                        name="documentType"
                        value={formData.documentType}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="DNI">DNI</option>
                        <option value="CE">Carné de Extranjería</option>
                        <option value="PASAPORTE">Pasaporte</option>
                        <option value="TI">Tarjeta de Identidad</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Número de Documento *</Form.Label>
                      <Form.Control
                        type="text"
                        name="documentNumber"
                        value={formData.documentNumber}
                        onChange={handleInputChange}
                        placeholder="Ingrese número de documento"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Fecha de Nacimiento *</Form.Label>
                      <Form.Control
                        type="date"
                        name="birthDate"
                        value={formData.birthDate}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Género *</Form.Label>
                      <Form.Select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Seleccionar género</option>
                        <option value="MALE">Masculino</option>
                        <option value="FEMALE">Femenino</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Información de Ubicación */}
            <Card className="mb-4" style={{ backgroundColor: '#e8f4fd' }}>
              <Card.Header className="bg-info text-white">
                <h5 className="card-title mb-0">
                  <i className="fas fa-map-marker-alt me-2"></i>
                  🏠 Información de Ubicación
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Dirección *</Form.Label>
                      <Form.Control
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Ingrese la dirección completa"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Distrito *</Form.Label>
                      <Form.Control
                        type="text"
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        placeholder="Ingrese el distrito"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Provincia *</Form.Label>
                      <Form.Control
                        type="text"
                        name="province"
                        value={formData.province}
                        onChange={handleInputChange}
                        placeholder="Ingrese la provincia"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Departamento *</Form.Label>
                      <Form.Control
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        placeholder="Ingrese el departamento"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Contacto del Estudiante */}
            <Card className="mb-4" style={{ backgroundColor: '#e8f5e8' }}>
              <Card.Header className="bg-success text-white">
                <h5 className="card-title mb-0">
                  <i className="fas fa-address-card me-2"></i>
                  📞 Contacto del Estudiante
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Teléfono *</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="912345679"
                        maxLength={9}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email *</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="estudiante@email.com"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Información del Tutor/Apoderado */}
            <Card className="mb-4" style={{ backgroundColor: '#fff3cd' }}>
              <Card.Header className="bg-warning text-dark">
                <h5 className="card-title mb-0">
                  <i className="fas fa-user-shield me-2"></i>
                  👥 Información del Tutor/Apoderado
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nombres del Tutor *</Form.Label>
                      <Form.Control
                        type="text"
                        name="guardianName"
                        value={formData.guardianName}
                        onChange={handleInputChange}
                        placeholder="Ingrese nombres del tutor"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Apellidos del Tutor *</Form.Label>
                      <Form.Control
                        type="text"
                        name="guardianLastName"
                        value={formData.guardianLastName}
                        onChange={handleInputChange}
                        placeholder="Ingrese apellidos del tutor"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tipo de Documento del Tutor *</Form.Label>
                      <Form.Select
                        name="guardianDocumentType"
                        value={formData.guardianDocumentType}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="DNI">DNI</option>
                        <option value="CE">Carné de Extranjería</option>
                        <option value="PASAPORTE">Pasaporte</option>
                        <option value="TI">Tarjeta de Identidad</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Número de Documento del Tutor *</Form.Label>
                      <Form.Control
                        type="text"
                        name="guardianDocumentNumber"
                        value={formData.guardianDocumentNumber}
                        onChange={handleInputChange}
                        placeholder="Número de documento"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Relación con el Estudiante *</Form.Label>
                      <Form.Select
                        name="guardianRelationship"
                        value={formData.guardianRelationship}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Seleccionar relación</option>
                        <option value="MOTHER">Madre</option>
                        <option value="FATHER">Padre</option>
                        <option value="GUARDIAN">Tutor/a</option>
                        <option value="GRANDPARENT">Abuelo/a</option>
                        <option value="UNCLE_AUNT">Tío/a</option>
                        <option value="OTHER">Otro</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Teléfono del Tutor *</Form.Label>
                      <Form.Control
                        type="tel"
                        name="guardianPhone"
                        value={formData.guardianPhone}
                        onChange={handleInputChange}
                        placeholder="987654322"
                        maxLength={9}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email del Tutor *</Form.Label>
                      <Form.Control
                        type="email"
                        name="guardianEmail"
                        value={formData.guardianEmail}
                        onChange={handleInputChange}
                        placeholder="tutor@email.com"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Botones de acción */}
            <Card>
              <Card.Body>
                <div className="d-flex justify-content-center gap-3">
                  <Button 
                    variant="outline-secondary" 
                    size="lg"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    <i className="fas fa-times me-2"></i>
                    ❌ Cancelar
                  </Button>
                  <Button 
                    variant="primary" 
                    size="lg"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        💾 Crear Estudiante
                      </>
                    )}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddStudent;