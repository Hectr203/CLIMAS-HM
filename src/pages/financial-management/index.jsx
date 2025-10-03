import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import ExpenseTrackingTable from './components/ExpenseTrackingTable';
import FinancialSummaryWidget from './components/FinancialSummaryWidget';
import FilterControls from './components/FilterControls';
import PaymentAuthorizationModal from './components/PaymentAuthorizationModal';
import ReceiptManagementPanel from './components/ReceiptManagementPanel';
import NewExpenseModal from './components/NewExpenseModal';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const FinancialManagement = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('expenses');
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showNewExpenseModal, setShowNewExpenseModal] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [summaryData, setSummaryData] = useState({});

  // Mock data for expenses
  const mockExpenses = [
    {
      id: 1,
      date: '15/12/2024',
      time: '14:30',
      category: 'Viajes',
      description: 'Viáticos para instalación en Torre Corporativa',
      amount: '$2,450.00',
      currency: 'MXN',
      status: 'Pendiente',
      project: 'Torre Corporativa',
      projectCode: 'HVAC-2024-001',
      vendor: 'Hotel Ejecutivo',
      requestedBy: 'Carlos Mendoza'
    },
    {
      id: 2,
      date: '14/12/2024',
      time: '09:15',
      category: 'Materiales',
      description: 'Compra de tubería de cobre para sistema HVAC',
      amount: '$15,750.00',
      currency: 'MXN',
      status: 'Aprobado',
      project: 'Centro Comercial',
      projectCode: 'HVAC-2024-002',
      vendor: 'Materiales Industriales SA',
      requestedBy: 'Ana García'
    },
    {
      id: 3,
      date: '13/12/2024',
      time: '16:45',
      category: 'Nómina',
      description: 'Pago de horas extra - Proyecto Hospital',
      amount: '$8,920.00',
      currency: 'MXN',
      status: 'En Revisión',
      project: 'Hospital Regional',
      projectCode: 'HVAC-2024-003',
      vendor: null,
      requestedBy: 'Luis Rodríguez'
    },
    {
      id: 4,
      date: '12/12/2024',
      time: '11:20',
      category: 'Proveedores',
      description: 'Servicio de mantenimiento preventivo equipos',
      amount: '$4,200.00',
      currency: 'MXN',
      status: 'Aprobado',
      project: 'Complejo Industrial',
      projectCode: 'HVAC-2024-004',
      vendor: 'Servicios Técnicos Pro',
      requestedBy: 'María López'
    },
    {
      id: 5,
      date: '11/12/2024',
      time: '13:10',
      category: 'Equipos',
      description: 'Renta de grúa para instalación de unidades',
      amount: '$3,500.00',
      currency: 'MXN',
      status: 'Rechazado',
      project: 'Torre Corporativa',
      projectCode: 'HVAC-2024-001',
      vendor: 'Grúas y Equipos MX',
      requestedBy: 'Pedro Sánchez'
    }
  ];

  // Mock data for financial summary
  const mockSummaryData = {
    totalRevenue: 2450000,
    totalExpenses: 1890000,
    netMargin: 560000,
    marginPercentage: 22.8,
    revenueVariance: 8.5,
    expenseVariance: -3.2,
    marginVariance: 12.1,
    pendingApprovals: 12,
    pendingAmount: 45600,
    monthlyExpenses: [
      { month: 'Ene', amount: 145000 },
      { month: 'Feb', amount: 162000 },
      { month: 'Mar', amount: 178000 },
      { month: 'Abr', amount: 155000 },
      { month: 'May', amount: 189000 },
      { month: 'Jun', amount: 201000 }
    ],
    expenseCategories: [
      { name: 'Materiales', value: 450000 },
      { name: 'Nómina', value: 380000 },
      { name: 'Viajes', value: 120000 },
      { name: 'Equipos', value: 95000 },
      { name: 'Servicios', value: 75000 }
    ]
  };

  // Mock data for receipts
  const mockReceipts = [
    {
      id: 1,
      name: 'factura_materiales_001.pdf',
      size: 245760,
      type: 'application/pdf',
      uploadDate: '15/12/2024',
      category: 'Materiales',
      status: 'Procesado',
      url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400'
    },
    {
      id: 2,
      name: 'recibo_hotel_ejecutivo.jpg',
      size: 1048576,
      type: 'image/jpeg',
      uploadDate: '14/12/2024',
      category: 'Viajes',
      status: 'En Revisión',
      url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400'
    },
    {
      id: 3,
      name: 'nomina_diciembre.xlsx',
      size: 512000,
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      uploadDate: '13/12/2024',
      category: 'Nómina',
      status: 'Pendiente',
      url: '#'
    }
  ];

  useEffect(() => {
    setExpenses(mockExpenses);
    setReceipts(mockReceipts);
    setSummaryData(mockSummaryData);
  }, []);

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleHeaderMenuToggle = () => {
    setHeaderMenuOpen(!headerMenuOpen);
  };

  const handleApproveExpense = (expenseId) => {
    setExpenses(prev => prev?.map(expense => 
      expense?.id === expenseId 
        ? { ...expense, status: 'Aprobado' }
        : expense
    ));
  };

  const handleRejectExpense = (expenseId) => {
    setExpenses(prev => prev?.map(expense => 
      expense?.id === expenseId 
        ? { ...expense, status: 'Rechazado' }
        : expense
    ));
  };

  const handleViewExpenseDetails = (expense) => {
    setSelectedExpense(expense);
    setShowAuthModal(true);
  };

  const handleAuthorizePayment = async (authData) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setExpenses(prev => prev?.map(expense => 
      expense?.id === authData?.expenseId 
        ? { ...expense, status: 'Autorizado', authorizationLevel: authData?.authorizationLevel }
        : expense
    ));
    
    setShowAuthModal(false);
    setSelectedExpense(null);
  };

  const handleFiltersChange = (filters) => {
    // Apply filters to expenses
    console.log('Filters applied:', filters);
  };

  const handleExportData = () => {
    // Export functionality
    console.log('Exporting financial data...');
  };

  const handleResetFilters = (resetFilters) => {
    console.log('Filters reset:', resetFilters);
  };

  const handleUploadReceipt = async (receipt) => {
    setReceipts(prev => [...prev, receipt]);
  };

  const handleDeleteReceipt = (receiptId) => {
    setReceipts(prev => prev?.filter(receipt => receipt?.id !== receiptId));
  };

  const handleCategorizeReceipt = (receiptId, category) => {
    setReceipts(prev => prev?.map(receipt => 
      receipt?.id === receiptId 
        ? { ...receipt, category, status: 'Procesado' }
        : receipt
    ));
  };

  const handleAddNewExpense = (expenseData) => {
    setExpenses(prev => [expenseData, ...prev]);
    setShowNewExpenseModal(false);
  };

  const handleNewExpenseClick = () => {
    setShowNewExpenseModal(true);
    setActiveTab('expenses'); // Ensure we're on the expenses tab
  };

  const tabs = [
    { id: 'expenses', label: 'Seguimiento de Gastos', icon: 'Receipt' },
    { id: 'summary', label: 'Resumen Financiero', icon: 'BarChart3' },
    { id: 'receipts', label: 'Gestión de Recibos', icon: 'FileText' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onMenuToggle={handleHeaderMenuToggle}
        isMenuOpen={headerMenuOpen}
      />
      <Sidebar 
        isCollapsed={sidebarCollapsed}
        onToggle={handleSidebarToggle}
      />
      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'} pt-16`}>
        <div className="p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <Breadcrumb />
              <div className="mt-2">
                <h1 className="text-2xl font-bold text-foreground">Gestión Financiera</h1>
                <p className="text-muted-foreground">
                  Control integral de gastos, autorizaciones y reportes financieros
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleExportData}
                iconName="Download"
                iconPosition="left"
              >
                Exportar Reporte
              </Button>
              <Button
                variant="default"
                onClick={handleNewExpenseClick}
                iconName="Plus"
                iconPosition="left"
              >
                Nuevo Gasto
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-border">
            <nav className="flex space-x-8">
              {tabs?.map((tab) => (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-smooth ${
                    activeTab === tab?.id
                      ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                  }`}
                >
                  <Icon name={tab?.icon} size={16} />
                  <span>{tab?.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'expenses' && (
              <>
                <FilterControls
                  onFiltersChange={handleFiltersChange}
                  onReset={handleResetFilters}
                  onExport={handleExportData}
                />
                <ExpenseTrackingTable
                  expenses={expenses}
                  onApprove={handleApproveExpense}
                  onReject={handleRejectExpense}
                  onViewDetails={handleViewExpenseDetails}
                />
              </>
            )}

            {activeTab === 'summary' && (
              <FinancialSummaryWidget summaryData={summaryData} />
            )}

            {activeTab === 'receipts' && (
              <ReceiptManagementPanel
                receipts={receipts}
                onUpload={handleUploadReceipt}
                onDelete={handleDeleteReceipt}
                onCategorize={handleCategorizeReceipt}
              />
            )}
          </div>
        </div>
      </main>
      {/* Payment Authorization Modal */}
      <PaymentAuthorizationModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setSelectedExpense(null);
        }}
        expense={selectedExpense}
        onAuthorize={handleAuthorizePayment}
      />

      {/* New Expense Modal */}
      <NewExpenseModal
        isOpen={showNewExpenseModal}
        onClose={() => setShowNewExpenseModal(false)}
        onSubmit={handleAddNewExpense}
      />
    </div>
  );
};

export default FinancialManagement;