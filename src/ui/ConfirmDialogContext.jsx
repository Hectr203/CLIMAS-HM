import React, { createContext, useContext, useState, useCallback } from 'react';
import ConfirmDialog from './ConfirmDialog';

const ConfirmDialogContext = createContext();

export const useConfirmDialog = () => useContext(ConfirmDialogContext);

export const ConfirmDialogProvider = ({ children }) => {
  const [dialog, setDialog] = useState({ open: false });

  const showConfirm = useCallback(({ title, message, confirmText, cancelText }) => {
    return new Promise((resolve) => {
      setDialog({
        open: true,
        title,
        message,
        confirmText,
        cancelText,
        onConfirm: () => {
          setDialog({ open: false });
          resolve(true);
        },
        onCancel: () => {
          setDialog({ open: false });
          resolve(false);
        },
      });
    });
  }, []);

  return (
    <ConfirmDialogContext.Provider value={{ showConfirm }}>
      {children}
      <ConfirmDialog {...dialog} />
    </ConfirmDialogContext.Provider>
  );
};
