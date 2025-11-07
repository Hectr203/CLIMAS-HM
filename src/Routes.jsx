import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import ProtectedRoute from "components/ProtectedRoute";
import { ButtonHandlersProvider } from "./components/GlobalButtonHandlers";
import NotFound from "pages/NotFound";
import ProjectManagement from './pages/project-management';
import ProjectDetailGallery from './pages/project-detail-gallery';
import ProjectGalleryViewer from './pages/project-gallery-viewer';
import ProjectDocumentationCenter from './pages/project-documentation-center';
import ProjectWorkflowManagement from './pages/project-workflow-management';
import QuotationBuilder from './pages/quotation-builder';
import MainDashboard from './pages/main-dashboard';
import InventoryManagement from './pages/inventory-management';
import LoginPage from './pages/login';
import FinancialManagement from './pages/financial-management';
import PersonnelManagement from './pages/personnel-management';
import ClientManagement from './pages/client-management';
import WorkOrderProcessing from './pages/work-order-processing';
import WorkshopOperationsManagement from './pages/workshop-operations-management';
import WorkshopOperationsCenter from './pages/workshop-operations-center';
import SalesOpportunityManagement from './pages/sales-opportunity-management';
import QuotationDevelopmentCenter from './pages/quotation-development-center';
import SalesExecutionMonitoring from './pages/sales-execution-monitoring';
import ProjectAbonosManagement from './pages/project-abonos-management';

const Routes = () => {
  return (
    <ErrorBoundary>
      <ButtonHandlersProvider>
        <ScrollToTop />
        <RouterRoutes>
          {/* Public Route: Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Redirigir la raíz a login si no está autenticado */}
          <Route path="/" element={<LoginPage />} />
            <Route 
              path="/main-dashboard" 
              element={
                <ProtectedRoute requiredPath="/main-dashboard">
                  <MainDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/project-management" 
              element={
                <ProtectedRoute requiredPath="/project-management">
                  <ProjectManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/project-detail-gallery/:projectId" 
              element={
                <ProtectedRoute requiredPath="/project-detail-gallery">
                  <ProjectDetailGallery />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/project-gallery-viewer/:projectId" 
              element={
                <ProtectedRoute requiredPath="/project-gallery-viewer">
                  <ProjectGalleryViewer />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/project-documentation-center" 
              element={
                <ProtectedRoute requiredPath="/project-documentation-center">
                  <ProjectDocumentationCenter />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/project-workflow-management" 
              element={
                <ProtectedRoute requiredPath="/project-workflow-management">
                  <ProjectWorkflowManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/quotation-builder" 
              element={
                <ProtectedRoute requiredPath="/quotation-builder">
                  <QuotationBuilder />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/inventory-management" 
              element={
                <ProtectedRoute requiredPath="/inventory-management">
                  <InventoryManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/financial-management" 
              element={
                <ProtectedRoute requiredPath="/financial-management">
                  <FinancialManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/personnel-management" 
              element={
                <ProtectedRoute requiredPath="/personnel-management">
                  <PersonnelManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/client-management" 
              element={
                <ProtectedRoute requiredPath="/client-management">
                  <ClientManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/work-order-processing" 
              element={
                <ProtectedRoute requiredPath="/work-order-processing">
                  <WorkOrderProcessing />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/workshop-operations-management" 
              element={
                <ProtectedRoute requiredPath="/workshop-operations-management">
                  <WorkshopOperationsManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/workshop-operations-center" 
              element={
                <ProtectedRoute requiredPath="/workshop-operations-center">
                  <WorkshopOperationsCenter />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/sales-opportunity-management" 
              element={
                <ProtectedRoute requiredPath="/sales-opportunity-management">
                  <SalesOpportunityManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/quotation-development-center" 
              element={
                <ProtectedRoute requiredPath="/quotation-development-center">
                  <QuotationDevelopmentCenter />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/project-abonos-management" 
              element={
                <ProtectedRoute requiredPath="/project-abonos-management">
                  <ProjectAbonosManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/sales-execution-monitoring" 
              element={
                <ProtectedRoute requiredPath="/sales-execution-monitoring">
                  <SalesExecutionMonitoring />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFound />} />
          </RouterRoutes>
        </ButtonHandlersProvider>
      </ErrorBoundary>
  );
};

export default Routes;