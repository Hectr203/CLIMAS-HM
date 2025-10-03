import React from 'react';
import Button from '../../../components/ui/Button';
import DocumentUploadPanel from './DocumentUploadPanel';
import QuotationPanel from './QuotationPanel';
import ValidationPanel from './ValidationPanel';

const WorkflowControls = ({ 
  selectedProject, 
  workflowStages, 
  onClose, 
  onDocumentUpload, 
  onQuotationUpdate, 
  onValidationSubmit, 
  onStageTransition 
}) => {
  if (!selectedProject) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Seleccione un proyecto para ver los controles</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">{selectedProject?.name}</h4>
          <p className="text-sm text-muted-foreground">{selectedProject?.client}</p>
        </div>

        {/* Document Upload */}
        <DocumentUploadPanel
          project={selectedProject}
          onUpload={(document) => onDocumentUpload?.(selectedProject?.id, document)}
        />

        {/* Quotation Builder */}
        {(selectedProject?.stage === 'quotation-development' || selectedProject?.quotation) && (
          <QuotationPanel
            project={selectedProject}
            onUpdate={(quotation) => onQuotationUpdate?.(selectedProject?.id, quotation)}
          />
        )}

        {/* Validation */}
        {selectedProject?.stage === 'validation' && (
          <ValidationPanel
            project={selectedProject}
            onSubmit={(validation) => onValidationSubmit?.(selectedProject?.id, validation)}
          />
        )}

        {/* Stage Transition */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Avanzar Etapa</label>
          <div className="grid grid-cols-2 gap-2">
            {workflowStages?.map((stage) => (
              <Button
                key={stage?.id}
                variant={selectedProject?.stage === stage?.id ? "default" : "outline"}
                size="sm"
                onClick={() => onStageTransition?.(selectedProject?.id, stage?.id)}
                disabled={selectedProject?.stage === stage?.id}
                className="text-xs"
              >
                {stage?.name}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowControls;