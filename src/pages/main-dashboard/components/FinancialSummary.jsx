import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FinancialSummary = () => {
  const [activeView, setActiveView] = useState('monthly');

  const monthlyData = [
    { month: 'Ene', ingresos: 450000, gastos: 320000, margen: 130000 },
    { month: 'Feb', ingresos: 520000, gastos: 380000, margen: 140000 },
    { month: 'Mar', ingresos: 480000, gastos: 350000, margen: 130000 },
    { month: 'Abr', ingresos: 610000, gastos: 420000, margen: 190000 },
    { month: 'May', ingresos: 580000, gastos: 400000, margen: 180000 },
    { month: 'Jun', ingresos: 650000, gastos: 450000, margen: 200000 },
    { month: 'Jul', ingresos: 720000, gastos: 480000, margen: 240000 },
    { month: 'Ago', ingresos: 680000, gastos: 460000, margen: 220000 },
    { month: 'Sep', ingresos: 750000, gastos: 520000, margen: 230000 }
  ];

  const expenseBreakdown = [
    { name: 'Nómina', value: 280000, color: '#2563EB' },
    { name: 'Materiales', value: 150000, color: '#059669' },
    { name: 'Viáticos', value: 45000, color: '#F59E0B' },
    { name: 'Equipos', value: 30000, color: '#DC2626' },
    { name: 'Otros', value: 15000, color: '#64748B' }
  ];

  const financialMetrics = [
    {
      title: 'Ingresos Mensuales',
      value: '$750,000',
      change: '+12.5%',
      changeType: 'positive',
      icon: 'TrendingUp'
    },
    {
      title: 'Gastos Operativos',
      value: '$520,000',
      change: '+8.2%',
      changeType: 'negative',
      icon: 'TrendingDown'
    },
    {
      title: 'Margen de Ganancia',
      value: '$230,000',
      change: '+18.7%',
      changeType: 'positive',
      icon: 'DollarSign'
    },
    {
      title: 'Flujo de Efectivo',
      value: '$1,250,000',
      change: '+5.3%',
      changeType: 'positive',
      icon: 'Wallet'
    }
  ];

  const getChangeColor = (changeType) => {
    if (changeType === 'positive') return 'text-success';
    if (changeType === 'negative') return 'text-error';
    return 'text-muted-foreground';
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    })?.format(value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-popover-foreground">{label}</p>
          {payload?.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry?.color }}>
              {entry?.name}: {formatCurrency(entry?.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {financialMetrics?.map((metric, index) => (
          <div key={index} className="bg-card border border-border rounded-lg p-6 card-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <Icon name={metric?.icon} size={24} color="white" />
              </div>
              <div className={`flex items-center space-x-1 ${getChangeColor(metric?.changeType)}`}>
                <Icon 
                  name={metric?.changeType === 'positive' ? 'TrendingUp' : 'TrendingDown'} 
                  size={16} 
                />
                <span className="text-sm font-medium">{metric?.change}</span>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-1">{metric?.value}</h3>
              <p className="text-sm text-muted-foreground">{metric?.title}</p>
            </div>
          </div>
        ))}
      </div>
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-card border border-border rounded-lg card-shadow">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Análisis Financiero</h3>
                <p className="text-sm text-muted-foreground">Ingresos vs Gastos mensuales</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant={activeView === 'monthly' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('monthly')}
                >
                  Mensual
                </Button>
                <Button
                  variant={activeView === 'quarterly' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('quarterly')}
                >
                  Trimestral
                </Button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="w-full h-80" aria-label="Gráfico de Análisis Financiero">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis 
                    dataKey="month" 
                    stroke="var(--color-muted-foreground)"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="var(--color-muted-foreground)"
                    fontSize={12}
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="ingresos" fill="var(--color-primary)" name="Ingresos" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="gastos" fill="var(--color-error)" name="Gastos" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="margen" fill="var(--color-success)" name="Margen" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-card border border-border rounded-lg card-shadow">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Distribución de Gastos</h3>
                <p className="text-sm text-muted-foreground">Septiembre 2024</p>
              </div>
              <Button variant="ghost" size="icon">
                <Icon name="Download" size={20} />
              </Button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="w-full h-80" aria-label="Gráfico de Distribución de Gastos">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expenseBreakdown?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry?.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value), 'Monto']}
                    labelStyle={{ color: 'var(--color-foreground)' }}
                    contentStyle={{ 
                      backgroundColor: 'var(--color-popover)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 space-y-2">
              {expenseBreakdown?.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item?.color }}
                    />
                    <span className="text-sm text-foreground">{item?.name}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {formatCurrency(item?.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialSummary;