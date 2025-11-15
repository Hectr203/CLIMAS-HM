import React from 'react';
        import Icon from '../../../components/AppIcon';

        const OpportunityCard = ({ opportunity, onSelect, onStageTransition }) => {
          const getPriorityColor = (priority) => {
            switch (priority) {
              case 'urgent': return 'border-l-red-600 bg-red-50';
              case 'high': return 'border-l-orange-500 bg-orange-50';
              case 'medium': return 'border-l-yellow-500 bg-yellow-50';
              case 'low': return 'border-l-green-500 bg-green-50';
              default: return 'border-l-gray-400 bg-gray-50';
            }
          };

          const getDurationColor = (days) => {
            if (days <= 3) return 'text-green-600';
            if (days <= 7) return 'text-yellow-600';
            return 'text-red-600';
          };

          return (
            <div
              onClick={() => onSelect?.(opportunity)}
              className={`p-3 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-all mb-3 ${getPriorityColor(opportunity?.priority)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-sm text-foreground line-clamp-2">
                  {opportunity?.clientName}
                </h4>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  opportunity?.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                  opportunity?.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  opportunity?.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                }`}>
                  {opportunity?.priority === 'urgent' ? 'Urgente' :
                   opportunity?.priority === 'high' ? 'Alta' :
                   opportunity?.priority === 'medium' ? 'Media' : 'Baja'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2 mb-2">
                <Icon 
                  name={opportunity?.contactChannel === 'whatsapp' ? 'MessageCircle' : 'Mail'} 
                  size={12} 
                  className="text-muted-foreground" 
                />
                <span className="text-xs text-muted-foreground capitalize">
                  {opportunity?.contactChannel}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${
                  opportunity?.projectType === 'project' ?'bg-blue-100 text-blue-800' :'bg-purple-100 text-purple-800'
                }`}>
                  {opportunity?.projectType === 'project' ? 'Proyecto' : 'Pieza'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="User" size={12} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{opportunity?.salesRep}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Icon name="Clock" size={12} className="text-muted-foreground" />
                  <span className={`text-xs font-medium ${getDurationColor(opportunity?.stageDuration)}`}>
                    {opportunity?.stageDuration} días
                  </span>
                </div>
              </div>

              {opportunity?.workOrderGenerated && (
                <div className="flex items-center space-x-1 mt-2">
                  <Icon name="CheckCircle2" size={12} className="text-green-600" />
                  <span className="text-xs text-green-600">Orden generada</span>
                </div>
              )}

              {opportunity?.projectDetails?.estimatedBudget && (
                <div className="flex items-center space-x-1 mt-2">
                  <Icon name="DollarSign" size={12} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    ${opportunity?.projectDetails?.estimatedBudget?.toLocaleString('es-MX')}
                  </span>
                </div>
              )}
            </div>
          );
        };

        export default OpportunityCard;