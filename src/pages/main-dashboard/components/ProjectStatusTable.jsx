import React, { useState, useEffect } from 'react';
import useProyecto from '../../../hooks/useProyect';
import { useNavigate } from 'react-router-dom';
import EditProjectModal from '../../project-management/components/EditProjectModal';
import CreateProjectModal from '../../project-management/components/CreateProjectModal';
// Devuelve el icono y color tailwind para cada departamento
const getDepartmentIcon = (department) => {
  const dep = (department || '').toLowerCase();
  if (dep.includes('ventas')) return { icon: 'ShoppingCart', color: 'text-blue-500' };
  if (dep.includes('finanzas')) return { icon: 'DollarSign', color: 'text-green-500' };
  if (dep.includes('operaciones')) return { icon: 'Settings', color: 'text-orange-500' };
  if (dep.includes('taller')) return { icon: 'Tool', color: 'text-gray-500' };
  if (dep.includes('proyectos')) return { icon: 'FolderOpen', color: 'text-purple-500' };
  if (dep.includes('compras')) return { icon: 'Package', color: 'text-pink-500' };
  if (dep.includes('inventario')) return { icon: 'Archive', color: 'text-yellow-500' };
  if (dep.includes('personal')) return { icon: 'Users', color: 'text-cyan-500' };
  return { icon: 'Briefcase', color: 'text-muted-foreground' };
};
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';
import clientService from '../../../services/clientService';

const getPriorityColor = (priority) => {
  const v = (priority || '').toString().toLowerCase().trim();
  const map = {
    baja: 'text-green-600',
    media: 'text-yellow-600',
    alta: 'text-orange-600',
    urgente: 'text-red-600',
    low: 'text-green-600',
    medium: 'text-yellow-600',
    high: 'text-orange-600',
    urgent: 'text-red-600',
  };
  return map[v] || 'text-gray-600';
};

const getStatusColor = (status) => {
  const v = (status || '').toString().toLowerCase().trim();
  const map = {
    'planificacion': 'bg-blue-100 text-blue-800',
    'planificación': 'bg-blue-100 text-blue-800',
    'planning': 'bg-blue-100 text-blue-800',
    'en progreso': 'bg-green-100 text-green-800',
    'in_progress': 'bg-green-100 text-green-800',
    'en pausa': 'bg-yellow-100 text-yellow-800',
    'on_hold': 'bg-yellow-100 text-yellow-800',
    'revision': 'bg-purple-100 text-purple-800',
    'revisión': 'bg-purple-100 text-purple-800',
    'review': 'bg-purple-100 text-purple-800',
    'completado': 'bg-emerald-100 text-emerald-800',
    'completed': 'bg-emerald-100 text-emerald-800',
    'cancelado': 'bg-red-100 text-red-800',
    'cancelled': 'bg-red-100 text-red-800',
  };
  return map[v] || 'bg-gray-100 text-gray-800';
};

const getPossibleClientId = (p) => {
  const r = p?.raw || p || {};
  return (
    p?.client?.id ||
    p?.client?._id ||
    r.clienteId ||
    r.idCliente ||
    r.clientId ||
    r.customerId ||
    (r.cliente && (r.cliente.id || r.cliente._id)) ||
    (r.client && (r.client.id || r.client._id)) ||
    null
  );
};

