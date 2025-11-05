import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import proyectoService from 'services/proyectoService';
import clientService from 'services/clientService';
import usePerson from 'hooks/usePerson';

// ⬇️ Ajusta esta ruta según tu proyecto
import { useErrorHandler, useNotifications } from 'context/NotificationContext';

/* === Catálogos === */
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

const projectStatusOptions = [
  { value: 'Planificación', label: 'Planificación' },
  { value: 'En Progreso', label: 'En Progreso' },
  { value: 'En Pausa', label: 'En Pausa' },
  { value: 'En Revisión', label: 'En Revisión' },
  { value: 'Completado', label: 'Completado' },
  { value: 'Cancelado', label: 'Cancelado' },
];

const personnelOptionsFallback = [
  { value: 'Andrés Torres — Técnico HVAC', label: 'Andrés Torres — Técnico HVAC' },
  { value: 'Laura Gómez — Supervisora de Mantenimiento', label: 'Laura Gómez — Supervisora de Mantenimiento' },
  { value: 'Pedro Hernández — Ingeniero de Campo', label: 'Pedro Hernández — Ingeniero de Campo' },
];

const mapPriorityToEs = (v) => {
  const m = { low: 'Baja', medium: 'Media', high: 'Alta', urgent: 'Urgente' };
  return m[(v || '').toString().toLowerCase()] || v || '';
};

/* ===================== Helpers ===================== */
const formatWithCommas = (v, decimals = 2) => {
  if (v === '' || v == null) return '';
  const num = Number(v);
  if (!Number.isFinite(num)) return '';
  const options = Number.isInteger(num)
    ? { minimumFractionDigits: 0, maximumFractionDigits: 0 }
    : { minimumFractionDigits: decimals, maximumFractionDigits: decimals };
  return num.toLocaleString('es-MX', options);
};
const unformatNumber = (raw) => {
  if (raw === '' || raw == null) return 0;
  const clean = String(raw).replace(/[^\d.-]/g, '');
  const n = parseFloat(clean);
  return Number.isFinite(n) ? n : 0;
};
const rateSafe = (rate) => (Number.isFinite(Number(rate)) ? Number(rate) : 0);
/* =================================================== */

