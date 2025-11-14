import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProjectQuotations = ({ projects }) => {
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Generate mock quotations for each project
  const generateProjectQuotations = (project) => {
    const mockQuotations = [
      {
        id: `${project?.id}-quote-1`,
        code: `COT-${project?.code?.split('-')?.[2]}-001`,
        version: '1.0',
        status: 'pending',
        statusLabel: 'Pendiente',
        amount: project?.budget * 0.9,
        createdDate: '2024-01-10',
        expiryDate: '2024-02-10',
        description: 'Cotización inicial para el proyecto',
        items: [
          { description: 'Equipos HVAC principales', quantity: 2, unitPrice: project?.budget * 0.4 },
          { description: 'Instalación y configuración', quantity: 1, unitPrice: project?.budget * 0.3 },
          { description: 'Mantenimiento anual', quantity: 1, unitPrice: project?.budget * 0.2 }
        ]
      },
      {
        id: `${project?.id}-quote-2`,
        code: `COT-${project?.code?.split('-')?.[2]}-002`,
        version: '1.1',
        status: 'approved',
        statusLabel: 'Aprobada',
        amount: project?.budget,
        createdDate: '2024-01-15',
        expiryDate: '2024-03-15',
        description: 'Cotización revisada con especificaciones actualizadas',
        items: [
          { description: 'Equipos HVAC premium', quantity: 2, unitPrice: project?.budget * 0.45 },
          { description: 'Instalación especializada', quantity: 1, unitPrice: project?.budget * 0.35 },
          { description: 'Garantía extendida', quantity: 1, unitPrice: project?.budget * 0.2 }
        ]
      }
    ];
    
    return mockQuotations;
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'expired': 'bg-gray-100 text-gray-800',
      'draft': 'bg-blue-100 text-blue-800'
    };
    return colors?.[status] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    })?.format(amount);
  };

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const filteredProjects = projects?.filter(project =>
    project?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
    project?.code?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
    project?.client?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase())
  );

  const handleCreateQuotation = (project) => {
    alert(`Creando nueva cotización para el proyecto: ${project?.name}\n\nSe abrirá el formulario de cotización.`);
    // Navigate to quotation creation
    navigate(`/cotizaciones?projectId=${project?.id}`);
  };

  const handleViewQuotation = (project, quotation) => {
    alert(`Ver detalles de la cotización: ${quotation?.code}\n\nProyecto: ${project?.name}\nMonto: ${formatCurrency(quotation?.amount)}\nEstado: ${quotation?.statusLabel}`);
    // Navigate to quotation details
    navigate(`/cotizaciones/${quotation?.id}`);
  };

  const handleEditQuotation = (project, quotation) => {
    alert(`Editando cotización: ${quotation?.code}\n\nProyecto: ${project?.name}\nVersión: ${quotation?.version}`);
    // Navigate to quotation edit
    navigate(`/cotizaciones/${quotation?.id}/edit`);
  };

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Cotizaciones de Proyectos</h2>
          <p className="text-muted-foreground">
            Gestione las cotizaciones asociadas a cada proyecto
          </p>
        </div>
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <div className="relative">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar proyectos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
              className="pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Projects with Quotations */}
      <div className="grid grid-cols-1 gap-6">
        {filteredProjects?.map((project) => {
          const quotations = generateProjectQuotations(project);
          
          return (
            <div key={project?.id} className="bg-card border border-border rounded-lg overflow-hidden">
              {/* Project Header */}
              <div className="bg-muted/30 p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon name="FileText" size={20} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{project?.name}</h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-muted-foreground">{project?.code}</span>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{project?.client?.name}</span>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm font-medium text-foreground">{formatCurrency(project?.budget)}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleCreateQuotation(project)}
                    iconName="Plus"
                    iconPosition="left"
                    size="sm"
                  >
                    Nueva Cotización
                  </Button>
                </div>
              </div>

              {/* Quotations List */}
              <div className="p-4">
                {quotations?.length === 0 ? (
                  <div className="text-center py-8">
                    <Icon name="FileText" size={48} className="text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-4">No hay cotizaciones para este proyecto</p>
                    <Button
                      onClick={() => handleCreateQuotation(project)}
                      iconName="Plus"
                      iconPosition="left"
                      variant="outline"
                      size="sm"
                    >
                      Crear Primera Cotización
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {quotations?.map((quotation) => (
                      <div key={quotation?.id} className="bg-background rounded-lg border border-border p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <span className="font-mono text-sm font-medium text-primary">
                                {quotation?.code}
                              </span>
                              <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
                                v{quotation?.version}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quotation?.status)}`}>
                                {quotation?.statusLabel}
                              </span>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-3">{quotation?.description}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                              <div>
                                <div className="text-xs text-muted-foreground">Monto Total</div>
                                <div className="text-sm font-semibold text-foreground">
                                  {formatCurrency(quotation?.amount)}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">Fecha Creación</div>
                                <div className="text-sm text-foreground">{formatDate(quotation?.createdDate)}</div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">Fecha Vencimiento</div>
                                <div className="text-sm text-foreground">{formatDate(quotation?.expiryDate)}</div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">Items</div>
                                <div className="text-sm text-foreground">{quotation?.items?.length} conceptos</div>
                              </div>
                            </div>

                            {/* Quotation Items Summary */}
                            <div className="bg-muted/20 rounded-lg p-3 mb-3">
                              <div className="text-xs text-muted-foreground mb-2">Conceptos principales:</div>
                              <div className="space-y-1">
                                {quotation?.items?.slice(0, 3)?.map((item, index) => (
                                  <div key={index} className="flex items-center justify-between text-xs">
                                    <span className="text-foreground truncate">{item?.description}</span>
                                    <span className="text-muted-foreground ml-2 flex-shrink-0">
                                      {formatCurrency(item?.unitPrice)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewQuotation(project, quotation)}
                              title="Ver cotización"
                            >
                              <Icon name="Eye" size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditQuotation(project, quotation)}
                              title="Editar cotización"
                            >
                              <Icon name="Edit" size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => alert(`Descargando PDF de ${quotation?.code}`)}
                              title="Descargar PDF"
                            >
                              <Icon name="Download" size={16} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredProjects?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="FileText" size={64} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No se encontraron proyectos</h3>
          <p className="text-muted-foreground mb-6">
            No hay proyectos que coincidan con la búsqueda
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectQuotations;