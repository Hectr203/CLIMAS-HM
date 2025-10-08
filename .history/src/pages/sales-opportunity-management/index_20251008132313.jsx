import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  ClientRegistrationPanel,
  CommunicationPanel,
  QuotationRequestPanel,
  WorkOrderPanel,
  ChangeManagementPanel,
} from "@/components/panels";

export default function OportunidadesDashboard({
  salesStages,
  opportunities,
  handleClientRegistration,
  handleCommunicationAdd,
  handleQuotationUpdate,
  handleWorkOrderGeneration,
  handleStageTransition,
}) {
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [showControls, setShowControls] = useState(false);

  const handleSelectOpportunity = (opportunity) => {
    setSelectedOpportunity(opportunity);
    setShowControls(true);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 relative h-full overflow-hidden">
      {/* Main Kanban Board */}
      <div
        className={`flex-1 transition-all duration-300 ${
          showControls ? "lg:pr-[26rem]" : ""
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 mb-8">
          {salesStages?.map((stage) => (
            <div
              key={stage?.id}
              className="bg-card rounded-lg shadow-lg border p-4 flex flex-col"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">{stage?.name}</h3>
                <Icon name={stage?.icon} className="w-4 h-4 text-muted-foreground" />
              </div>

              <div className="space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/40 scrollbar-track-transparent max-h-[70vh]">
                {opportunities
                  ?.filter((opp) => opp?.stage === stage?.id)
                  ?.map((opp) => (
                    <motion.div
                      key={opp?.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => handleSelectOpportunity(opp)}
                      className={`p-3 rounded-md cursor-pointer border transition-all ${
                        selectedOpportunity?.id === opp?.id
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/40"
                      }`}
                    >
                      <p className="font-medium text-sm">{opp?.clientName}</p>
                      <p className="text-xs text-muted-foreground">
                        {opp?.description || "Sin descripción"}
                      </p>
                    </motion.div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Panel lateral responsivo y animado */}
      <AnimatePresence>
        {showControls && (
          <>
            {/* Fondo semitransparente para móviles */}
            <motion.div
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowControls(false)}
            />

            {/* Panel lateral */}
            <motion.div
              key="control-panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="
                fixed inset-x-0 bottom-0 top-[4rem] z-50
                w-full max-w-md lg:max-w-xs lg:static lg:inset-auto
                bg-card rounded-t-2xl lg:rounded-lg shadow-xl lg:shadow-lg border
                overflow-y-auto transition-all duration-300
              "
            >
              {/* Header del panel */}
              <div className="p-4 border-b sticky top-0 bg-card z-10 flex items-center justify-between">
                <h3 className="font-semibold">Controles de Oportunidad</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="X"
                  onClick={() => setShowControls(false)}
                />
              </div>

              {/* Contenido del panel */}
              <div className="p-4 space-y-6">
                {selectedOpportunity && (
                  <>
                    {/* Información del cliente */}
                    <div>
                      <h4 className="font-medium mb-2">
                        {selectedOpportunity?.clientName}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedOpportunity?.id}
                      </p>
                    </div>

                    {/* Panel de registro de cliente */}
                    {selectedOpportunity?.stage === "initial-contact" && (
                      <ClientRegistrationPanel
                        opportunity={selectedOpportunity}
                        onRegister={(clientData) =>
                          handleClientRegistration(
                            selectedOpportunity?.id,
                            clientData
                          )
                        }
                      />
                    )}

                    {/* Panel de comunicación */}
                    <CommunicationPanel
                      opportunity={selectedOpportunity}
                      onAddCommunication={(communication) =>
                        handleCommunicationAdd(
                          selectedOpportunity?.id,
                          communication
                        )
                      }
                    />

                    {/* Panel de cotización */}
                    {(selectedOpportunity?.stage === "quotation-development" ||
                      selectedOpportunity?.quotationData) && (
                      <QuotationRequestPanel
                        opportunity={selectedOpportunity}
                        onUpdate={(quotationData) =>
                          handleQuotationUpdate(
                            selectedOpportunity?.id,
                            quotationData
                          )
                        }
                      />
                    )}

                    {/* Panel de orden de trabajo */}
                    {selectedOpportunity?.stage === "closure" &&
                      selectedOpportunity?.quotationData?.approved && (
                        <WorkOrderPanel
                          opportunity={selectedOpportunity}
                          onGenerateWorkOrder={(workOrderData) =>
                            handleWorkOrderGeneration(
                              selectedOpportunity?.id,
                              workOrderData
                            )
                          }
                        />
                      )}

                    {/* Panel de gestión de cambios */}
                    {selectedOpportunity?.stage !== "initial-contact" && (
                      <ChangeManagementPanel
                        opportunity={selectedOpportunity}
                        onRequestChange={(changeData) =>
                          console.log("Cambio solicitado:", changeData)
                        }
                      />
                    )}

                    {/* Avanzar etapa */}
                    <div className="space-y-2 pb-4">
                      <label className="text-sm font-medium">
                        Avanzar Etapa
                      </label>
                      <div className="grid grid-cols-1 gap-2">
                        {salesStages?.map((stage) => (
                          <Button
                            key={stage?.id}
                            variant={
                              selectedOpportunity?.stage === stage?.id
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() =>
                              handleStageTransition(
                                selectedOpportunity?.id,
                                stage?.id
                              )
                            }
                            disabled={
                              selectedOpportunity?.stage === stage?.id
                            }
                            className="text-xs justify-start"
                          >
                            <Icon
                              name={stage?.icon}
                              size={14}
                              className="mr-2"
                            />
                            {stage?.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