const CreateProjectModal = ({ isOpen, onClose, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const { persons, getPersons } = usePerson();

  // Notificaciones
  const { handleError, handleSuccess } = useErrorHandler();
  const { showWarning, showError } = useNotifications();

  // Estado del formulario
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: '',
    client: '',
    department: '',
    priority: '',
    status: '',
    budgetBreakdown: {
      labor: 0,
      parts: 0,
      equipment: 0, // siempre guardado en MXN
      materials: 0,
      transportation: 0,
      other: 0,
    },
    location: '',
    startDate: '',
    endDate: '',
    assignedPersonnel: [],
    description: '',
  });

  // === Moneda / FX ===
  const [isEquipmentInUSD, setIsEquipmentInUSD] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(18); // MXN por USD
  const [uiEquipmentUSD, setUiEquipmentUSD] = useState(''); // SOLO display (read-only)
  const [loadingFx, setLoadingFx] = useState(false);
  const [fxError, setFxError] = useState(null);

  // === Clientes ===
  const [clientOptions, setClientOptions] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);

  // Clientes (una vez por apertura)
  useEffect(() => {
    if (!isOpen) return;
    let mounted = true;
    (async () => {
      try {
        setLoadingClients(true);
        const resp = await clientService.getClients();
        const list = Array.isArray(resp?.data) ? resp.data : (Array.isArray(resp) ? resp : []);
        const opts = list.map((c) => ({ value: c.id, label: c.empresa || c.contacto || '—' }));
        if (mounted) setClientOptions(opts);
      } catch (e) {
        handleError(e, 'Error cargando clientes');
      } finally {
        if (mounted) setLoadingClients(false);
      }
    })();
    return () => { mounted = false; };
  }, [isOpen, handleError]);

  // Personas (una vez por apertura). ⚠️ No reseteamos la bandera en cleanup para evitar bucle.
  const fetchedPersonsRef = useRef(false);
  useEffect(() => {
    if (!isOpen) return;
    if (fetchedPersonsRef.current) return;
    fetchedPersonsRef.current = true;

    const controller = new AbortController();
    (async () => {
      try {
        await getPersons({ signal: controller.signal });
      } catch (e) {
        if (e?.name !== 'AbortError') handleError(e, 'Error cargando empleados');
      }
    })();

    return () => {
      controller.abort();
      // ❌ NO: fetchedPersonsRef.current = false;
    };
    // Intencionalmente no metemos getPersons a deps para no dispararlo por cambios de referencia
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, handleError]);

  // Opciones de personal
  const personnelOptionsFinal = useMemo(() => {
    if (!Array.isArray(persons) || persons.length === 0) return personnelOptionsFallback;
    const built = persons.map((p) => {
      const nombre =
        p?.nombreCompleto ||
        [p?.nombre, p?.apellidoPaterno, p?.apellidoMaterno].filter(Boolean).join(' ') ||
        p?.nombre || p?.name || '—';
      const puesto = p?.puesto || p?.rol || p?.cargo;
      const etiqueta = puesto ? `${nombre} — ${puesto}` : nombre;
      return etiqueta ? { value: etiqueta, label: etiqueta } : null;
    }).filter(Boolean);

    const seen = new Set(); const dedup = [];
    for (const opt of built) { if (seen.has(opt.value)) continue; seen.add(opt.value); dedup.push(opt); }
    return dedup.length ? dedup : personnelOptionsFallback;
  }, [persons]);

  const handleInputChange = (key, value) => {
    setFormData((s) => ({ ...s, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  /** 🔁 Cuando está en USD, el USD mostrado se calcula SIEMPRE desde MXN/rate */
  useEffect(() => {
    if (!isEquipmentInUSD) return;
    const mxn = Number(formData?.budgetBreakdown?.equipment || 0);
    const rate = rateSafe(exchangeRate);
    const usd = rate ? mxn / rate : 0;
    setUiEquipmentUSD(usd ? formatWithCommas(usd, 2) : '0.00');
  }, [isEquipmentInUSD, exchangeRate, formData?.budgetBreakdown?.equipment]);

  const handleBudgetChange = (key, rawValue) => {
    const cleanedNumber = unformatNumber(rawValue);
    // Si está en USD, NO permitimos editar equipment (solo display)
    if (key === 'equipment' && isEquipmentInUSD) return;
    setFormData((s) => ({
      ...s,
      budgetBreakdown: { ...s.budgetBreakdown, [key]: cleanedNumber },
    }));
  };

  // === FX: usar el método existente getCurrencyRates
  const fetchUsdMxnRate = useCallback(async () => {
    try {
      setFxError(null);
      setLoadingFx(true);

      // Esperado: { data: { MXN: { code:'MXN', value: 18.2 } } }
      const resp = await proyectoService.getCurrencyRates({ base: 'USD', currencies: ['MXN'] });
      const mxnInfo = resp?.data?.MXN || resp?.MXN; // tolerante si devuelven directo
      const rate = Number(mxnInfo?.value ?? mxnInfo ?? 0);

      if (rate > 0) {
        setExchangeRate(rate);
        return rate;
      } else {
        const msg = 'No llegó una tasa válida.';
        setFxError(msg);
        showError(msg);
        return null;
      }
    } catch (e) {
      const msg = e?.message || 'Error llamando currencyapi';
      setFxError(msg);
      handleError(e, 'Tipo de cambio');
      return null;
    } finally {
      setLoadingFx(false);
    }
  }, [handleError, showError]);

  // Pre-cargar tasa al abrir
  useEffect(() => {
    if (!isOpen) return;
    fetchUsdMxnRate();
  }, [isOpen, fetchUsdMxnRate]);

  const toggleEquipmentUSD = async (checked) => {
    setIsEquipmentInUSD(checked);
    if (checked) {
      await fetchUsdMxnRate(); // el useEffect recalcula el USD mostrado
    } else {
      setUiEquipmentUSD('');
    }
  };

  const validate = () => {
    const e = {};
    if (!formData.name) e.name = 'Requerido';
    if (!formData.type) e.type = 'Requerido';
    if (!formData.client) e.client = 'Seleccione un cliente';
    if (!formData.department) e.department = 'Requerido';
    if (!formData.priority) e.priority = 'Requerido';
    if (!formData.status) e.status = 'Requerido';
    if (!formData.location) e.location = 'Requerido';
    if (!formData.startDate) e.startDate = 'Requerido';
    if (!formData.endDate) e.endDate = 'Requerido';
    if (formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      e.endDate = 'La fecha de fin no puede ser anterior al inicio';
    }
    if (isEquipmentInUSD && !(exchangeRate > 0)) e.exchangeRate = 'Indique un tipo de cambio válido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildPayloadForBackend = () => {
    const b = formData.budgetBreakdown || {};
    const equipoDolares = isEquipmentInUSD
      ? unformatNumber(uiEquipmentUSD) // aunque sea read-only, lo mandamos como referencia
      : undefined;

    return {
      codigo: formData.code || '',
      nombre: formData.name || '',
      tipoProyecto: formData.type || '',
      cliente: { id: formData.client || '', nombre: formData.clientName || '' },
      departamento: formData.department || '',
      prioridad: mapPriorityToEs(formData.priority),
      ubicacion: formData.location || '',
      descripcion: formData.description || '',
      personalAsignado: Array.isArray(formData.assignedPersonnel) ? formData.assignedPersonnel : [],
      cronograma: { fechaInicio: formData.startDate || '', fechaFin: formData.endDate || '' },
      presupuesto: {
        manoObra: Number(b.labor) || 0,
        piezas: Number(b.parts) || 0,
        equipos: Number(b.equipment) || 0, // siempre MXN
        ...(equipoDolares !== undefined ? { equipoDolares } : {}),
        materiales: Number(b.materials) || 0,
        transporte: Number(b.transportation) || 0,
        otros: Number(b.other) || 0,
        _metaEquipos: { capturadoEn: isEquipmentInUSD ? 'USD' : 'MXN' },
      },
      estado: formData.status,
    };
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validate()) {
      showWarning('Revisa los campos requeridos del formulario.');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = buildPayloadForBackend();
      await proyectoService.createProyecto(payload);

      // ✅ Notificación de éxito
      handleSuccess('create', 'Proyecto');

      onSubmit && onSubmit(payload);
      onClose && onClose();
    } catch (err) {
      console.error('Error creando proyecto:', err);
      handleError(err, 'Error creando proyecto');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const b = formData.budgetBreakdown || {};
  const totalMXN =
    (Number(b?.labor) || 0) +
    (Number(b?.parts) || 0) +
    (Number(b?.equipment) || 0) +
    (Number(b?.materials) || 0) +
    (Number(b?.transportation) || 0) +
    (Number(b?.other) || 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-1050 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-height-[90vh] max-h-[90vh] overflow-y-auto">
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
              placeholder="Ej: PROJ-2025-001"
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

            <Select
              label="Estado del Proyecto"
              options={projectStatusOptions}
              value={formData?.status}
              onChange={(value) => handleInputChange('status', value)}
              error={errors?.status}
              required
            />

            <Input
              label="Ubicación"
              type="text"
              placeholder="Ej: Ciudad de México, CDMX"
              value={formData?.location}
              onChange={(e) => handleInputChange('location', e?.target?.value)}
              error={errors?.location}
              required
            />

            {/* Presupuesto */}
            <div className="md:col-span-2 mt-6">
              <h3 className="text-lg font-medium text-foreground mb-4">Desglose de Presupuesto</h3>
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

            {/* Equipos con USD */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  {isEquipmentInUSD ? 'Equipos (USD se convierte a MXN)' : 'Equipos (MXN)'}
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

              {/* Campo Equipos */}
              <input
                type="text"
                inputMode="decimal"
                placeholder={isEquipmentInUSD ? '0.00 USD' : '0.00 MXN'}
                value={isEquipmentInUSD ? uiEquipmentUSD : formatWithCommas(b?.equipment)}
                onChange={(e) => handleBudgetChange('equipment', e?.target?.value)}
                readOnly={isEquipmentInUSD}
                className={`w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${isEquipmentInUSD ? 'bg-muted cursor-not-allowed' : ''}`}
              />

              {isEquipmentInUSD && (
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex-1 min-w-[220px]">
                    <Input
                      label="Tipo de cambio (MXN / USD)"
                      type="text"
                      inputMode="decimal"
                      value={formatWithCommas(exchangeRate, 4)}
                      onChange={() => {}}
                      readOnly
                      disabled
                    />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={fetchUsdMxnRate}
                    loading={loadingFx}
                    iconName="RefreshCcw"
                    iconPosition="left"
                  >
                    {loadingFx ? 'Actualizando…' : 'Actualizar tipo de cambio'}
                  </Button>

                  <div className="text-sm text-muted-foreground whitespace-nowrap">
                    Guardado en MXN:{' '}
                    <span className="font-semibold">
                      ${formatWithCommas(b?.equipment, 2)}
                    </span>
                  </div>

                  {fxError && <div className="text-xs text-destructive">{fxError}</div>}
                </div>
              )}
            </div>

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
                    ${formatWithCommas(totalMXN, 2)} MXN
                  </span>
                </div>
              </div>
            </div>

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
              <label className="block text-sm font-medium text-foreground mb-2">Descripción del Proyecto</label>
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
