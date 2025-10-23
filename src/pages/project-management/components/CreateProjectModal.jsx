import React, { useEffect, useMemo, useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import proyectoService from 'services/proyectoService';
import clientService from 'services/clientService';
import usePerson from 'hooks/usePerson'; // ⬅️ agregado: para obtener empleados reales

const projectTypes = [
  { value: 'Instalación', label: 'Instalación' },
  { value: 'Mantenimiento Preventivo', label: 'Mantenimiento Preventivo' },
  { value: 'Mantenimiento Correctivo', label: 'Mantenimiento Correctivo' },
  { value: 'Inspección', label: 'Inspección' },
];

const departmentOptions = [
  { value: 'Ingeniería', label: 'Ingeniería' },
  { value: 'Mantenimiento', label: 'Mantenimiento' },
  { value: 'Operaciones', label: 'Operaciones' },
];

const priorityOptions = [
  { value: 'low', label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
  { value: 'urgent', label: 'Urgente' },
];

// Opcional: si ya tienes un catálogo real de personal, cámbialo aquí
const personnelOptions = [
  { value: 'Andrés Torres - Técnico HVAC', label: 'Andrés Torres - Técnico HVAC' },
  { value: 'Laura Gómez - Supervisora de Mantenimiento', label: 'Laura Gómez - Supervisora de Mantenimiento' },
  { value: 'Pedro Hernández - Ingeniero de Campo', label: 'Pedro Hernández - Ingeniero de Campo' },
];

const mapPriorityToEs = (v) => {
  const m = { low: 'Baja', medium: 'Media', high: 'Alta', urgent: 'Urgente' };
  return m[(v || '').toString().toLowerCase()] || v || '';
};

/* ===================== Helpers de números con comas ===================== */
// Formato visual con comas; decide decimales según sea entero o no.
const formatWithCommas = (v, decimals = 2) => {
  if (v === '' || v == null) return '';
  const num = Number(v);
  if (!Number.isFinite(num)) return '';
  const options = Number.isInteger(num)
    ? { minimumFractionDigits: 0, maximumFractionDigits: 0 }
    : { minimumFractionDigits: decimals, maximumFractionDigits: decimals };
  return num.toLocaleString('es-MX', options);
};

// Limpia un string con comas/símbolos → número JS
const unformatNumber = (raw) => {
  if (raw === '' || raw == null) return 0;
  const clean = String(raw).replace(/[^\d.-]/g, '');
  const n = parseFloat(clean);
  return Number.isFinite(n) ? n : 0;
};
/* ======================================================================= */

const CreateProjectModal = ({ isOpen, onClose, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // ⬇️ hook de personal
  const { persons, getPersons } = usePerson();

  // Estado del formulario (guardamos NÚMEROS en budgetBreakdown)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: '',
    client: '', // id del cliente
    department: '',
    priority: '',
    budgetBreakdown: {
      labor: 0,
      parts: 0,
      equipment: 0, // SIEMPRE almacenado en MXN
      materials: 0,
      transportation: 0,
      other: 0,
    },
    location: '',
    startDate: '',
    endDate: '',
    assignedPersonnel: [], // arreglo de strings "Nombre — Rol"
    description: '',
  });

  // === NUEVO: Control para USD en Equipos ===
  const [isEquipmentInUSD, setIsEquipmentInUSD] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(18); // MXN por 1 USD (editable)
  const [uiEquipmentUSD, setUiEquipmentUSD] = useState(''); // valor visual cuando está en USD

  // CLIENTES: reales → options { value, label }
  const [clientOptions, setClientOptions] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let mounted = true;
    (async () => {
      try {
        setLoadingClients(true);
        const resp = await clientService.getClients(); // {success, data:[...] }
        const list = Array.isArray(resp?.data) ? resp.data : [];
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

  // Cargar empleados al abrir
  useEffect(() => {
    if (!isOpen) return;
    getPersons().catch((e) => console.error('Error cargando empleados:', e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Construir opciones desde persons, deduplicadas
  const personnelOptionsFinal = useMemo(() => {
    if (!Array.isArray(persons) || persons.length === 0) {
      return personnelOptions; // fallback
    }
    const built = persons
      .map((p) => {
        const nombre =
          p?.nombreCompleto ||
          [p?.nombre, p?.apellidoPaterno, p?.apellidoMaterno].filter(Boolean).join(' ') ||
          p?.nombre ||
          p?.name ||
          '—';
        const puesto = p?.puesto || p?.rol || p?.cargo;
        const etiqueta = puesto ? `${nombre} — ${puesto}` : nombre;
        return etiqueta ? { value: etiqueta, label: etiqueta } : null;
      })
      .filter(Boolean);

    const seen = new Set();
    const dedup = [];
    for (const opt of built) {
      if (seen.has(opt.value)) continue;
      seen.add(opt.value);
      dedup.push(opt);
    }
    return dedup.length ? dedup : personnelOptions;
  }, [persons]);

  // Total presupuesto (siempre en MXN)
  const totalBudget = useMemo(() => {
    const b = formData.budgetBreakdown || {};
    const sum = ['labor','parts','equipment','materials','transportation','other']
      .map(k => Number(b[k] || 0))
      .reduce((a,b) => a + b, 0);
    return Number.isFinite(sum) ? sum : 0;
  }, [formData.budgetBreakdown]);

  const calculateTotalBudget = () => totalBudget;

  const handleInputChange = (key, value) => {
    setFormData((s) => ({ ...s, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  // ⬇️ Manejo genérico de partidas en MXN
  const handleBudgetChange = (key, rawValue) => {
    const cleanedNumber = unformatNumber(rawValue);
    // Si la clave es "equipment" y estamos en USD, convertir a MXN
    if (key === 'equipment' && isEquipmentInUSD) {
      const usd = cleanedNumber;
      setUiEquipmentUSD(rawValue); // conservar visual en USD
      const mxn = Number(usd) * Number(exchangeRate || 0);
      setFormData((s) => ({
        ...s,
        budgetBreakdown: { ...s.budgetBreakdown, equipment: mxn },
      }));
      return;
    }

    // Resto de claves o equipment en MXN normal
    setFormData((s) => ({
      ...s,
      budgetBreakdown: { ...s.budgetBreakdown, [key]: cleanedNumber },
    }));
  };

  // Cuando se activa/desactiva el modo USD para Equipos
  const toggleEquipmentUSD = (checked) => {
    setIsEquipmentInUSD(checked);
    if (checked) {
      // Pasamos el valor MXN actual a USD visual
      const currentMXN = Number(formData?.budgetBreakdown?.equipment || 0);
      const usd = exchangeRate ? currentMXN / Number(exchangeRate) : 0;
      setUiEquipmentUSD(usd ? formatWithCommas(usd, 2) : '');
    } else {
      // Al volver a MXN, copiamos el valor visual (si existiera) convirtiéndolo a MXN? No: ya guardamos MXN.
      // Solo limpiamos el visual USD
      setUiEquipmentUSD('');
    }
  };

  // Cambio del tipo de cambio: re-calcular MXN si estamos en USD
  const handleExchangeRateChange = (raw) => {
    const rate = unformatNumber(raw);
    setExchangeRate(rate);
    if (isEquipmentInUSD) {
      const usd = unformatNumber(uiEquipmentUSD);
      const mxn = usd * (rate || 0);
      setFormData((s) => ({
        ...s,
        budgetBreakdown: { ...s.budgetBreakdown, equipment: mxn },
      }));
    }
  };

  const validate = () => {
    const e = {};
    if (!formData.name) e.name = 'Requerido';
    if (!formData.type) e.type = 'Requerido';
    if (!formData.client) e.client = 'Seleccione un cliente';
    if (!formData.department) e.department = 'Requerido';
    if (!formData.priority) e.priority = 'Requerido';
    if (!formData.location) e.location = 'Requerido';
    if (!formData.startDate) e.startDate = 'Requerido';
    if (!formData.endDate) e.endDate = 'Requerido';
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      e.endDate = 'La fecha de fin no puede ser anterior al inicio';
    }
    // Validación adicional si está en USD y no hay tipo de cambio
    if (isEquipmentInUSD && !(exchangeRate > 0)) {
      e.exchangeRate = 'Indique un tipo de cambio válido';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildPayloadES = () => {
    // nombre del cliente desde options
    const clienteFound = clientOptions.find((o) => o.value === formData.client);
    const clienteNombre = clienteFound?.label || '';

    const manoObra = Number(formData?.budgetBreakdown?.labor || 0);
    const piezas = Number(formData?.budgetBreakdown?.parts || 0);
    const equipos = Number(formData?.budgetBreakdown?.equipment || 0); // MXN
    const materiales = Number(formData?.budgetBreakdown?.materials || 0);
    const transporte = Number(formData?.budgetBreakdown?.transportation || 0);
    const otros = Number(formData?.budgetBreakdown?.other || 0);
    const total = manoObra + piezas + equipos + materiales + transporte + otros;

    // (Opcional) Puedes incluir metadatos de cómo se capturó equipos
    const metaEquipos = isEquipmentInUSD
      ? { capturadoEn: 'USD', tipoCambio: Number(exchangeRate || 0), valorUSD: unformatNumber(uiEquipmentUSD) }
      : { capturadoEn: 'MXN' };

    return {
      codigo: formData.code || '',
      nombreProyecto: formData.name || '',
      tipoProyecto: formData.type || '',
      cliente: {
        id: formData.client || '',
        nombre: clienteNombre,
      },
      departamento: formData.department || '',
      prioridad: mapPriorityToEs(formData.priority),
      ubicacion: formData.location || '',
      descripcion: formData.description || '',
      personalAsignado: Array.isArray(formData.assignedPersonnel) ? formData.assignedPersonnel : [],
      cronograma: {
        fechaInicio: formData.startDate || '',
        fechaFin: formData.endDate || '',
      },
      presupuesto: {
        manoObra, piezas, equipos, materiales, transporte, otros, total,
        _metaEquipos: metaEquipos, // <- no rompe nada si tu backend lo ignora
      },
      totalPresupuesto: total,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const payload = buildPayloadES();
      await proyectoService.createProyecto(payload);
      onSubmit && onSubmit(payload);
      onClose && onClose();
    } catch (err) {
      console.error('Error creando proyecto:', err);
      alert('No se pudo crear el proyecto.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const b = formData.budgetBreakdown || {};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-1050 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Crear Nuevo Proyecto</h2>
            <p className="text-sm text-muted-foreground">Complete la información del proyecto</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
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

            <Select
              label="Tipo de Proyecto"
              options={projectTypes}
              value={formData?.type}
              onChange={(value) => handleInputChange('type', value)}
              error={errors?.type}
              required
            />

            <Select
              label="Cliente"
              options={clientOptions}
              value={formData?.client}
              onChange={(value) => handleInputChange('client', value)}
              error={errors?.client}
              searchable
              required
              loading={loadingClients}
            />

            <Select
              label="Departamento Responsable"
              options={departmentOptions}
              value={formData?.department}
              onChange={(value) => handleInputChange('department', value)}
              error={errors?.department}
              required
            />

            <Select
              label="Prioridad"
              options={priorityOptions}
              value={formData?.priority}
              onChange={(value) => handleInputChange('priority', value)}
              error={errors?.priority}
              required
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
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={formatWithCommas(b?.labor)}
              onChange={(e) => handleBudgetChange('labor', e?.target?.value)}
            />

            <Input
              label="Piezas (MXN)"
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={formatWithCommas(b?.parts)}
              onChange={(e) => handleBudgetChange('parts', e?.target?.value)}
            />

            {/* ====== Equipos con toggle USD ====== */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Equipos ({isEquipmentInUSD ? 'USD (se convierte a MXN)' : 'MXN'})
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isEquipmentInUSD}
                    onChange={(e) => toggleEquipmentUSD(e.target.checked)}
                    className="h-4 w-4 accent-primary cursor-pointer"
                  />
                  Precio en dólares
                </label>
              </div>

              {/* Input de Equipos: muestra USD o MXN según el toggle */}
              <input
                type="text"
                inputMode="decimal"
                placeholder={isEquipmentInUSD ? '0.00 USD' : '0.00 MXN'}
                value={
                  isEquipmentInUSD
                    ? uiEquipmentUSD
                    : formatWithCommas(b?.equipment)
                }
                onChange={(e) => handleBudgetChange('equipment', e?.target?.value)}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />

              {/* Tipo de cambio visible solo en modo USD */}
              {isEquipmentInUSD && (
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Input
                      label="Tipo de cambio (MXN / USD)"
                      type="text"
                      inputMode="decimal"
                      placeholder="Ej: 18.00"
                      value={formatWithCommas(exchangeRate, 4)}
                      onChange={(e) => handleExchangeRateChange(e?.target?.value)}
                      error={errors?.exchangeRate}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground whitespace-nowrap">
                    Guardado en MXN: <span className="font-semibold">${formatWithCommas(b?.equipment, 2)}</span>
                  </div>
                </div>
              )}
            </div>
            {/* ====== Fin Equipos ====== */}

            <Input
              label="Materiales (MXN)"
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={formatWithCommas(b?.materials)}
              onChange={(e) => handleBudgetChange('materials', e?.target?.value)}
            />

            <Input
              label="Transporte (MXN)"
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={formatWithCommas(b?.transportation)}
              onChange={(e) => handleBudgetChange('transportation', e?.target?.value)}
            />

            <Input
              label="Otros Gastos (MXN)"
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={formatWithCommas(b?.other)}
              onChange={(e) => handleBudgetChange('other', e?.target?.value)}
            />

            {/* Total */}
            <div className="md:col-span-2">
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">Total del Presupuesto (MXN):</span>
                  <span className="text-lg font-semibold text-primary">
                    ${formatWithCommas(calculateTotalBudget(), 2)} MXN
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
                options={personnelOptionsFinal}
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
            <Button type="submit" loading={isSubmitting} iconName="Plus" iconPosition="left">
              {isSubmitting ? 'Creando...' : 'Crear Proyecto'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