const ProjectStatusTable = () => {
  const [viewProject, setViewProject] = useState(null);
  const [editProject, setEditProject] = useState(null);
  const [sortField, setSortField] = useState('priority');
  const [sortDirection, setSortDirection] = useState('desc');
  const [clientCache, setClientCache] = useState({});
  const [clientsLoaded, setClientsLoaded] = useState(false);
  const navigate = useNavigate();
  const { proyectos, getProyectos } = useProyecto();

  useEffect(() => {
    getProyectos();
  }, [getProyectos]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await clientService.getClients();
        const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        const map = {};
        list.forEach((raw) => {
          const id = raw?.id ?? raw?._id ?? raw?.clienteId ?? raw?.idCliente ?? null;
          const name = raw?.nombre ?? raw?.empresa ?? raw?.razonSocial ?? raw?.razon_social ?? raw?.displayName ?? raw?.name ?? null;
          const email = raw?.email ?? raw?.correo ?? raw?.correoElectronico ?? raw?.mail ?? raw?.contacto?.email ?? raw?.contacto?.correo ?? null;
          const contact = raw?.contacto?.nombre ?? raw?.contacto?.name ?? raw?.telefono ?? raw?.phone ?? null;
          if (id) map[id] = { name, email, contact };
        });
        if (mounted) {
          setClientCache(map);
          setClientsLoaded(true);
        }
      } catch (e) {
        if (mounted) setClientsLoaded(true);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Normalizador similar a ProjectTable
  const normalizedProjects = Array.isArray(proyectos)
    ? proyectos.map((doc) => {
        const clientId = getPossibleClientId(doc);
        const clientData = clientId && clientCache[clientId] ? clientCache[clientId] : {};
        return {
          id: doc.id ?? doc._id ?? null,
          name: doc.nombre ?? doc.empresa ?? doc.razonSocial ?? doc.razon_social ?? doc.displayName ?? doc.name ?? '',
          image: doc.image ?? '',
          client: clientData.name ?? 'Sin cliente',
          clientEmail: clientData.email ?? '',
          department: doc.departamento ?? doc.department ?? '',
          departmentIcon: doc.departamentoIcon ?? doc.departmentIcon ?? '',
          codigo: doc.codigo ?? doc.codigoCotizacion ?? doc.codigo_cotizacion ?? '',
          priority: doc.prioridad ?? doc.prioridades ?? doc.priority ?? '',
          status: doc.estado ?? doc.status ?? '',
          type: doc.tipo ?? doc.type ?? '',
        };
      })
    : [];

  const sortedProjects = [...normalizedProjects]?.sort((a, b) => {
    let aValue = a?.[sortField];
    let bValue = b?.[sortField];
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleViewProject = (projectId) => {
    navigate(`/project-detail-gallery/${projectId}`);
  };

  return (
  <div className="bg-white border border-border rounded-lg card-shadow p-6">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Estado de Proyectos</h3>
            <p className="text-sm text-muted-foreground">Seguimiento en tiempo real de proyectos activos</p>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto border border-border rounded-lg">
        <div style={{ maxHeight: '340px', overflowY: sortedProjects.length > 5 ? 'auto' : 'visible' }}>
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-4 font-medium text-muted-foreground">
                  <button 
                    onClick={() => setSortField('name')}
                    className="flex items-center space-x-2 hover:text-foreground transition-smooth"
                  >
                    <span>Proyecto</span>
                    <Icon name="ArrowUpDown" size={14} />
                  </button>
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground">Departamento</th>
                <th className="text-left p-4 font-medium text-muted-foreground">
                  <button 
                    onClick={() => setSortField('client')}
                    className="flex items-center space-x-2 hover:text-foreground transition-smooth"
                  >
                    <span>Cliente</span>
                    <Icon name="ArrowUpDown" size={14} />
                  </button>
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground">Estado</th>
                <th className="text-left p-4 font-medium text-muted-foreground">
                  <button 
                    onClick={() => setSortField('priority')}
                    className="flex items-center space-x-2 hover:text-foreground transition-smooth"
                  >
                    <span>Prioridad</span>
                    <Icon name="ArrowUpDown" size={14} />
                  </button>
                </th>
                {/* Acciones eliminadas temporalmente */}
              </tr>
            </thead>
            <tbody>
              {sortedProjects?.slice(0, sortedProjects.length > 5 ? sortedProjects.length : 5).map((project) => (
                <tr key={project?.id} className="border-b border-border hover:bg-muted/50 transition-smooth">
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      {project.image && (
                        <Image src={project.image} alt={project.name} className="w-8 h-8 rounded object-cover" />
                      )}
                      <div>
                        <div className="font-medium text-foreground">{project?.name}</div>
                        {project?.codigo && (
                          <div className="text-xs text-muted-foreground">{project?.codigo}</div>
                        )}
                        {project?.type && (
                          <div className="text-xs text-muted-foreground">{project?.type}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {project?.department && (
                        <Icon name={getDepartmentIcon(project.department).icon} size={16} className={getDepartmentIcon(project.department).color} />
                      )}
                      <span className="font-medium text-foreground">{project?.department}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-foreground">{project?.client}</div>
                    {project?.clientEmail && (
                      <div className="text-xs text-muted-foreground">{project?.clientEmail}</div>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project?.status)}`}>{project?.status}</span>
                  </td>
                  <td className="p-4">
                    <span className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(project?.priority)}`}>
                      <Icon name="AlertCircle" size={14} /> {project?.priority}
                    </span>
                  </td>
                  {/* Acciones eliminadas temporalmente */}
      {/* Modal para ver proyecto (solo lectura) */}
      {viewProject && (
        <CreateProjectModal
          isOpen={!!viewProject}
          onClose={() => setViewProject(null)}
          project={viewProject}
          readOnly={true}
        />
      )}
      {/* Modal para editar proyecto */}
      {editProject && (
        <EditProjectModal
          isOpen={!!editProject}
          onClose={() => setEditProject(null)}
          project={editProject}
        />
      )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProjectStatusTable;
