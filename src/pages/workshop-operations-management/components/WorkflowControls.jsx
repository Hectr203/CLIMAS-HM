import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import requisiService from '../../../services/requisiService';
import useGastos from '../../../hooks/useGastos';

        

  const WorkflowControls = ({ selectedOrder, currentShift, totalOrders, workOrdersIds = [], workOrders = [], onForceRemove, onRevertStatus, localMissingByOrder = {} }) => {
          const isWorkingHours = currentShift === 'morning';
    const { getGastos } = useGastos();
          const selectedMissingPPE = Array.isArray(selectedOrder?.safetyChecklistMissing)
            ? selectedOrder.safetyChecklistMissing
            : (Array.isArray(selectedOrder?.raw?.safetyChecklistMissing) ? selectedOrder.raw.safetyChecklistMissing : []);
          const resolvePriority = () => {
            if (!selectedOrder) return '';
            // direct values
            const direct = selectedOrder?.prioridadLabel || selectedOrder?.prioridad || selectedOrder?.priorityValue || selectedOrder?.raw?.prioridad || selectedOrder?.raw?.priority || '';
            if (direct) return direct;

            // try matching related records in provided workOrders prop
            try {
              const candidates = [];
              // possible keys on selectedOrder/raw: id, ordenTrabajo, trabajoId
              if (selectedOrder?.id) candidates.push(String(selectedOrder.id));
              if (selectedOrder?.ordenTrabajo) candidates.push(String(selectedOrder.ordenTrabajo));
              if (selectedOrder?.raw?.trabajoId) candidates.push(String(selectedOrder.raw.trabajoId));
              if (selectedOrder?.raw?.id) candidates.push(String(selectedOrder.raw.id));

              for (const w of (workOrders || [])) {
                if (!w) continue;
                const keys = [w?.id, w?.ordenTrabajo, w?.trabajoId, (w?.raw && w.raw?.trabajoId), (w?.raw && w.raw?.id)].filter(Boolean).map(String);
                if (keys.some(k => candidates.includes(k))) {
                  const p = w?.prioridad || w?.prioridadLabel || w?.priority || w?.priorityLabel || (w?.raw && (w.raw.prioridad || w.raw.priority)) || '';
                  if (p) return p;
                }
              }
            } catch (e) {
              // ignore
            }

            // last resort: use estado if it looks like a priority
            try {
              const estado = (selectedOrder?.raw?.estado || selectedOrder?.raw?.status || selectedOrder?.estado || selectedOrder?.status || '').toString();
              if (estado) {
                const low = estado.toLowerCase();
                if (['alta','high','urgent','urgente','crítica','critica','media','baja','low'].some(s => low.includes(s))) return selectedOrder?.raw?.estado || estado;
              }
            } catch (e) {}

            return '';
          };

          // helpers moved into component scope to avoid returning objects into JSX
          const formatProgress = (p) => {
            if (p === null || p === undefined || p === '') return '0%';
            // Normalize into a numeric value removing non-numeric characters except dot and minus
            const normalizeToNumber = (val) => {
              if (typeof val === 'number') return val;
              if (typeof val !== 'string') return NaN;
              const s = val.trim();
              // if contains percent sign, strip it but keep decimal
              const cleaned = s.replace(/[^0-9.+-]/g, '');
              const n = Number(cleaned);
              return Number.isFinite(n) ? n : NaN;
            };

            const num = normalizeToNumber(p);
            if (Number.isNaN(num)) return String(p);

            let percent = num;
            // If it's clearly a fraction (0 < num <= 1) treat as fraction
            if (percent > 0 && percent <= 1) {
              percent = percent * 100;
            } else if (percent > 100) {
              // If it's an unexpectedly large number (e.g. 1500) try dividing by 100 (common scale issues)
              const maybe = percent / 100;
              if (maybe > 0 && maybe <= 100) percent = maybe;
              // otherwise leave as-is (will be rounded)
            }
            if (percent < 0) percent = 0;
            if (percent > 100) percent = 100;

            return `${Math.round(percent)}%`;
          };

          const formatDate = (v) => {
            if (!v && v !== 0) return '';
            try {
              // If value is a plain YYYY-MM-DD string, construct a local Date to avoid timezone shifts
              if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) {
                const [y, m, d] = v.split('-').map(Number);
                const dt = new Date(y, m - 1, d); // local date
                return dt.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
              }
              const d = (v instanceof Date) ? v : new Date(v);
              if (Number.isNaN(d.getTime())) return String(v);
              return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
            } catch (e) {
              return String(v);
            }
          };

          // Generate a PDF report for the selected order.
          const extractApprovedFromArray = (arr) => {
            if (!Array.isArray(arr)) return [];
            return arr
              .filter(item => {
                if (!item) return false;
                const s = String(item?.status || item?.estado || item?.approved || item?.aprobado || '').toLowerCase();
                if (s.includes('aprob')) return true;
                if (item?.approved === true) return true;
                if (item?.approvedAt || item?.approvedBy) return true;
                return false;
              })
              .map(it => ({
                name: it?.name || it?.nombre || it?.item || it?.producto || 'Material',
                required: Number(it?.required ?? it?.cantidad ?? it?.total ?? it?.qty ?? 0) || 0,
                received: Number(it?.received ?? it?.recibido ?? it?.have ?? 0) || 0,
                raw: it
              }));
          };

          // async because we may fetch requisitions as a fallback source for approved materials
          const generateReport = async () => {
            if (!selectedOrder) return;

            // Normalization helpers (shared with MaterialReceptionPanel) to improve matching
            const normalizeKey = (v) => String(v || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const onlyDigits = (v) => (String(v || '').match(/\d+/g) || []).join('');

            // Helper: try to determine daily progress delta from multiple possible aliases.
            const computeDailyProgressDelta = () => {
              try {
                const raw = selectedOrder?.raw || {};
                const todayKey = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
                const today = todayKey(new Date());

                // possible history aliases
                const candidates = raw.progressHistory || raw.progress_logs || raw.updates || raw.progressUpdates || raw.progreso_historial || raw.history || raw.progress_log || null;
                if (Array.isArray(candidates) && candidates.length) {
                  // normalize entries to {date, value}
                  const entries = candidates.map(e => {
                    if (typeof e === 'number') return { date: today, value: Number(e) };
                    if (typeof e === 'string') {
                      // try parse `YYYY-MM-DD:value` or `YYYY-MM-DD` formats
                      const m = e.match(/(\d{4}-\d{2}-\d{2}).*?([0-9+.\-%]+)/);
                      if (m) return { date: m[1], value: Number(String(m[2]).replace('%','')) };
                      return { date: today, value: Number(e.replace(/[^0-9.+-]/g,'')) };
                    }
                    // assume object with date/value
                    return { date: (e.date || e.fecha || e.d) || today, value: Number(e.value ?? e.progreso ?? e.progress ?? e.porcentaje ?? 0) };
                  });

                  const todays = entries.filter(en => String(en.date).startsWith(today));
                  if (todays.length >= 2) {
                    const first = todays[0].value;
                    const last = todays[todays.length-1].value;
                    return Math.round((last - first) * 100) / 100;
                  }
                  if (todays.length === 1) {
                    // try to find the most recent previous entry
                    const before = entries.filter(en => !String(en.date).startsWith(today)).sort((a,b)=> new Date(a.date)-new Date(b.date)).pop();
                    if (before) return Math.round(((todays[0].value || 0) - (before.value || 0)) * 100) / 100;
                    return Math.round((todays[0].value || 0) * 100) / 100;
                  }
                }

                // fallback: try comparing selectedOrder.progress with selectedOrder.raw?.previousProgress or selectedOrder?.previousProgress
                const cur = Number(selectedOrder?.progress ?? selectedOrder?.estadoProgreso ?? selectedOrder?.progreso ?? 0);
                const prev = Number(selectedOrder?.raw?.previousProgress ?? selectedOrder?.previousProgress ?? 0);
                if (!Number.isNaN(cur) && !Number.isNaN(prev)) return Math.round((cur - prev) * 100) / 100;
                return null;
              } catch (e) {
                return null;
              }
            };

            // Helper: build materials rows
            const buildMaterials = () => {
              const raw = selectedOrder?.materials || selectedOrder?.raw?.materials || selectedOrder?.raw?.materiales || null;
              if (!raw) return [];
              // If array of items
              if (Array.isArray(raw)) {
                return raw.map(it => {
                  const name = it?.name || it?.nombre || it?.item || '';
                  const required = Number(it?.required ?? it?.cantidad ?? it?.total ?? 0);
                  const received = Number(it?.received ?? it?.recibido ?? it?.have ?? 0);
                  const missing = Math.max(0, required - received);
                  return { name, required, received, missing };
                });
              }

              // If object with totals
              const total = Number(raw?.total ?? raw?.required ?? raw?.cantidad ?? 0);
              const received = Number(raw?.received ?? raw?.recibido ?? raw?.have ?? 0);
              const missing = Math.max(0, total - received);
              return [{ name: raw?.name || raw?.nombre || 'Materiales', required: total, received, missing }];
            };

            const doc = new jsPDF({ unit: 'pt', format: 'a4' });
            const margin = 40;
            const title = `Reporte - Orden ${selectedOrder?.ordenTrabajo || selectedOrder?.id || ''}`;
            doc.setFontSize(14);
            doc.text(title, margin, 50);
            doc.setFontSize(10);
            const now = new Date();
            doc.text(`Generado: ${now.toLocaleString()}`, margin, 68);

            // main key/value table
            const rows = [];
            rows.push(['Orden Trabajo', String(selectedOrder?.ordenTrabajo || selectedOrder?.id || '')]);
            rows.push(['Cliente', String(selectedOrder?.clientName || selectedOrder?.clientLabel || (selectedOrder?.cliente && (selectedOrder.cliente.nombre || selectedOrder.cliente)) || '')]);
              rows.push(['Progreso', formatProgress(selectedOrder?.progress ?? selectedOrder?.progreso ?? selectedOrder?.estadoProgreso ?? 0)]);
              rows.push(['Prioridad', String(resolvePriority() || selectedOrder?.raw?.prioridad || selectedOrder?.raw?.estado || selectedOrder?.estado || '')]);
              const rawDate = selectedOrder?.fechaLimite || selectedOrder?.estimatedCompletion || selectedOrder?.proyectoFecha || selectedOrder?.raw?.fechaLimite || selectedOrder?.raw?.fecha || selectedOrder?.raw?.estimatedCompletion || selectedOrder?.raw?.fechaEstimada || '';
              const fechaVal = (() => {
                try { const f = formatDate(rawDate); return f && f.length ? f : '-'; } catch (e) { return '-'; }
              })();
              rows.push(['Fecha límite', String(fechaVal)]);
            const techs = (() => {
              const fromSelected = (selectedOrder?.assignedTechnicians || selectedOrder?.tecnicoAsignado || selectedOrder?.tecnicos || []);
              let techArray = Array.isArray(fromSelected) ? fromSelected : (fromSelected ? [fromSelected] : []);
              if (!techArray.length && selectedOrder?.raw) {
                const rawTech = selectedOrder.raw.tecnicoAsignado || selectedOrder.raw.tecnicos || selectedOrder.raw.assignedTechnicians || null;
                if (rawTech) techArray = Array.isArray(rawTech) ? rawTech : [rawTech];
              }
              return techArray.map(t => (t?.name || t?.nombre || (typeof t === 'string' ? t : ''))).filter(Boolean).join(', ');
            })();
            rows.push(['Técnicos', techs || '']);

            // Determine whether safety checklist was completed either on server or locally persisted
            let safetyCompleted = false;
            try {
              const selectedKey = selectedOrder ? (selectedOrder?.id || selectedOrder?.ordenTrabajo || selectedOrder?.folio || '') : '';
              const rawSaved = (selectedKey && localStorage.getItem(`wb_safety_check_${selectedKey}`)) ? JSON.parse(localStorage.getItem(`wb_safety_check_${selectedKey}`)) : null;
              const localCompleted = !!(rawSaved && rawSaved.completed);
              safetyCompleted = !!selectedOrder?.safetyChecklistCompleted || localCompleted;
            } catch (e) {
              safetyCompleted = !!selectedOrder?.safetyChecklistCompleted;
            }

            if (safetyCompleted) {
              rows.push(['Verificación de Seguridad', 'Completada y revisada']);
            }
            // Determine current flow/column and readiness for shipment
            const mapToColumnLabel = (val) => {
              if (!val) return '';
              const v = String(val).toLowerCase().trim();
              if (['material-reception','recepcion material','recepción material','recepción_material','recepción','pendiente','pendiente por revisar','new','nuevo'].includes(v)) return 'Recepción Material';
              if (['safety-checklist','lista seguridad','seguridad','safety','checklist seguridad'].includes(v)) return 'Lista Seguridad';
              if (['manufacturing','fabricación','fabricacion','en progreso','progreso','producción','produccion','en pausa','pausa','pausado'].includes(v)) return 'Fabricación';
              if (['quality-control','control calidad','calidad','qc','quality','revisión'].includes(v)) return 'Control Calidad';
              if (['ready-shipment','listo envío','listo envio','envío','envio','enviado','completada','completado','listo'].includes(v)) return 'Listo Envío';
              if (['material-reception','safety-checklist','manufacturing','quality-control','ready-shipment'].includes(v)) return v;
              return String(val);
            };

            const currentFlow = mapToColumnLabel(selectedOrder?.status || selectedOrder?.raw?.status || selectedOrder?.estado || selectedOrder?.raw?.estado || '');
            const isReadyForShipment = (() => {
              const status = (selectedOrder?.status || selectedOrder?.raw?.status || selectedOrder?.estado || selectedOrder?.raw?.estado || '').toString().toLowerCase();
              const progressVal = Number(selectedOrder?.progress ?? selectedOrder?.progreso ?? selectedOrder?.estadoProgreso ?? 0) || 0;
              const completedFlag = !!(selectedOrder?.completed || selectedOrder?.raw?.completed);
              return (['ready-shipment','listo envío','listo envio','enviado','completado','completada','listo'].some(s => status.includes(s)) || progressVal >= 100 || completedFlag) ? 'Sí' : 'No';
            })();

            rows.push(['Flujo actual', currentFlow || '']);
            rows.push(['Listo Envío', isReadyForShipment]);

            doc.autoTable({
              startY: 90,
              head: [['Proyecto', 'Datos']],
              body: rows,
              theme: 'grid',
              styles: { fontSize: 10 }
            });

            // Materials table
            const mats = buildMaterials();
            if (mats.length) {
              const startY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 200;
              const matRows = mats.map(m => [m.name || '', String(m.required || 0), String(m.received || 0), String(m.missing || 0)]);
              doc.autoTable({
                startY,
                head: [['Material', 'Req.', 'Recibidos', 'Faltantes']],
                body: matRows,
                theme: 'grid',
                styles: { fontSize: 10 }
              });
            }

            // Approved materials: try local shapes first, fall back to requisiService
            try {
              const approvedCandidates = [];
              if (Array.isArray(selectedOrder?.materials)) approvedCandidates.push(...selectedOrder.materials);
              if (Array.isArray(selectedOrder?.raw?.materiales)) approvedCandidates.push(...selectedOrder.raw.materiales);
              if (Array.isArray(selectedOrder?.raw?.materials)) approvedCandidates.push(...selectedOrder.raw.materials);

              let approvedList = extractApprovedFromArray(approvedCandidates);

              // fallback: query requisitions by several possible order-identifiers
              if (!approvedList.length) {
                const candidates = [];
                if (selectedOrder?.ordenTrabajo) candidates.push({ q: { numeroOrdenTrabajo: selectedOrder.ordenTrabajo } });
                if (selectedOrder?.id) candidates.push({ q: { id: selectedOrder.id } });
                if (selectedOrder?.folio) candidates.push({ q: { folio: selectedOrder.folio } });
                if (selectedOrder?.raw?.id) candidates.push({ q: { id: selectedOrder.raw.id } });
                if (selectedOrder?.raw?.numeroOrdenTrabajo) candidates.push({ q: { numeroOrdenTrabajo: selectedOrder.raw.numeroOrdenTrabajo } });

                for (const c of candidates) {
                  try {
                    const resp = await requisiService.getRequisitions(c.q);
                    if (resp?.success && Array.isArray(resp.data) && resp.data.length) {
                      // Collect all materials (don't require estado 'aprob')
                      const mats = [];
                      resp.data.forEach(req => {
                        const list = Array.isArray(req.materiales) ? req.materiales : (Array.isArray(req.items) ? req.items : []);
                        list.forEach(it => mats.push(it));
                      });

                      console.debug('[WorkflowControls] requisitions materials count', mats.length);
                      if (mats.length) {
                        // If items look like articulos (codigo/descripcion), map to article-like rows for PDF
                        const first = mats[0];
                        if (first && (first.codigo || first.descripcion || first.costoUnitario || first.cantidadConUnidad)) {
                          approvedList = mats.map(a => ({ codigo: a.codigo, descripcion: a.descripcion || a.nombre || a.producto, cantidadConUnidad: a.cantidadConUnidad ?? a.cantidad ?? a.qty, costoUnitario: a.costoUnitario ?? a.precio ?? a.price, subtotal: a.subtotal ?? a.total ?? 0 }));
                          break;
                        }

                        const fromReq = extractApprovedFromArray(mats);
                        if (fromReq.length) { approvedList = fromReq; break; }
                      }
                    }
                  } catch (e) {
                    // ignore and continue with other candidates
                  }
                }
              }

              // if still empty, try gastos (ordenes de compra) via hook
              if (!approvedList.length) {
                try {
                  console.debug('[WorkflowControls] generateReport: trying getGastos fallback for selectedOrder', { ordenTrabajo: selectedOrder?.ordenTrabajo, id: selectedOrder?.id, folio: selectedOrder?.folio });
                  const gresp = await getGastos();
                  console.debug('[WorkflowControls] getGastos returned', Array.isArray(gresp) ? gresp.length : (gresp?.items?.length || gresp?.data?.length || 0));
                  const list = Array.isArray(gresp) ? gresp : (gresp?.items || gresp?.data || []);
                  if (Array.isArray(list) && list.length) {
                    const candidates = [];
                    if (selectedOrder?.ordenTrabajo) candidates.push(String(selectedOrder.ordenTrabajo));
                    if (selectedOrder?.id) candidates.push(String(selectedOrder.id));
                    if (selectedOrder?.folio) candidates.push(String(selectedOrder.folio));
                    if (selectedOrder?.raw?.id) candidates.push(String(selectedOrder.raw.id));

                    for (const po of list) {
                      try {
                        const poKeys = [po?.numeroOrdenTrabajo, po?.orderNumber, po?.numero, po?.folio, po?.id, po?.ordenTrabajo, po?.numeroOrdenCompra].filter(Boolean).map(String);
                        const nor = normalizeKey(selectedOrder?.ordenTrabajo || selectedOrder?.id || selectedOrder?.folio || selectedOrder?.raw?.id || '');
                        const nd = onlyDigits(selectedOrder?.ordenTrabajo || selectedOrder?.id || selectedOrder?.folio || selectedOrder?.raw?.id || '');
                        const matched = poKeys.some(k => {
                          const nk = normalizeKey(k);
                          const kd = onlyDigits(k);
                          if (nk && nor && (nk.includes(nor) || nor.includes(nk))) return true;
                          if (kd && nd && kd === nd) return true;
                          if (String(selectedOrder?.ordenTrabajo || '').toLowerCase().includes(String(k).toLowerCase()) || String(k).toLowerCase().includes(String(selectedOrder?.ordenTrabajo || '').toLowerCase())) return true;
                          return false;
                        });
                        if (matched) {
                          // prefer articulos if present
                          const articles = Array.isArray(po.articulos) ? po.articulos : (Array.isArray(po.materiales) ? po.materiales : (Array.isArray(po.items) ? po.items : []));
                          if (articles.length) {
                            approvedList = articles.map(a => ({ codigo: a.codigo, descripcion: a.descripcion || a.nombre || a.producto, cantidadConUnidad: a.cantidadConUnidad ?? a.cantidad ?? a.qty, costoUnitario: a.costoUnitario ?? a.precio ?? a.price, subtotal: a.subtotal ?? a.total ?? 0 }));
                            console.debug('[WorkflowControls] matched PO, articles count', approvedList.length);
                            break;
                          }
                        }
                      } catch (e) { console.warn('[WorkflowControls] error checking PO', e?.message || e); }
                    }
                  }
                } catch (e) {
                  console.warn('[WorkflowControls] getGastos failed', e?.message || e);
                }
              }

              if (approvedList && approvedList.length) {
                const startY2 = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 250;
                const formatCurrency = (v) => {
                  try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(Number(v || 0)); } catch (e) { return String(v); }
                };

                // If articles shape (codigo) use the requested columns, otherwise use generic approved shape
                let rowsApproved = [];
                if (approvedList[0] && approvedList[0].codigo) {
                  rowsApproved = approvedList.map(a => [String(a.codigo || ''), String(a.descripcion || ''), String(a.cantidadConUnidad ?? a.cantidad ?? a.qty ?? ''), String(formatCurrency(a.costoUnitario)), String(formatCurrency(a.subtotal))]);
                  doc.autoTable({
                    startY: startY2 + 8,
                    head: [['Código', 'Descripción', 'Cantidad', 'Costo Unitario', 'Subtotal']],
                    body: rowsApproved,
                    theme: 'grid',
                    styles: { fontSize: 10 }
                  });
                } else {
                  rowsApproved = approvedList.map(a => [a.name || '', String(a.required || 0), String(a.received || 0), String(Math.max(0, (a.required || 0) - (a.received || 0)))]);
                  doc.autoTable({
                    startY: startY2 + 8,
                    head: [['Material Aprobado', 'Req.', 'Recibidos', 'Faltantes']],
                    body: rowsApproved,
                    theme: 'grid',
                    styles: { fontSize: 10 }
                  });
                }
              }
            } catch (e) {
              // ignore approved-materials errors for PDF generation
            }

            const selectedKey = selectedOrder ? (selectedOrder?.id || selectedOrder?.ordenTrabajo || selectedOrder?.folio || '') : '';
            const localMissing = Array.isArray(localMissingByOrder?.[selectedKey]) ? localMissingByOrder[selectedKey] : [];
            const recorded = Array.isArray(selectedMissingPPE) ? selectedMissingPPE : (selectedMissingPPE ? [selectedMissingPPE] : []);
            const missingList = Array.from(new Set([...(recorded || []), ...(localMissing || [])]));
            if (missingList.length) {
              const startY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 250;
              doc.setFontSize(12);
              const rowsMissing = missingList.map(m => [String(m || '')]);
              doc.autoTable({
                startY: startY + 8,
                head: [['Faltantes Lista de seguridad']],
                body: rowsMissing,
                theme: 'grid',
                styles: { fontSize: 10 }
              });
            }

            // Footer note and save
            const fileName = `Reporte_Orden_${String(selectedOrder?.ordenTrabajo || selectedOrder?.id || '').replace(/\s+/g,'_')}_${now.toISOString().slice(0,10)}.pdf`;
            doc.save(fileName);
          };

          return (
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-medium mb-4 flex items-center space-x-2">
                <Icon name="Settings" size={20} />
                <span>Controles Operativos</span>
              </h3>

              {/* Shift Status */}
              <div className="mb-4 p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Estado del Turno</div>
                    <div className="text-sm text-muted-foreground">8:00 - 18:00</div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isWorkingHours 
                      ? 'bg-green-100 text-green-700' :'bg-red-100 text-red-700'
                  }`}>
                    {isWorkingHours ? 'Activo' : 'Inactivo'}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="mb-4">
                <div className="text-sm text-muted-foreground mb-2">Resumen Órdenes</div>
                <div className="text-2xl font-bold">{totalOrders}</div>
                <div className="text-sm text-muted-foreground">Órdenes activas</div>
              </div>

              

              {/* Selected Order Info */}
              {selectedOrder && (
                <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20 overflow-hidden">
                  <div className="font-medium mb-2 text-center">Orden Seleccionada</div>
                  <div className="text-sm grid grid-cols-2 gap-3">
                    {/* helpers defined in component scope: formatProgress, formatDate */}
                    <div className="truncate">
                      <strong className="block">Orden Trabajo</strong>
                      <span className="block mt-1 font-medium">{selectedOrder?.ordenTrabajo || selectedOrder?.id}</span>
                    </div>

                    <div className="truncate">
                      <strong className="block">Progreso</strong>
                      <span className="block mt-1">
                        {(() => {
                          // Collect possible progress sources (many aliases)
                          const candidates = [
                            selectedOrder?.progress,
                            selectedOrder?.progreso,
                            selectedOrder?.raw?.progreso,
                            selectedOrder?.raw?.estadoProgreso,
                            selectedOrder?.raw?.progress,
                            selectedOrder?.raw?.estado,
                            selectedOrder?.raw?.porcentaje,
                            selectedOrder?.porcentaje,
                          ].filter(v => v !== undefined && v !== null);

                          // normalize helper (reuse logic similar to formatProgress but return numeric percent)
                          const normalizeNumericPercent = (val) => {
                            if (val === null || val === undefined || val === '') return NaN;
                            const s = (typeof val === 'string') ? val.trim() : String(val);
                            // strip non numeric except dot and minus
                            const cleaned = s.replace(/[^0-9.+-]/g, '');
                            const n = Number(cleaned);
                            if (Number.isNaN(n)) return NaN;
                            let num = n;
                            if (num > 0 && num <= 1) num = num * 100;
                            else if (num > 100) {
                              const maybe = num / 100;
                              if (maybe > 0 && maybe <= 100) num = maybe;
                            }
                            if (num < 0) num = 0;
                            if (num > 100) num = 100;
                            return num;
                          };

                          let best = NaN;
                          for (const c of candidates) {
                            const n = normalizeNumericPercent(c);
                            if (Number.isNaN(n)) continue;
                            // prefer values that look like whole percentages (>=1)
                            if (n >= 1 && (Number.isNaN(best) || n > best)) {
                              best = n; // pick the largest clear percentage
                            } else if (Number.isNaN(best)) {
                              best = n;
                            }
                          }

                          // fallback to any available raw if none normalized
                          const fallback = candidates.length ? candidates[0] : null;

                          if (!Number.isNaN(best)) return formatProgress(best);
                          if (fallback !== null && fallback !== undefined) return formatProgress(fallback);
                          return '0%';
                        })()}
                      </span>
                    </div>

                    <div className="truncate">
                      <strong className="block">Cliente</strong>
                      <span className="block mt-1">{selectedOrder?.clientName || selectedOrder?.clientLabel || (selectedOrder?.cliente && (selectedOrder.cliente.nombre || selectedOrder.cliente)) || ''}</span>
                    </div>

                    <div className="truncate">
                      <strong className="block">Proyecto</strong>
                      <span className="block mt-1">
                        {(
                          selectedOrder?.projectRef ||
                          selectedOrder?.proyectoNombre ||
                          selectedOrder?.raw?.proyecto ||
                          selectedOrder?.raw?.projectName ||
                          selectedOrder?.raw?.project ||
                          selectedOrder?.project?.name ||
                          selectedOrder?.project?.nombre ||
                          ''
                        )}
                      </span>
                    </div>

                    <div className="truncate">
                      <strong className="block">Prioridad</strong>
                      <span className="block mt-1">{(resolvePriority()) || selectedOrder?.raw?.prioridad || selectedOrder?.raw?.estado || selectedOrder?.estado || ''}</span>
                    </div>

                    <div className="truncate">
                      <strong className="block">Fecha límite</strong>
                      <span className="block mt-1">
                        {(() => {
                          const rawDate = selectedOrder?.fechaLimite || selectedOrder?.estimatedCompletion || selectedOrder?.proyectoFecha || selectedOrder?.raw?.fechaLimite || selectedOrder?.raw?.fecha || selectedOrder?.raw?.estimatedCompletion || selectedOrder?.raw?.fechaEstimada || '';
                          try {
                            return formatDate(rawDate);
                          } catch (e) {
                            return rawDate || '';
                          }
                        })()}
                      </span>
                    </div>

                    {/* Materiales - recibidos y faltantes */}
                    <div className="col-span-2 mt-1">
                      <strong className="block mb-1">Materiales</strong>
                      {(() => {
                        const reception = selectedOrder?.recepcionMateriales || selectedOrder?.raw?.recepcionMateriales || { materials: [] };
                        const materials = selectedOrder?.materials;
                        
                        // Calcular totales desde recepcionMateriales si existen
                        const totalReceived = reception?.materials?.reduce((sum, m) => sum + (Number(m.received) || 0), 0) || reception?.cantidadRecibida || reception?.received || materials?.received || 0;
                        const totalRequired = reception?.materials?.reduce((sum, m) => sum + (Number(m.required) || 0), 0) || materials?.total || 0;
                        const totalPending = Math.max(0, totalRequired - totalReceived);
                        
                        return (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-green-600 font-semibold">{totalReceived}</span>
                            <span className="text-muted-foreground">/</span>
                            <span className="font-semibold">{totalRequired}</span>
                            {totalPending > 0 && (
                              <>
                                <span className="text-muted-foreground">•</span>
                                <span className="text-orange-600 font-medium flex items-center gap-1">
                                  <Icon name="AlertCircle" size={14} />
                                  {totalPending} faltantes
                                </span>
                              </>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Técnicos ocupa toda la fila en caso de necesitar más espacio */}
                    {(() => {
                      const fromSelected = (selectedOrder?.assignedTechnicians || selectedOrder?.tecnicoAsignado || selectedOrder?.tecnicos || []);
                      let techArray = Array.isArray(fromSelected) ? fromSelected : (fromSelected ? [fromSelected] : []);
                      if (!techArray.length && selectedOrder?.raw) {
                        const rawTech = selectedOrder.raw.tecnicoAsignado || selectedOrder.raw.tecnicos || selectedOrder.raw.assignedTechnicians || null;
                        if (rawTech) techArray = Array.isArray(rawTech) ? rawTech : [rawTech];
                      }
                      if (!techArray.length) return null;
                      const names = techArray.map(t => (t?.name || t?.nombre || (typeof t === 'string' ? t : ''))).filter(Boolean);
                      if (!names.length) return null;
                      return (
                        <div className="truncate col-span-2 mt-1">
                          <strong className="block">Técnicos</strong>
                          <span className="block mt-1">{names.join(', ')}</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="space-y-2">
                {selectedOrder && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    iconName="RefreshCw"
                    onClick={() => onRevertStatus?.(selectedOrder)}
                  >
                    Regresar progreso
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  iconName="FileText"
                  onClick={async () => {
                    try {
                      await generateReport();
                    } catch (e) {
                      // fallback: no-op
                    }
                  }}
                >
                  Generar Reporte
                </Button>
                
                
              </div>

              {/* Working Hours Reminder */}
              {!isWorkingHours && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Icon name="AlertTriangle" size={16} className="text-yellow-600 mt-0.5" />
                    <div className="text-sm">
                      <div className="font-medium text-yellow-800">Fuera de Horario</div>
                      <div className="text-yellow-700">
                        Turno de trabajo: 8:00 - 18:00
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        };

        export default WorkflowControls;