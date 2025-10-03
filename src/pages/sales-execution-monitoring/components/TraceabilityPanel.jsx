import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const TraceabilityPanel = ({ project, onUpdate }) => {
  const [newEvidence, setNewEvidence] = useState({
    type: 'photo',
    description: '',
    date: new Date()?.toISOString()?.split('T')?.[0],
    file: ''
  });

  const [newAgreement, setNewAgreement] = useState({
    description: '',
    date: new Date()?.toISOString()?.split('T')?.[0],
    participants: []
  });

  const [showEvidenceForm, setShowEvidenceForm] = useState(false);
  const [showAgreementForm, setShowAgreementForm] = useState(false);

  const handleAddEvidence = () => {
    if (!newEvidence?.description?.trim()) return;

    const evidence = {
      id: `evidence-${Date.now()}`,
      type: newEvidence?.type,
      description: newEvidence?.description,
      date: newEvidence?.date,
      file: newEvidence?.file,
      addedBy: project?.salesRep,
      timestamp: new Date()?.toISOString()
    };

    const updatedTraceability = {
      ...project?.traceability,
      evidence: [...(project?.traceability?.evidence || []), evidence]
    };

    onUpdate?.(updatedTraceability);
    setNewEvidence({
      type: 'photo',
      description: '',
      date: new Date()?.toISOString()?.split('T')?.[0],
      file: ''
    });
    setShowEvidenceForm(false);
  };

  const handleAddAgreement = () => {
    if (!newAgreement?.description?.trim()) return;

    const agreement = {
      id: `agreement-${Date.now()}`,
      description: newAgreement?.description,
      date: newAgreement?.date,
      participants: newAgreement?.participants,
      registeredBy: project?.salesRep,
      timestamp: new Date()?.toISOString()
    };

    const updatedTraceability = {
      ...project?.traceability,
      agreements: [...(project?.traceability?.agreements || []), agreement]
    };

    onUpdate?.(updatedTraceability);
    setNewAgreement({
      description: '',
      date: new Date()?.toISOString()?.split('T')?.[0],
      participants: []
    });
    setShowAgreementForm(false);
  };

  const getEvidenceIcon = (type) => {
    switch (type) {
      case 'photo': return 'Camera';
      case 'document': return 'FileText';
      case 'video': return 'Video';
      case 'certificate': return 'Award';
      default: return 'File';
    }
  };

  const getEvidenceColor = (type) => {
    switch (type) {
      case 'photo': return 'text-blue-600 bg-blue-100';
      case 'document': return 'text-green-600 bg-green-100';
      case 'video': return 'text-purple-600 bg-purple-100';
      case 'certificate': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h5 className="font-medium text-sm">Trazabilidad del Proyecto</h5>
        <p className="text-xs text-muted-foreground">
          Mantener trazabilidad completa de comunicaciones, acuerdos y evidencias (Paso 26)
        </p>

        {/* Communications History */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h6 className="font-medium text-sm">Historial de Comunicaciones</h6>
            <span className="text-xs text-muted-foreground">
              {project?.communications?.length || 0} registros
            </span>
          </div>
          
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {project?.communications?.slice(-3)?.reverse()?.map((comm) => (
              <div key={comm?.id} className="p-2 border rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <Icon 
                    name={comm?.type === 'whatsapp' ? 'MessageCircle' : 
                          comm?.type === 'email' ? 'Mail' : 
                          comm?.type === 'phone' ? 'Phone' : 'Users'} 
                    size={12} 
                    className="text-muted-foreground" 
                  />
                  <span className="text-xs text-muted-foreground">
                    {new Date(comm?.date)?.toLocaleDateString()}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {comm?.type}
                  </span>
                </div>
                <p className="text-xs text-foreground">{comm?.content}</p>
              </div>
            ))}
            
            {(!project?.communications || project?.communications?.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Sin comunicaciones registradas
              </p>
            )}
          </div>
        </div>

        {/* Agreements */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h6 className="font-medium text-sm">Acuerdos y Compromisos</h6>
            <Button
              variant="outline"
              size="sm"
              iconName="Plus"
              onClick={() => setShowAgreementForm(!showAgreementForm)}
            />
          </div>
          
          <div className="space-y-2">
            {project?.traceability?.agreements?.map((agreement) => (
              <div key={agreement?.id} className="p-3 border rounded-lg bg-green-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{agreement?.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(agreement?.date)?.toLocaleDateString()} - {agreement?.registeredBy}
                    </p>
                  </div>
                  <Icon name="FileCheck" size={16} className="text-green-600" />
                </div>
                
                {agreement?.participants?.length > 0 && (
                  <div className="flex items-center space-x-1 mt-2">
                    <Icon name="Users" size={12} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {agreement?.participants?.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            ))}
            
            {(!project?.traceability?.agreements || project?.traceability?.agreements?.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Sin acuerdos registrados
              </p>
            )}
          </div>

          {showAgreementForm && (
            <div className="space-y-3 p-3 border rounded-lg bg-gray-50">
              <h6 className="font-medium text-sm">Nuevo Acuerdo</h6>
              
              <div>
                <label className="text-xs font-medium block mb-1">Descripción</label>
                <textarea
                  value={newAgreement?.description}
                  onChange={(e) => setNewAgreement(prev => ({ ...prev, description: e?.target?.value }))}
                  placeholder="Descripción del acuerdo o compromiso..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
                  rows={2}
                />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1">Fecha</label>
                <Input
                  type="date"
                  value={newAgreement?.date}
                  onChange={(e) => setNewAgreement(prev => ({ ...prev, date: e?.target?.value }))}
                  className="text-sm"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleAddAgreement}
                  disabled={!newAgreement?.description?.trim()}
                  iconName="FileCheck"
                  iconPosition="left"
                  size="sm"
                  className="flex-1"
                >
                  Registrar Acuerdo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  iconName="X"
                  onClick={() => setShowAgreementForm(false)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Evidence Management */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h6 className="font-medium text-sm">Evidencias y Documentación</h6>
            <Button
              variant="outline"
              size="sm"
              iconName="Plus"
              onClick={() => setShowEvidenceForm(!showEvidenceForm)}
            />
          </div>
          
          <div className="space-y-2">
            {project?.traceability?.evidence?.map((evidence) => (
              <div key={evidence?.id} className="p-3 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Icon 
                      name={getEvidenceIcon(evidence?.type)} 
                      size={16} 
                      className={getEvidenceColor(evidence?.type)?.split(' ')?.[0]}
                    />
                    <div>
                      <p className="text-sm font-medium">{evidence?.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(evidence?.date)?.toLocaleDateString()} - {evidence?.addedBy}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${getEvidenceColor(evidence?.type)}`}>
                    {evidence?.type === 'photo' ? 'Foto' :
                     evidence?.type === 'document' ? 'Documento' :
                     evidence?.type === 'video' ? 'Video' : 'Certificado'}
                  </span>
                </div>
                
                {evidence?.file && (
                  <div className="flex items-center space-x-2 mt-2">
                    <Icon name="Paperclip" size={12} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{evidence?.file}</span>
                  </div>
                )}
              </div>
            ))}
            
            {(!project?.traceability?.evidence || project?.traceability?.evidence?.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Sin evidencias registradas
              </p>
            )}
          </div>

          {showEvidenceForm && (
            <div className="space-y-3 p-3 border rounded-lg bg-gray-50">
              <h6 className="font-medium text-sm">Nueva Evidencia</h6>
              
              <div>
                <label className="text-xs font-medium block mb-1">Tipo</label>
                <select
                  value={newEvidence?.type}
                  onChange={(e) => setNewEvidence(prev => ({ ...prev, type: e?.target?.value }))}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="photo">Fotografía</option>
                  <option value="document">Documento</option>
                  <option value="video">Video</option>
                  <option value="certificate">Certificado</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium block mb-1">Descripción</label>
                <Input
                  type="text"
                  value={newEvidence?.description}
                  onChange={(e) => setNewEvidence(prev => ({ ...prev, description: e?.target?.value }))}
                  placeholder="Descripción de la evidencia..."
                  className="text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1">Fecha</label>
                <Input
                  type="date"
                  value={newEvidence?.date}
                  onChange={(e) => setNewEvidence(prev => ({ ...prev, date: e?.target?.value }))}
                  className="text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1">Archivo</label>
                <Input
                  type="text"
                  value={newEvidence?.file}
                  onChange={(e) => setNewEvidence(prev => ({ ...prev, file: e?.target?.value }))}
                  placeholder="Nombre del archivo o referencia..."
                  className="text-sm"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleAddEvidence}
                  disabled={!newEvidence?.description?.trim()}
                  iconName="Camera"
                  iconPosition="left"
                  size="sm"
                  className="flex-1"
                >
                  Registrar Evidencia
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  iconName="X"
                  onClick={() => setShowEvidenceForm(false)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Traceability Summary */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Search" size={16} className="text-blue-600" />
            <span className="font-medium text-sm text-blue-800">Resumen de Trazabilidad</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-sm font-bold text-blue-800">
                {project?.communications?.length || 0}
              </p>
              <p className="text-xs text-blue-600">Comunicaciones</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-blue-800">
                {project?.traceability?.agreements?.length || 0}
              </p>
              <p className="text-xs text-blue-600">Acuerdos</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-blue-800">
                {project?.traceability?.evidence?.length || 0}
              </p>
              <p className="text-xs text-blue-600">Evidencias</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TraceabilityPanel;