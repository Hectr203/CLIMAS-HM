import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { useAuth } from '../../hooks/useAuth';
import useUsers from '../../hooks/useUsers';
import UserFormModal from './components/UserFormModal';
import UserTable from './components/UserTable';

const UserManagement = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const { user } = useAuth();
  const { users, loading, createUser, updateUser } = useUsers();

  if (!user?.rol?.toLowerCase().includes('admin')) return null;

  const handleCreateUser = () => {
    setSelectedUser(null); // Asegurar que no hay usuario seleccionado
    setIsModalOpen(true);
  };
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setSelectedUser(null); // Limpiar usuario seleccionado al cerrar
    setIsModalOpen(false);
  };
  const handleSaveUser = async (userData) => {
    try {
      if (selectedUser) {
        await updateUser(selectedUser.id, userData);
      } else {
        await createUser(userData);
      }
      handleCloseModal(); // Usar función de cierre que limpia
    } catch (error) {
      console.error('Error al guardar usuario:', error);
    }
  };

  // Loading state with full layout
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar 
          isCollapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-60'}`}>
          <Header 
            onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
            isMenuOpen={mobileMenuOpen}
          />
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando usuarios...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-60'}`}>
        <Header 
          onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          isMenuOpen={mobileMenuOpen}
        />

        <div className="">
          <div className="container mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <div className="mb-6">
              <Breadcrumb />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Gestión de Usuarios</h1>
                <p className="text-muted-foreground">
                  Administra usuarios, roles y permisos del sistema
                </p>
              </div>
              <Button
                variant="default"
                onClick={handleCreateUser}
                iconName="Plus"
                iconPosition="left"
              >
                Crear Usuario
              </Button>
            </div>

            {/* User Table */}
            <UserTable
              users={users}
              onEditUser={handleEditUser}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      {isModalOpen && (
        <UserFormModal
          user={selectedUser}
          onClose={handleCloseModal}
          onSave={handleSaveUser}
        />
      )}
    </div>
  );
};

export default UserManagement;
