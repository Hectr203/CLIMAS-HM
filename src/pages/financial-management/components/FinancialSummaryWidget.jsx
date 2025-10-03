import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';

const FinancialSummaryWidget = ({ summaryData }) => {
  const COLORS = ['#2563EB', '#059669', '#F59E0B', '#DC2626', '#8B5CF6'];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    })?.format(amount);
  };

  const getVarianceColor = (variance) => {
    if (variance > 0) return 'text-success';
    if (variance < 0) return 'text-error';
    return 'text-muted-foreground';
  };

  const getVarianceIcon = (variance) => {
    if (variance > 0) return 'TrendingUp';
    if (variance < 0) return 'TrendingDown';
    return 'Minus';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Financial Overview Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Resumen Financiero</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ingresos Totales</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(summaryData?.totalRevenue)}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <Icon 
                    name={getVarianceIcon(summaryData?.revenueVariance)} 
                    size={14} 
                    className={getVarianceColor(summaryData?.revenueVariance)}
                  />
                  <span className={`text-xs ${getVarianceColor(summaryData?.revenueVariance)}`}>
                    {summaryData?.revenueVariance > 0 ? '+' : ''}{summaryData?.revenueVariance}%
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <Icon name="TrendingUp" size={24} className="text-success" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gastos Totales</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(summaryData?.totalExpenses)}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <Icon 
                    name={getVarianceIcon(summaryData?.expenseVariance)} 
                    size={14} 
                    className={getVarianceColor(-summaryData?.expenseVariance)}
                  />
                  <span className={`text-xs ${getVarianceColor(-summaryData?.expenseVariance)}`}>
                    {summaryData?.expenseVariance > 0 ? '+' : ''}{summaryData?.expenseVariance}%
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-error/10 rounded-lg flex items-center justify-center">
                <Icon name="TrendingDown" size={24} className="text-error" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Margen Neto</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(summaryData?.netMargin)}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <Icon 
                    name={getVarianceIcon(summaryData?.marginVariance)} 
                    size={14} 
                    className={getVarianceColor(summaryData?.marginVariance)}
                  />
                  <span className={`text-xs ${getVarianceColor(summaryData?.marginVariance)}`}>
                    {summaryData?.marginPercentage}% del total
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon name="DollarSign" size={24} className="text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendientes Aprobación</p>
                <p className="text-2xl font-bold text-foreground">{summaryData?.pendingApprovals}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <Icon name="Clock" size={14} className="text-warning" />
                  <span className="text-xs text-warning">
                    {formatCurrency(summaryData?.pendingAmount)}
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                <Icon name="Clock" size={24} className="text-warning" />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Charts Section */}
      <div className="space-y-6">
        {/* Monthly Expenses Chart */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h4 className="text-md font-semibold text-foreground mb-4">Gastos Mensuales</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summaryData?.monthlyExpenses}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis 
                  dataKey="month" 
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  tickFormatter={(value) => `$${(value / 1000)?.toFixed(0)}K`}
                />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), 'Gastos']}
                  labelStyle={{ color: 'var(--color-foreground)' }}
                  contentStyle={{ 
                    backgroundColor: 'var(--color-popover)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '6px'
                  }}
                />
                <Bar dataKey="amount" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Categories Pie Chart */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h4 className="text-md font-semibold text-foreground mb-4">Distribución por Categoría</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summaryData?.expenseCategories}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {summaryData?.expenseCategories?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS?.[index % COLORS?.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), 'Monto']}
                  contentStyle={{ 
                    backgroundColor: 'var(--color-popover)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '6px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {summaryData?.expenseCategories?.map((category, index) => (
              <div key={category?.name} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS?.[index % COLORS?.length] }}
                />
                <span className="text-xs text-muted-foreground">{category?.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialSummaryWidget;