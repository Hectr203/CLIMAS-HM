import React, { useEffect, useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import useAbono from '../../../hooks/useAbono';
import useProyecto from '../../../hooks/useProyect';

// Formatear monto en moneda MXN
const formatearMoneda = (cantidad) => {
  if (cantidad == null || isNaN(cantidad)) return '—';
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(cantidad) || 0);
};

// Limitar un valor dentro de un rango
const limitarRango = (valor, minimo, maximo) => Math.min(Math.max(valor, minimo), maximo);

// Convierte fecha a formato dd/mm/yyyy requerido por la API
const formatearFechaParaApi = (fechaLocalStr) => {
  if (!fechaLocalStr) return '';
  const d = new Date(fechaLocalStr);
  const rellenar = (n) => String(n).padStart(2, '0');
  return `${rellenar(d.getDate())}/${rellenar(d.getMonth() + 1)}/${d.getFullYear()}`;
};

// Convierte fecha ISO a formato compatible con input datetime-local
const deFechaALocalInput = (fecha) => {
  if (!fecha) return '';
  const d = new Date(fecha);
  const rellenar = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${rellenar(d.getMonth() + 1)}-${rellenar(d.getDate())}T${rellenar(d.getHours())}:${rellenar(d.getMinutes())}`;
};

const ModalRegistroAbono = ({ isOpen, onClose, project, currentPaid = 0, onSave }) => {
  const presupuestoProyecto = Number(project?.budget) || 0;
  const saldoInicial = Math.max(presupuestoProyecto - Number(currentPaid || 0), 0);

  // Hook de abonos
  const { createAbono, loading } = useAbono();
  
  // Hook para obtener información del proyecto
  const { getProyectoById } = useProyecto();

  // Campos requeridos
  const [idProyecto, setIdProyecto] = useState('');
  const [fechaLocal, setFechaLocal] = useState('');
  const [monto, setMonto] = useState('');
  const [metodoPago, setMetodoPago] = useState('Transferencia');
  const [descripcion, setDescripcion] = useState('');
  const [descripcionMetodo, setDescripcionMetodo] = useState('');
  const [notas, setNotas] = useState('');

  // Información del proyecto obtenida de la API
  const [infoProyecto, setInfoProyecto] = useState({ id: '', nombre: '', presupuesto: 0, clienteId: '' });
  const [totalAbonado, setTotalAbonado] = useState(0);

  // Variables auxiliares
  const [saldo, setSaldo] = useState(saldoInicial);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const id = project?.id || project?._id || project?.idProyecto || '';
      
      // Establecer el ID del proyecto
      setIdProyecto(id);

      // Obtener información del proyecto de la API si tenemos un ID
      if (id) {
        getProyectoById(id)
          .then((respuesta) => {
            const proyectoData = respuesta?.data || respuesta;
            if (proyectoData) {
            const presupuestoTotal = proyectoData.presupuesto?.total || proyectoData.totalPresupuesto || 0;
              const totalAbonadoData = proyectoData.resumenFinanciero?.totalAbonado || 0;
              
              setInfoProyecto({
                id: proyectoData.id || proyectoData._id || id,
                nombre: proyectoData.nombre || proyectoData.name || 'Sin nombre',
                presupuesto: Number(presupuestoTotal),
                clienteId: proyectoData.cliente?.id || proyectoData.clienteId || proyectoData.cliente_id || ''
              });
              
              // Establecer el total abonado desde la API
              setTotalAbonado(totalAbonadoData);
              
              // Actualizar saldo basado en presupuesto obtenido de la API
              const nuevoSaldo = Math.max(presupuestoTotal - totalAbonadoData, 0);
              setSaldo(nuevoSaldo);
            } else {
              // Fallback si no se obtienen datos
              setInfoProyecto({
                id,
                nombre: project?.name || project?.nombreProyecto || 'Sin nombre',
                presupuesto: presupuestoProyecto,
                clienteId: ''
              });
            }
          })
          .catch((err) => {
            console.warn('Error al obtener proyecto:', err);
            // Usar datos del prop como fallback
            setInfoProyecto({
              id,
              nombre: project?.name || project?.nombreProyecto || 'Sin nombre',
              presupuesto: presupuestoProyecto,
              clienteId: ''
            });
          });
      } else {
        setInfoProyecto({ id: '', nombre: 'Sin nombre', presupuesto: 0, clienteId: '' });
      }

      // Fecha actual por defecto
      const hoy = new Date();
      const yyyy = hoy.getFullYear();
      const mm = String(hoy.getMonth() + 1).padStart(2, '0');
      const dd = String(hoy.getDate()).padStart(2, '0');
      setFechaLocal(`${yyyy}-${mm}-${dd}`);

      setMonto('');
      setMetodoPago('Transferencia');
      setDescripcion('');
      setDescripcionMetodo('');
      setNotas('');

      setSaldo(Math.max(presupuestoProyecto - Number(currentPaid || 0), 0));
      setError('');
    }
  }, [isOpen, project, presupuestoProyecto, currentPaid, getProyectoById]);

  // Vista previa del total pagado
  const totalPagadoPrevio = useMemo(() => {
    const m = Number(monto) || 0;
    return Number(totalAbonado || 0) + (m > 0 ? m : 0);
  }, [monto, totalAbonado]);

  // Progreso del pago
  const progreso = useMemo(() => {
    if (!(infoProyecto?.presupuesto > 0)) return 0;
    const p = (Number(totalPagadoPrevio) / infoProyecto.presupuesto) * 100;
    return Math.round(limitarRango(p, 0, 100));
  }, [totalPagadoPrevio, infoProyecto?.presupuesto]);

  const manejarCambioMonto = (valor) => {
    const num = Number(valor);
    setMonto(valor);
    if (!isNaN(num)) {
      const nuevoSaldo = Math.max(infoProyecto.presupuesto - (Number(totalAbonado || 0) + Math.max(num, 0)), 0);
      setSaldo(nuevoSaldo);
    }
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setError('');
    const montoNum = Number(monto);

    if (!idProyecto?.trim()) {
      setError('El ID del proyecto es obligatorio.');
      return;
    }
    if (!fechaLocal) {
      setError('La fecha del abono es obligatoria.');
      return;
    }
    if (!(montoNum > 0)) {
      setError('El monto abonado debe ser mayor a 0.');
      return;
    }
    if (!descripcion?.trim()) {
      setError('La descripción es obligatoria.');
      return;
    }
    if (metodoPago === 'Otro' && !descripcionMetodo?.trim()) {
      setError('La descripción del método de pago es obligatoria cuando se selecciona "Otro".');
      return;
    }
    if (!['Efectivo', 'Transferencia', 'Tarjeta', 'Cheque', 'Otro'].includes(metodoPago)) {
      setError('Método de pago no válido.');
      return;
    }
    if ((Number(totalAbonado || 0) + montoNum) > infoProyecto.presupuesto) {
      setError('El total pagado excede el importe total del proyecto.');
      return;
    }

    const datos = {
      idProyecto: idProyecto.trim(),
      montoAbono: Number(monto),
      fecha: formatearFechaParaApi(fechaLocal),
      metodoPago,
      descripcion: descripcion.trim(),
      descripcionMetodo: metodoPago === 'Otro' ? descripcionMetodo.trim() : undefined,
      notas: notas?.trim() || undefined
    };

    try {
      const respuesta = await createAbono(datos);
      const creado = respuesta?.data || respuesta;

      if (creado) {
        onSave?.(creado);
        onClose?.();
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setError('Ya existe un abono con estos datos.');
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.message || 'Datos inválidos. Por favor revise los campos.');
      } else {
        setError('Error al guardar el abono. Por favor intente nuevamente.');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-lg shadow-xl w-1/3 mx-4 flex flex-col h-5/6">
        {/* Encabezado */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-card sticky top-0 z-10">
          <div className="flex items-center space-x-2">
            <Icon name="CreditCard" size={18} />
            <h3 className="text-lg font-semibold text-foreground">Apartado de Abonos</h3>
          </div>
          <button
            className="text-muted-foreground hover:text-foreground disabled:opacity-50"
            onClick={onClose}
            title="Cerrar"
            disabled={loading}
          >
            <Icon name="X" size={18} />
          </button>
        </div>

        {/* Contenido */}
        <div className="overflow-y-auto flex-1">
          <form onSubmit={manejarEnvio} className="p-4 space-y-6">
            {/* Resumen */}
            <div className="bg-muted/40 rounded p-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Proyecto</span>
                <span className="text-foreground font-medium block">
                  {infoProyecto?.nombre || '—'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Importe total</span>
                <span className="text-foreground font-medium block">{formatearMoneda(infoProyecto?.presupuesto || presupuestoProyecto)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Total pagado</span>
                <span className="text-foreground font-medium block">{formatearMoneda(totalAbonado)}</span>
              </div>
            </div>

            {/* Progreso */}
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Progreso de pago</span>
                <span>{isNaN(progreso) ? 0 : progreso}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="h-2 rounded-full bg-primary" style={{ width: `${isNaN(progreso) ? 0 : progreso}%` }} />
              </div>
            </div>

            {/* Campos principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fecha */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Fecha del abono</label>
                <input
                  type="date"
                  value={fechaLocal}
                  onChange={(e) => setFechaLocal(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                  disabled={loading}
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Formato: {fechaLocal ? formatearFechaParaApi(fechaLocal) : '—'}
                </p>
              </div>

              {/* Monto */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Monto abonado</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={monto}
                  onChange={(e) => manejarCambioMonto(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                  disabled={loading}
                />
              </div>

              {/* Saldo */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Saldo restante</label>
                <div className="flex h-10 items-center px-3 py-2 text-sm font-medium text-foreground bg-muted/30 rounded-md border border-input/50">
                  {formatearMoneda(saldo)}
                </div>
              </div>

              {/* Método de pago */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Método de pago</label>
                <select
                  value={metodoPago}
                  onChange={(e) => {
                    setMetodoPago(e.target.value);
                    if (e.target.value !== 'Otro') setDescripcionMetodo('');
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  disabled={loading}
                >
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Tarjeta">Tarjeta</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              {/* Descripción método (si es Otro) */}
              {metodoPago === 'Otro' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Descripción del método de pago
                  </label>
                  <input
                    type="text"
                    value={descripcionMetodo}
                    onChange={(e) => setDescripcionMetodo(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Especifique el método de pago"
                    required
                    disabled={loading}
                  />
                </div>
              )}

              {/* Descripción */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">Descripción</label>
                <textarea
                  rows={2}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Pago inicial del proyecto"
                  disabled={loading}
                />
              </div>

              {/* Notas */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">Notas</label>
                <textarea
                  rows={2}
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Pago realizado por el cliente"
                  disabled={loading}
                />
              </div>
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
              <Button type="submit" iconName="Check" iconPosition="left" disabled={loading}>
                {loading ? 'Guardando…' : 'Guardar'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalRegistroAbono;
