import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { useNotifications } from '../../../context/NotificationContext.jsx';

const EditClientModal = ({ isOpen, onClose, client, onSubmit }) => {
  const { showSuccess, showError } = useNotifications();
  const [formData, setFormData] = useState({ ...client });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData({ ...client });
  }, [client]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.companyName || !formData.contactPerson || !formData.email) {
      setErrors({ general: 'Completa los campos obligatorios.' });
      return;
    }
    try {
      await onSubmit(formData);
      showSuccess('Cliente actualizado correctamente');
      onClose();
    } catch (err) {
      showError('Error al actualizar el cliente');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <Icon name="Edit" size={20} className="mr-2" /> Editar Cliente
        </h2>
        {errors.general && <div className="text-error mb-2">{errors.general}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Empresa" name="companyName" value={formData.companyName || ''} onChange={handleChange} required />
          <Input label="Contacto" name="contactPerson" value={formData.contactPerson || ''} onChange={handleChange} required />
          <Input label="Email" name="email" value={formData.email || ''} onChange={handleChange} required />
          <Input label="Teléfono" name="phone" value={formData.phone || ''} onChange={handleChange} />
          <Input label="Industria" name="industry" value={formData.industry || ''} onChange={handleChange} />
          <Input label="Ubicación" name="location" value={formData.location || ''} onChange={handleChange} />
          <Input label="RFC" name="rfc" value={formData.rfc || ''} onChange={handleChange} />
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="ghost" onClick={onClose} type="button">Cancelar</Button>
            <Button variant="default" type="submit">Guardar cambios</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditClientModal;
