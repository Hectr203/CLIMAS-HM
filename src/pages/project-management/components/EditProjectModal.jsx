import React, { useEffect, useMemo, useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import proyectoService from 'services/proyectoService';
import clientService from 'services/clientService';
import usePerson from 'hooks/usePerson';

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

// ---------- Utils ----------
const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

// Formatear con comas (2 decimales visibles en input)
const formatWithCommas = (v, decimals = 2) => {
  if (v == null || v === '') return '';
  const clean = String(v).replace(/[^\d.-]/g, '');
  const num = parseFloat(clean);
  if (isNaN(num)) return '';
  const options = Number.isInteger(num)
    ? { minimumFractionDigits: 0, maximumFractionDigits: 0 }
    : { minimumFractionDigits: decimals, maximumFractionDigits: decimals };
  return num.toLocaleString('es-MX', options);
};

// Remover comas/símbolos -> número
const unformatNumber = (v) => {
  if (v === '' || v === null || v === undefined) return 0;
  const clean = String(v).replace(/[^\d.-]/g, '');
  const n = parseFloat(clean);
  return isNaN(n) ? 0 : n;
};

const EditProjectModal = ({ isOpen, onClose, onSubmit, project }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [loadingProject, setLoadingProject] = useState(false);
  const [serverProject, setServerProject] = useState(null);

  // Personal real
  const { persons, getPersons } = usePerson();

  // Clientes reales
  const [clientOptions, setClientOptions] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);

  // === NUEVO: controles USD para Equipos ===
  const [isEquipmentInUSD, setIsEquipmentInUSD] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(18); // MXN por USD
  const [uiEquipmentUSD, setUiEquipmentUSD] = useState(''); // valor visual USD

  // 1) Traer clientes
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

  // 2) Traer proyecto por ID
  useEffect(() => {
    if (!isOpen || !project?.id) return;
    let mounted = true;
    (async () => {
      try {
        setLoadingProject(true);
        const resp = await proyectoService.getProyectoById(project.id);
        const doc = resp?.data && typeof resp.data === 'object' ? resp.data : resp;
        if (mounted) setServerProject(doc || null);
      } catch (e) {
        console.error('Error obteniendo proyecto por ID:', e);
        if (mounted) setServerProject(project || null);
      } finally {
        if (mounted) setLoadingProject(false);
      }
    })();
    return () => { mounted = false; };
  }, [isOpen, project?.id]);

  // 2.5) Cargar personal
  useEffect(() => {
    if (!isOpen) return;
    getPersons().catch((e) => console.error('Error cargando empleados:', e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // 3) Normalizador desde backend
  const normalizedFromDoc = useMemo(() => {
    const doc = serverProject || project || {};
    const p = doc.presupuesto || {};
    const b = doc.budgetBreakdown || {};

    const manoObra   = p.manoObra     ?? b.labor          ?? 0;
    const piezas     = p.piezas       ?? b.parts          ?? 0;
    const equipos    = p.equipos      ?? b.equipment      ?? 0; // almacenado en MXN
    const materiales = p.materiales   ?? b.materials      ?? 0;
    const transporte = p.transporte   ?? b.transportation ?? 0;
    const otros      = p.otros        ?? b.other          ?? 0;

    return {
      name: doc?.nombreProyecto ?? doc?.name ?? '',
      code: doc?.codigo ?? doc?.code ?? '',
      type: doc?.tipoProyecto ?? doc?.type ?? '',
      client: doc?.cliente?.id || '',
      department: doc?.departamento ?? doc?.department ?? '',
      priority: '',
      budgetBreakdown: {
        labor:          toNum(manoObra),
        parts:          toNum(piezas),
        equipment:      toNum(equipos), // MXN
        materials:      toNum(materiales),
        transportation: toNum(transporte),
        other:          toNum(otros),
      },
      location: doc?.ubicacion ?? doc?.location ?? '',
      startDate: doc?.cronograma?.fechaInicio ?? doc?.startDate ?? '',
      endDate:   doc?.cronograma?.fechaFin    ?? doc?.endDate   ?? '',
      assignedPersonnel: Array.isArray(doc?.personalAsignado)
        ? doc.personalAsignado
        : (doc?.assignedPersonnel || []),
      description: doc?.descripcion ?? doc?.description ?? '',
      _raw: doc,
    };
  }, [serverProject, project]);

  const [formData, setFormData] = useState(normalizedFromDoc);
  useEffect(() => {
    if (isOpen) setFormData(normalizedFromDoc);
  }, [normalizedFromDoc, isOpen]);

  // Inicializar UI USD si el backend trae meta de equipos
  useEffect(() => {
    if (!isOpen) return;
    const doc = (serverProject || project || {});
    const meta = doc?.presupuesto?._metaEquipos;
    if (meta?.capturadoEn === 'USD') {
      const rate = Number(meta?.tipoCambio) || exchangeRate || 18;
      setIsEquipmentInUSD(true);
      setExchangeRate(rate);
      const valUSD = Number(meta?.valorUSD) || 0;
      if (valUSD) setUiEquipmentUSD(formatWithCommas(valUSD, 2));
      else {
        // Si no viene valorUSD, lo calculamos desde MXN
        const mxn = Number(doc?.presupuesto?.equipos ?? doc?.budgetBreakdown?.equipment ?? 0);
        const usd = rate ? mxn / rate : 0;
        setUiEquipmentUSD(formatWithCommas(usd, 2));
      }
    } else {
      setIsEquipmentInUSD(false);
      setUiEquipmentUSD('');
      // Mantén exchangeRate como esté (quizá el usuario lo quiere setear)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, serverProject, project]);

  const handleInputChange = (key, value) => {
    setFormData((s) => ({ ...s, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  // Manejar partidas numéricas; para "equipment" considerar USD toggle
  const handleBudgetChange = (key, rawValueOrNumber) => {
    const cleaned = typeof rawValueOrNumber === 'number'
      ? rawValueOrNumber
      : unformatNumber(rawValueOrNumber);

    if (key === 'equipment' && isEquipmentInUSD) {
      // rawValue es USD; guardamos equipment en MXN
      setUiEquipmentUSD(typeof rawValueOrNumber === 'number'
        ? formatWithCommas(rawValueOrNumber, 2)
        : rawValueOrNumber);
      const mxn = cleaned * (Number(exchangeRate) || 0);
      setFormData((s) => ({
        ...s,
        budgetBreakdown: { ...s.budgetBreakdown, equipment: mxn },
      }));
      return;
    }

    setFormData((s) => ({
      ...s,
      budgetBreakdown: { ...s.budgetBreakdown, [key]: cleaned },
    }));
  };

  const toggleEquipmentUSD = (checked) => {
    setIsEquipmentInUSD(checked);
    if (checked) {
      // Pasar MXN actual a USD visual
      const currentMXN = Number(formData?.budgetBreakdown?.equipment || 0);
      const usd = (Number(exchangeRate) || 0) ? currentMXN / Number(exchangeRate) : 0;
      setUiEquipmentUSD(usd ? formatWithCommas(usd, 2) : '');
    } else {
      setUiEquipmentUSD('');
      // Estado ya guarda MXN, no hay que convertir nada
    }
  };

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
    if (!formData.department) e.department = 'Requerido';
    if (!formData.location) e.location = 'Requerido';
    if (!formData.startDate) e.startDate = 'Requerido';
    if (!formData.endDate) e.endDate = 'Requerido';
    if (formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      e.endDate = 'La fecha de fin no puede ser anterior al inicio';
    }
    if (isEquipmentInUSD && !(exchangeRate > 0)) {
      e.exchangeRate = 'Indique un tipo de cambio válido';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Opciones de personal
  const personnelOptionsFinal = useMemo(() => {
    const existingAssigned = Array.isArray(serverProject?.personalAsignado)
      ? serverProject.personalAsignado
      : Array.isArray(project?.personalAsignado)
        ? project.personalAsignado
        : [];

    const fromPersons = Array.isArray(persons)
      ? persons
          .map((p) => {
            const nombre =
              p?.nombreCompleto ||
              [p?.nombre, p?.apellidoPaterno, p?.apellidoMaterno].filter(Boolean).join(' ') ||
              p?.nombre ||
              p?.name ||
              '—';
            const puesto = p?.puesto || p?.rol || p?.cargo;
            const etiqueta = puesto ? `${nombre} — ${puesto}` : nombre;
            return etiqueta || null;
          })
          .filter(Boolean)
      : [];

    const merged = [...existingAssigned, ...fromPersons];
    const seen = new Set();
    const dedupStrings = merged.filter((s) => {
      if (seen.has(s)) return false;
      seen.add(s);
      return true;
    });

    return dedupStrings.map((s) => ({ value: s, label: s }));
  }, [persons, serverProject, project]);

  // 4) Payload ES
  const buildPayloadES = () => {
    const base = formData?._raw || serverProject || project || {};

    const selectedClient = clientOptions.find((o) => o.value === formData.client);
    const clienteId = formData.client || base?.cliente?.id || '';
    const clienteNombre = selectedClient?.label || base?.cliente?.nombre || '';

    const manoObra   = Number(formData?.budgetBreakdown?.labor) || 0;
    const piezas     = Number(formData?.budgetBreakdown?.parts) || 0;
    const equipos    = Number(formData?.budgetBreakdown?.equipment) || 0; // MXN
    const materiales = Number(formData?.budgetBreakdown?.materials) || 0;
    const transporte = Number(formData?.budgetBreakdown?.transportation) || 0;
    const otros      = Number(formData?.budgetBreakdown?.other) || 0;
    const total      = manoObra + piezas + equipos + materiales + transporte + otros;

    const metaEquipos = isEquipmentInUSD
      ? { capturadoEn: 'USD', tipoCambio: Number(exchangeRate || 0), valorUSD: unformatNumber(uiEquipmentUSD) }
      : (base?.presupuesto?._metaEquipos ?? { capturadoEn: 'MXN' });

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
      presupuesto: { manoObra, piezas, equipos, materiales, transporte, otros, total, _metaEquipos: metaEquipos },
      totalPresupuesto: total,
      createdAt: base?.createdAt,
      updatedAt: new Date().toISOString(),
      id: base?.id,
    };
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const payload = buildPayloadES();
      await proyectoService.updateProyecto((serverProject || project)?.id, payload);
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

  const b = formData.budgetBreakdown || {};
  const totalCalc =
    (Number(b.labor) || 0) +
    (Number(b.parts) || 0) +
    (Number(b.equipment) || 0) +
    (Number(b.materials) || 0) +
    (Number(b.transportation) || 0) +
    (Number(b.other) || 0);

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

            {/* Mano de obra */}
            <Input
              label="Mano de Obra (MXN)"
              type="text"
              placeholder="0.00"
              value={formatWithCommas(formData?.budgetBreakdown?.labor)}
              onChange={(e) => handleBudgetChange('labor', e?.target?.value)}
              inputMode="decimal"
            />

            {/* Piezas */}
            <Input
              label="Piezas (MXN)"
              type="text"
              placeholder="0.00"
              value={formatWithCommas(formData?.budgetBreakdown?.parts)}
              onChange={(e) => handleBudgetChange('parts', e?.target?.value)}
              inputMode="decimal"
            />

            {/* ===== Equipos con toggle USD ===== */}
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

              <input
                type="text"
                inputMode="decimal"
                placeholder={isEquipmentInUSD ? '0.00 USD' : '0.00 MXN'}
                value={
                  isEquipmentInUSD
                    ? uiEquipmentUSD
                    : formatWithCommas(formData?.budgetBreakdown?.equipment)
                }
                onChange={(e) => handleBudgetChange('equipment', e?.target?.value)}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />

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
                    Guardado en MXN: <span className="font-semibold">${formatWithCommas(formData?.budgetBreakdown?.equipment, 2)}</span>
                  </div>
                </div>
              )}
            </div>
            {/* ===== Fin Equipos ===== */}

            {/* Materiales */}
            <Input
              label="Materiales (MXN)"
              type="text"
              placeholder="0.00"
              value={formatWithCommas(formData?.budgetBreakdown?.materials)}
              onChange={(e) => handleBudgetChange('materials', e?.target?.value)}
              inputMode="decimal"
            />

            {/* Transporte */}
            <Input
              label="Transporte (MXN)"
              type="text"
              placeholder="0.00"
              value={formatWithCommas(formData?.budgetBreakdown?.transportation)}
              onChange={(e) => handleBudgetChange('transportation', e?.target?.value)}
              inputMode="decimal"
            />

            {/* Otros */}
            <Input
              label="Otros Gastos (MXN)"
              type="text"
              placeholder="0.00"
              value={formatWithCommas(formData?.budgetBreakdown?.other)}
              onChange={(e) => handleBudgetChange('other', e?.target?.value)}
              inputMode="decimal"
            />

            {/* Total del Presupuesto */}
            <div className="md:col-span-2">
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">
                    Total del Presupuesto (MXN):
                  </span>
                  <span className="text-lg font-semibold text-primary">
                    {`$${(Number(formData?.budgetBreakdown?.labor || 0)
                      + Number(formData?.budgetBreakdown?.parts || 0)
                      + Number(formData?.budgetBreakdown?.equipment || 0)
                      + Number(formData?.budgetBreakdown?.materials || 0)
                      + Number(formData?.budgetBreakdown?.transportation || 0)
                      + Number(formData?.budgetBreakdown?.other || 0))
                      .toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`}
                  </span>
                </div>
                {/* Si quieres ver equivalente del total en USD cuando el toggle está activo */}
                {isEquipmentInUSD && exchangeRate > 0 && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    Equivalente aproximado del total en USD (solo equipos convertidos):{' '}
                    <span className="font-medium">
                      ${(
                        (Number(formData?.budgetBreakdown?.labor || 0)
                        + Number(formData?.budgetBreakdown?.parts || 0)
                        + Number(formData?.budgetBreakdown?.materials || 0)
                        + Number(formData?.budgetBreakdown?.transportation || 0)
                        + Number(formData?.budgetBreakdown?.other || 0)) / (exchangeRate || 1)
                        + unformatNumber(uiEquipmentUSD || 0) // equipos ya está en USD visual
                      ).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Ubicación */}
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
