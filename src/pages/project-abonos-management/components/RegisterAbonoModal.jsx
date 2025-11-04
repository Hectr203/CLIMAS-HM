import React, { useEffect, useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const currencyFormat = (amount) => {
  if (amount == null || isNaN(amount)) return '—';
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(amount) || 0);
};

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

const RegisterAbonoModal = ({ isOpen, onClose, project, currentPaid = 0, onSave }) => {
  const projectBudget = Number(project?.budget) || 0;
  const initialSaldo = Math.max(projectBudget - Number(currentPaid || 0), 0);

  const [fecha, setFecha] = useState('');
  const [monto, setMonto] = useState('');
  const [saldo, setSaldo] = useState(initialSaldo);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFecha('');
      setMonto('');
      setSaldo(Math.max(projectBudget - Number(currentPaid || 0), 0));
      setError('');
    }
  }, [isOpen, projectBudget, currentPaid]);

  const totalPagadoPreview = useMemo(() => {
    const m = Number(monto) || 0;
    return Number(currentPaid || 0) + (m > 0 ? m : 0);
  }, [monto, currentPaid]);

  const progreso = useMemo(() => {
    if (!(projectBudget > 0)) return 0;
    const p = (Number(totalPagadoPreview) / projectBudget) * 100;
    return Math.round(clamp(p, 0, 100));
  }, [totalPagadoPreview, projectBudget]);

  const handleMontoChange = (value) => {
    const num = Number(value);
    setMonto(value);
    if (!isNaN(num)) {
      const nuevoSaldo = Math.max(projectBudget - (Number(currentPaid || 0) + Math.max(num, 0)), 0);
      setSaldo(nuevoSaldo);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const montoNum = Number(monto);
    if (!fecha) {
      setError('La fecha del abono es obligatoria');
      return;
    }
    if (!(montoNum > 0)) {
      setError('El monto abonado debe ser mayor a 0');
      return;
    }
    if ((Number(currentPaid || 0) + montoNum) > projectBudget) {
      setError('El total pagado excede el importe total del proyecto');
      return;
    }
    const payload = {
      projectId: project?.id || project?._id,
      fecha,
      monto: montoNum,
      saldoRestante: Math.max(projectBudget - (Number(currentPaid || 0) + montoNum), 0),
      totalPagadoNuevo: Number(currentPaid || 0) + montoNum,
      budget: projectBudget,
    };
    onSave?.(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-lg shadow-xl w-full max-w-lg mx-4">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="CreditCard" size={18} />
            <h3 className="text-lg font-semibold text-foreground">Registrar Abono</h3>
          </div>
          <button className="text-muted-foreground hover:text-foreground" onClick={onClose} title="Cerrar">
            <Icon name="X" size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Resumen */}
          <div className="bg-muted/40 rounded p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Proyecto</span>
              <span className="text-foreground font-medium">{project?.name || project?.nombreProyecto || '—'}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-muted-foreground">Importe total</span>
              <span className="text-foreground font-medium">{currencyFormat(projectBudget)}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-muted-foreground">Total pagado</span>
              <span className="text-foreground font-medium">{currencyFormat(currentPaid)}</span>
            </div>
          </div>

          {/* Progreso */}
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progreso de pago</span>
              <span>{progreso}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="h-2 rounded-full bg-primary" style={{ width: `${progreso}%` }} />
            </div>
          </div>

          {/* Formulario */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Fecha del abono</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Monto abonado</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={monto}
                onChange={(e) => handleMontoChange(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Saldo restante</label>
              <input
                type="text"
                value={currencyFormat(saldo)}
                readOnly
                className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-foreground"
              />
            </div>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" iconName="Check" iconPosition="left">Guardar</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterAbonoModal;


