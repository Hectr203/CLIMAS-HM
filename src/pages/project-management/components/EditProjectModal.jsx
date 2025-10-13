import React, { useEffect, useMemo, useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import proyectoService from 'services/proyectoService';
import clientService from 'services/clientService';

const priorityOptions = [
  { value: 'low', label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
  { value: 'urgent', label: 'Urgente' },
];

const mapPriorityToEs = (v) => {
  const m = { low: 'Baja', medium: 'Media', high: 'Alta', urgent: 'Urgente' };
  return m[(v || '').toString().toLowerCase()] || v || '';
};

// Normaliza número -> string para inputs controlados
const toStr = (v, fallback = '0') => (v === null || v === undefined ? fallback : String(v));
// Seguro a número
const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const EditProjectModal = ({ isOpen, onClose, onSubmit, project }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [loadingProject, setLoadingProject] = useState(false);
  const [serverProject, setServerProject] = useState(null); // <- proyecto traído por ID

  // CLIENTES reales
  const [clientOptions, setClientOptions] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);

  // 1) Traer clientes reales al abrir
  useEffect(() => {
    if (!isOpen) return;
    let mounted = true;
    (async () => {
      try {
        setLoadingClients(true);
        const resp = await clientService.getClients();
        const list = Array.isArray(resp?.data) ? resp.data : Array.isArray(resp) ? resp : [];
        const opts = list.map((c) => ({
          value: c.id,
          label: c.empresa || c.contacto || '—',
        }));
        if (mounted) setClientOptions(opts);
      } catch (e) {
        console.error('Error cargando clientes:', e);
      } finally {
        if (mounted) setLoadingClients(false);
      }
    })();
    return () => { mounted = false; };
  }, [isOpen]);

  // 2) Traer el proyecto por ID al abrir (la fuente de la verdad)
  useEffect(() => {
    if (!isOpen || !project?.id) return;
    let mounted = true;
    (async () => {
      try {
        setLoadingProject(true);
        const resp = await proyectoService.obtenerProyecto(project.id);
        const doc = resp?.data && typeof resp.data === 'object' ? resp.data : resp; // soporta {data} o plano
        if (mounted) setServerProject(doc || null);
      } catch (e) {
        console.error('Error obteniendo proyecto por ID:', e);
        // fallback a lo que venía de la tabla
        if (mounted) setServerProject(project || null);
      } finally {
        if (mounted) setLoadingProject(false);
      }
    })();
    return () => { mounted = false; };
  }, [isOpen, project?.id]);

  // 3) Normalizador desde el documento del backend
  const normalizedFromDoc = useMemo(() => {
    const doc = serverProject || project || {};
    const p = doc.presupuesto || {};
    const b = doc.budgetBreakdown || {};

    const manoObra   = p.manoObra     ?? b.labor          ?? 0;
    const piezas     = p.piezas       ?? b.parts          ?? 0;
    const equipos    = p.equipos      ?? b.equipment      ?? 0;
    const materiales = p.materiales   ?? b.materials      ?? 0;
    const transporte = p.transporte   ?? b.transportation ?? 0;
    const otros      = p.otros        ?? b.other          ?? 0;
    console.log(doc, 'd');
    
    return {
      name: doc?.nombreProyecto ?? doc?.name ?? '',
      code: doc?.codigo ?? doc?.code ?? '',
      type: doc?.tipoProyecto ?? doc?.type ?? '',
      client: doc?.cliente?.id || '',
      department: doc?.departamento ?? doc?.department ?? '',
      // Si quisieras precargar prioridad en EN, puedes mapear aquí ES->EN
      priority: '',
      budgetBreakdown: {
        labor:          toStr(manoObra),
        parts:          toStr(piezas),
        equipment:      toStr(equipos),
        materials:      toStr(materiales),
        transportation: toStr(transporte),
        other:          toStr(otros),
      },
      location: doc?.ubicacion ?? doc?.location ?? '',
      startDate: doc?.cronograma?.fechaInicio ?? doc?.startDate ?? '',
      endDate:   doc?.cronograma?.fechaFin    ?? doc?.endDate   ?? '',
      assignedPersonnel: Array.isArray(doc?.personalAsignado)
        ? doc.personalAsignado
        : (doc?.assignedPersonnel || []),
      description: doc?.descripcion ?? doc?.description ?? '',
      // extras útiles para payload
      _raw: doc,
    };
  }, [serverProject, project]);

  const [formData, setFormData] = useState(normalizedFromDoc);
  useEffect(() => {
    if (isOpen) setFormData(normalizedFromDoc);
  }, [normalizedFromDoc, isOpen]);

  const handleInputChange = (key, value) => {
    setFormData((s) => ({ ...s, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleBudgetChange = (key, value) => {
    setFormData((s) => ({
      ...s,
      budgetBreakdown: { ...s.budgetBreakdown, [key]: value },
    }));
  };

  const validate = () => {
    const e = {};
    if (!formData.name) e.name = 'Requerido';
    if (!formData.type) e.type = 'Requerido';
    if (!formData.department) e.department = 'Requerido';
    if (!formData.location) e.location = 'Requerido';
    if (!formData.startDate) e.startDate = 'Requerido';
    if (!formData.endDate) e.endDate = 'Requerido';
    if (formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      e.endDate = 'La fecha de fin no puede ser anterior al inicio';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // 4) Construcción del payload ES respetando estructura del backend
  const buildPayloadES = () => {
    const base = formData?._raw || serverProject || project || {};

    // Buscar nombre visible (empresa) del cliente seleccionado,
    // o conservar el actual del doc si no se cambió el select
    const selectedClient = clientOptions.find((o) => o.value === formData.client);
    const clienteId = formData.client || base?.cliente?.id || '';
    const clienteNombre = selectedClient?.label || base?.cliente?.nombre || '';

    const manoObra   = toNum(formData?.budgetBreakdown?.labor);
    const piezas     = toNum(formData?.budgetBreakdown?.parts);
    const equipos    = toNum(formData?.budgetBreakdown?.equipment);
    const materiales = toNum(formData?.budgetBreakdown?.materials);
    const transporte = toNum(formData?.budgetBreakdown?.transportation);
    const otros      = toNum(formData?.budgetBreakdown?.other);
    const total      = manoObra + piezas + equipos + materiales + transporte + otros;
    console.log(base, 'b');
    
    return {
      codigo: formData.code ?? base?.codigo ?? base?.code ?? '',
      nombreProyecto: formData.name || base?.nombreProyecto || '',
      tipoProyecto: formData.type || base?.tipoProyecto || '',
      cliente: { id: clienteId, nombre: clienteNombre },
      departamento: formData.department || base?.departamento || '',
      prioridad: formData.priority ? mapPriorityToEs(formData.priority) : (base?.prioridad ?? ''),
      ubicacion: formData.location || base?.ubicacion || '',
      descripcion: formData.description || base?.descripcion || '',
      personalAsignado: Array.isArray(formData.assignedPersonnel) && formData.assignedPersonnel.length
        ? formData.assignedPersonnel
        : (base?.personalAsignado || []),
      cronograma: {
        fechaInicio: formData.startDate || base?.cronograma?.fechaInicio || '',
        fechaFin: formData.endDate || base?.cronograma?.fechaFin || '',
      },
      presupuesto: { manoObra, piezas, equipos, materiales, transporte, otros, total },
      totalPresupuesto: total,
      createdAt: base?.createdAt,
      updatedAt: new Date().toISOString(),
      id: base?.id, // por si tu backend lo acepta en el body
    };
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const payload = buildPayloadES();
      await proyectoService.actualizarProyecto((serverProject || project)?.id, payload);
      onSubmit && onSubmit(payload);
      onClose && onClose();
    } catch (err) {
      console.error('Error actualizando proyecto:', err);
      const msg = err?.response?.data?.error || err?.message || 'Error desconocido';
      alert('No se pudo actualizar el proyecto. Error: ' + msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-1050 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Editar Proyecto</h2>
            <p className="text-sm text-muted-foreground">
              {loadingProject ? 'Cargando datos…' : 'Actualice la información del proyecto'}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información Básica */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-foreground mb-4">Información Básica</h3>
            </div>

            <Input
              label="Nombre del Proyecto"
              type="text"
              placeholder="Ej: Instalación HVAC Edificio Central"
              value={formData?.name}
              onChange={(e) => handleInputChange('name', e?.target?.value)}
              error={errors?.name}
              required
            />

            <Input
              label="Código del Proyecto"
              type="text"
              placeholder="Ej: PROJ-2024-001"
              value={formData?.code}
              onChange={(e) => handleInputChange('code', e?.target?.value)}
              error={errors?.code}
              description="Se generará automáticamente si se deja vacío"
            />

            <Input
              label="Tipo de Proyecto"
              type="text"
              placeholder="Ej: Mantenimiento Preventivo"
              value={formData?.type}
              onChange={(e) => handleInputChange('type', e?.target?.value)}
              error={errors?.type}
              required
            />

            <Select
              label="Cliente"
              options={clientOptions}
              value={formData?.client}
              onChange={(value) => handleInputChange('client', value)}
              searchable
              loading={loadingClients}
              placeholder="Seleccione un cliente"
            />

            <Input
              label="Departamento Responsable"
              type="text"
              placeholder="Ej: Mantenimiento"
              value={formData?.department}
              onChange={(e) => handleInputChange('department', e?.target?.value)}
              error={errors?.department}
              required
            />

            <Select
              label="Prioridad"
              options={priorityOptions}
              value={formData?.priority}
              onChange={(value) => handleInputChange('priority', value)}
              placeholder="Seleccione prioridad"
            />

            {/* Desglose de Presupuesto */}
            <div className="md:col-span-2 mt-6">
              <h3 className="text-lg font-medium text-foreground mb-4">Desglose de Presupuesto</h3>
              {errors?.budget && (
                <p className="text-sm text-destructive mb-4">{errors?.budget}</p>
              )}
            </div>

            <Input
              label="Mano de Obra (MXN)"
              type="number"
              placeholder="0.00"
              value={formData?.budgetBreakdown?.labor}
              onChange={(e) => handleBudgetChange('labor', e?.target?.value)}
              min="0"
              step="0.01"
            />

            <Input
              label="Piezas (MXN)"
              type="number"
              placeholder="0.00"
              value={formData?.budgetBreakdown?.parts}
              onChange={(e) => handleBudgetChange('parts', e?.target?.value)}
              min="0"
              step="0.01"
            />

            <Input
              label="Equipos (MXN)"
              type="number"
              placeholder="0.00"
              value={formData?.budgetBreakdown?.equipment}
              onChange={(e) => handleBudgetChange('equipment', e?.target?.value)}
              min="0"
              step="0.01"
            />

            <Input
              label="Materiales (MXN)"
              type="number"
              placeholder="0.00"
              value={formData?.budgetBreakdown?.materials}
              onChange={(e) => handleBudgetChange('materials', e?.target?.value)}
              min="0"
              step="0.01"
            />

            <Input
              label="Transporte (MXN)"
              type="number"
              placeholder="0.00"
              value={formData?.budgetBreakdown?.transportation}
              onChange={(e) => handleBudgetChange('transportation', e?.target?.value)}
              min="0"
              step="0.01"
            />

            <Input
              label="Otros Gastos (MXN)"
              type="number"
              placeholder="0.00"
              value={formData?.budgetBreakdown?.other}
              onChange={(e) => handleBudgetChange('other', e?.target?.value)}
              min="0"
              step="0.01"
            />

            {/* Total del Presupuesto */}
            <div className="md:col-span-2">
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">
                    Total del Presupuesto:
                  </span>
                  <span className="text-lg font-semibold text-primary">
                    {(() => {
                      const b = formData.budgetBreakdown || {};
                      const sum =
                        toNum(b.labor) +
                        toNum(b.parts) +
                        toNum(b.equipment) +
                        toNum(b.materials) +
                        toNum(b.transportation) +
                        toNum(b.other);
                      return `$${(sum || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`;
                    })()}
                  </span>
                </div>
              </div>
            </div>

            <Input
              label="Ubicación"
              type="text"
              placeholder="Ej: Ciudad de México, CDMX"
              value={formData?.location}
              onChange={(e) => handleInputChange('location', e?.target?.value)}
              error={errors?.location}
              required
            />

            {/* Cronograma */}
            <div className="md:col-span-2 mt-6">
              <h3 className="text-lg font-medium text-foreground mb-4">Cronograma</h3>
            </div>

            <Input
              label="Fecha de Inicio"
              type="date"
              value={formData?.startDate}
              onChange={(e) => handleInputChange('startDate', e?.target?.value)}
              error={errors?.startDate}
              required
            />

            <Input
              label="Fecha de Finalización"
              type="date"
              value={formData?.endDate}
              onChange={(e) => handleInputChange('endDate', e?.target?.value)}
              error={errors?.endDate}
              required
            />

            {/* Personal */}
            <div className="md:col-span-2 mt-6">
              <h3 className="text-lg font-medium text-foreground mb-4">Asignación de Personal</h3>
            </div>

            <div className="md:col-span-2">
              <Select
                label="Personal Asignado"
                options={(serverProject?.personalAsignado || project?.personalAsignado || []).map((s) => ({
                  value: s, label: s,
                }))}
                value={formData?.assignedPersonnel}
                onChange={(value) => handleInputChange('assignedPersonnel', value)}
                multiple
                searchable
                description="Seleccione el personal que trabajará en este proyecto"
              />
            </div>

            {/* Descripción */}
            <div className="md:col-span-2 mt-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Descripción del Proyecto
              </label>
              <textarea
                rows={4}
                placeholder="Describa los objetivos, alcance y detalles importantes del proyecto..."
                value={formData?.description}
                onChange={(e) => handleInputChange('description', e?.target?.value)}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" loading={isSubmitting} iconName="Save" iconPosition="left">
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectModal;
