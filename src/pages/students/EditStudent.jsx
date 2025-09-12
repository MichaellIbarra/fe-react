import React, { useState, useEffect } from 'react';
import { Form, Input, Select, DatePicker, Button, Card, Spin } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { studentService } from '../../services/students';
import { DocumentType, Gender, GuardianRelationship } from '../../types/students/student.types';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import CustomAlert from '../common/CustomAlert';
import dayjs from 'dayjs';

// Función auxiliar para convertir array de fecha a dayjs
const formatDateFromArray = (dateArray) => {
  if (!dateArray || !Array.isArray(dateArray)) return null;
  const [year, month, day] = dateArray;
  return dayjs(new Date(year, month - 1, day));
};

const { Option } = Select;

const EditStudent = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [documentType, setDocumentType] = useState('DNI');
  const [guardianDocumentType, setGuardianDocumentType] = useState('DNI');
  const [alert, setAlert] = useState({
    show: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null
  });

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoadingData(true);
        const response = await studentService.getStudentById(id);
        const data = response.data ? response.data : response;
        
        if (!data) {
          showAlert({
            title: 'Error',
            message: 'No se encontró el estudiante',
            type: 'error',
            showCancel: false
          });
          navigate('/studentlist');
          return;
        }
        
        setDocumentType(data.documentType || 'DNI');
        setGuardianDocumentType(data.guardianDocumentType || 'DNI');
        
        const formattedData = {
          ...data,
          birthDate: formatDateFromArray(data.birthDate) || dayjs(data.birthDate)
        };
        
        setInitialValues(formattedData);
        form.setFieldsValue(formattedData);
      } catch (error) {
        console.error('Error al cargar el estudiante:', error);
        showAlert({
          title: 'Error',
          message: 'Error al cargar los datos del estudiante',
          type: 'error',
          showCancel: false
        });
        navigate('/studentlist');
      } finally {
        setLoadingData(false);
      }
    };
    fetchStudent();
  }, [id, form, navigate]);

  const validateNames = (_, value) => {
    if (!value) {
      return Promise.reject('Este campo es requerido');
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
      return Promise.reject('Solo se permiten letras y espacios');
    }
    return Promise.resolve();
  };

  const validateDocument = (_, value) => {
    if (!value) {
      return Promise.reject('El número de documento es requerido');
    }
    if (documentType === 'DNI') {
      if (!/^\d{8}$/.test(value)) {
        return Promise.reject('El DNI debe tener 8 dígitos');
      }
    } else if (documentType === 'CE') {
      if (!/^\d{9,12}$/.test(value)) {
        return Promise.reject('El CE debe tener entre 9 y 12 dígitos');
      }
    }
    return Promise.resolve();
  };

  const validatePhone = (_, value) => {
    if (!value) {
      return Promise.reject('El teléfono es requerido');
    }
    if (!/^9\d{8}$/.test(value)) {
      return Promise.reject('El teléfono debe empezar con 9 y tener 9 dígitos');
    }
    return Promise.resolve();
  };

  const validateGuardianDocument = (_, value) => {
    if (!value) {
      return Promise.reject('El número de documento del tutor es requerido');
    }
    if (guardianDocumentType === 'DNI') {
      if (!/^\d{8}$/.test(value)) {
        return Promise.reject('El DNI debe tener 8 dígitos');
      }
    } else if (guardianDocumentType === 'CE') {
      if (!/^\d{9,12}$/.test(value)) {
        return Promise.reject('El CE debe tener entre 9 y 12 dígitos');
      }
    }
    return Promise.resolve();
  };

  const validateGuardianPhone = (_, value) => {
    if (!value) {
      return Promise.reject('El teléfono del tutor es requerido');
    }
    if (!/^9\d{8}$/.test(value)) {
      return Promise.reject('El teléfono debe empezar con 9 y tener 9 dígitos');
    }
    return Promise.resolve();
  };

  const showAlert = (config) => {
    setAlert({ ...config, show: true });
  };

  const hideAlert = () => {
    setAlert(prev => ({ ...prev, show: false }));
  };

  const handleUpdate = async (values) => {
    setLoading(true);
    try {
      // Convertir fecha a formato array [año, mes, día] como espera la API
      const birthDateArray = values.birthDate ? [
        values.birthDate.year(),
        values.birthDate.month() + 1, // Los meses en dayjs van de 0-11, la API espera 1-12
        values.birthDate.date()
      ] : null;

      const studentData = {
        firstName: values.firstName,
        lastName: values.lastName,
        documentType: values.documentType,
        documentNumber: values.documentNumber,
        birthDate: birthDateArray,
        gender: values.gender,
        address: values.address,
        district: values.district,
        province: values.province,
        department: values.department,
        phone: values.phone,
        email: values.email,
        guardianName: values.guardianName,
        guardianLastName: values.guardianLastName,
        guardianDocumentType: values.guardianDocumentType,
        guardianDocumentNumber: values.guardianDocumentNumber,
        guardianPhone: values.guardianPhone,
        guardianEmail: values.guardianEmail,
        guardianRelationship: values.guardianRelationship,
        status: values.status || 'ACTIVE'
      };

      const response = await studentService.updateStudent(id, studentData);
      const updatedStudent = response.data ? response.data : response;
      showAlert({
        title: 'Éxito',
        message: 'Estudiante actualizado correctamente',
        type: 'success',
        showCancel: false,
        autoClose: true,
        onConfirm: () => navigate('/studentlist')
      });
    } catch (error) {
      console.error('Error al actualizar:', error);
      showAlert({
        title: 'Error',
        message: error.message || 'Error al actualizar el estudiante',
        type: 'error',
        showCancel: false
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    showAlert({
      title: 'Confirmación',
      message: '¿Está seguro de cancelar la edición?',
      type: 'warning',
      showCancel: true,
      onConfirm: () => navigate('/studentlist'),
      onCancel: hideAlert
    });
  };

  if (loadingData) {
    return (
      <>
        <Header />
        <Sidebar activeClassName="edit-student" />
        <div className="page-wrapper">
          <div className="content container-fluid">
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <Spin size="large" />
              <p style={{ marginTop: '20px' }}>Cargando datos...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <Sidebar activeClassName="edit-student" />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="row">
              <div className="col">
                <h3 className="page-title">Editar Estudiante</h3>
              </div>
            </div>
          </div>

          <Card>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleUpdate}
              initialValues={initialValues}
            >
              {/* Información Personal del Estudiante */}
              <Card title="📋 Información Personal del Estudiante" className="mb-4" style={{ backgroundColor: '#f8f9fa' }}>
                <div className="row">
                  <div className="col-md-6">
                    <Form.Item
                      name="firstName"
                      label="Nombres"
                      rules={[{ validator: validateNames }]}
                    >
                      <Input placeholder="Ingrese los nombres del estudiante" />
                    </Form.Item>
                  </div>
                  <div className="col-md-6">
                    <Form.Item
                      name="lastName"
                      label="Apellidos"
                      rules={[{ validator: validateNames }]}
                    >
                      <Input placeholder="Ingrese los apellidos del estudiante" />
                    </Form.Item>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4">
                    <Form.Item
                      name="documentType"
                      label="Tipo de Documento"
                      rules={[{ required: true, message: 'El tipo de documento es requerido' }]}
                    >
                      <Select onChange={value => setDocumentType(value)} placeholder="Seleccione tipo de documento">
                        <Option value="DNI">DNI</Option>
                        <Option value="CE">Carné de Extranjería</Option>
                        <Option value="PASAPORTE">Pasaporte</Option>
                        <Option value="TI">Tarjeta de Identidad</Option>
                      </Select>
                    </Form.Item>
                  </div>
                  <div className="col-md-4">
                    <Form.Item
                      name="documentNumber"
                      label="Número de Documento"
                      rules={[{ validator: validateDocument }]}
                    >
                      <Input 
                        maxLength={documentType === 'DNI' ? 8 : 12} 
                        placeholder="Ingrese número de documento"
                      />
                    </Form.Item>
                  </div>
                  <div className="col-md-4">
                    <Form.Item
                      name="birthDate"
                      label="Fecha de Nacimiento"
                      rules={[{ required: true, message: 'La fecha de nacimiento es requerida' }]}
                    >
                      <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Seleccione fecha de nacimiento" />
                    </Form.Item>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <Form.Item
                      name="gender"
                      label="Género"
                      rules={[{ required: true, message: 'El género es requerido' }]}
                    >
                      <Select placeholder="Seleccione género">
                        <Option value="MALE">Masculino</Option>
                        <Option value="FEMALE">Femenino</Option>
                      </Select>
                    </Form.Item>
                  </div>
                  <div className="col-md-6">
                    <Form.Item
                      name="status"
                      label="Estado"
                      rules={[{ required: true, message: 'El estado es requerido' }]}
                    >
                      <Select placeholder="Seleccione estado">
                        <Option value="ACTIVE">Activo</Option>
                        <Option value="INACTIVE">Inactivo</Option>
                      </Select>
                    </Form.Item>
                  </div>
                </div>
              </Card>

              {/* Información de Ubicación */}
              <Card title="🏠 Información de Ubicación" className="mb-4" style={{ backgroundColor: '#e8f4fd' }}>
                <div className="row">
                  <div className="col-md-12">
                    <Form.Item
                      name="address"
                      label="Dirección"
                      rules={[{ required: true, message: 'La dirección es requerida' }]}
                    >
                      <Input placeholder="Ingrese la dirección completa" />
                    </Form.Item>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4">
                    <Form.Item
                      name="district"
                      label="Distrito"
                      rules={[{ required: true, message: 'El distrito es requerido' }]}
                    >
                      <Input placeholder="Ingrese el distrito" />
                    </Form.Item>
                  </div>
                  <div className="col-md-4">
                    <Form.Item
                      name="province"
                      label="Provincia"
                      rules={[{ required: true, message: 'La provincia es requerida' }]}
                    >
                      <Input placeholder="Ingrese la provincia" />
                    </Form.Item>
                  </div>
                  <div className="col-md-4">
                    <Form.Item
                      name="department"
                      label="Departamento"
                      rules={[{ required: true, message: 'El departamento es requerido' }]}
                    >
                      <Input placeholder="Ingrese el departamento" />
                    </Form.Item>
                  </div>
                </div>
              </Card>

              {/* Información de Contacto del Estudiante */}
              <Card title="📞 Contacto del Estudiante" className="mb-4" style={{ backgroundColor: '#e8f5e8' }}>
                <div className="row">
                  <div className="col-md-6">
                    <Form.Item
                      name="phone"
                      label="Teléfono"
                      rules={[{ validator: validatePhone }]}
                    >
                      <Input maxLength={9} placeholder="Ingrese teléfono (9 dígitos)" />
                    </Form.Item>
                  </div>
                  <div className="col-md-6">
                    <Form.Item
                      name="email"
                      label="Email"
                      rules={[
                        { required: true, message: 'El email es requerido' },
                        { type: 'email', message: 'Ingrese un email válido' }
                      ]}
                    >
                      <Input placeholder="Ingrese email del estudiante" />
                    </Form.Item>
                  </div>
                </div>
              </Card>

              {/* Información del Tutor/Apoderado */}
              <Card title="👥 Información del Tutor/Apoderado" className="mb-4" style={{ backgroundColor: '#fff3cd' }}>
                <div className="row">
                  <div className="col-md-6">
                    <Form.Item
                      name="guardianName"
                      label="Nombres del Tutor"
                      rules={[{ validator: validateNames }]}
                    >
                      <Input placeholder="Ingrese nombres del tutor" />
                    </Form.Item>
                  </div>
                  <div className="col-md-6">
                    <Form.Item
                      name="guardianLastName"
                      label="Apellidos del Tutor"
                      rules={[{ validator: validateNames }]}
                    >
                      <Input placeholder="Ingrese apellidos del tutor" />
                    </Form.Item>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4">
                    <Form.Item
                      name="guardianDocumentType"
                      label="Tipo de Documento del Tutor"
                      rules={[{ required: true, message: 'El tipo de documento del tutor es requerido' }]}
                    >
                      <Select onChange={value => setGuardianDocumentType(value)} placeholder="Seleccione tipo de documento">
                        <Option value="DNI">DNI</Option>
                        <Option value="CE">Carné de Extranjería</Option>
                        <Option value="PASAPORTE">Pasaporte</Option>
                        <Option value="TI">Tarjeta de Identidad</Option>
                      </Select>
                    </Form.Item>
                  </div>
                  <div className="col-md-4">
                    <Form.Item
                      name="guardianDocumentNumber"
                      label="Número de Documento del Tutor"
                      rules={[{ validator: validateGuardianDocument }]}
                    >
                      <Input 
                        maxLength={guardianDocumentType === 'DNI' ? 8 : 12} 
                        placeholder="Ingrese número de documento"
                      />
                    </Form.Item>
                  </div>
                  <div className="col-md-4">
                    <Form.Item
                      name="guardianRelationship"
                      label="Relación con el Estudiante"
                      rules={[{ required: true, message: 'La relación es requerida' }]}
                    >
                      <Select placeholder="Seleccione relación">
                        <Option value="MOTHER">Madre</Option>
                        <Option value="FATHER">Padre</Option>
                        <Option value="GUARDIAN">Tutor/a</Option>
                        <Option value="GRANDPARENT">Abuelo/a</Option>
                        <Option value="UNCLE_AUNT">Tío/a</Option>
                        <Option value="OTHER">Otro</Option>
                      </Select>
                    </Form.Item>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <Form.Item
                      name="guardianPhone"
                      label="Teléfono del Tutor"
                      rules={[{ validator: validateGuardianPhone }]}
                    >
                      <Input maxLength={9} placeholder="Ingrese teléfono del tutor" />
                    </Form.Item>
                  </div>
                  <div className="col-md-6">
                    <Form.Item
                      name="guardianEmail"
                      label="Email del Tutor"
                      rules={[
                        { required: true, message: 'El email del tutor es requerido' },
                        { type: 'email', message: 'Ingrese un email válido' }
                      ]}
                    >
                      <Input placeholder="Ingrese email del tutor" />
                    </Form.Item>
                  </div>
                </div>
              </Card>

              <div className="form-actions text-center">
                <Button type="primary" size="large" onClick={form.submit} loading={loading} className="me-3">
                  💾 Guardar Cambios
                </Button>
                <Button size="large" className="cancel-button" onClick={handleCancel}>
                  ❌ Cancelar
                </Button>
              </div>
            </Form>
          </Card>
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

export default EditStudent;