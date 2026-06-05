import React, { createContext, useContext } from 'react';
import { useAppAlertState } from '../hooks/useAppAlertState';

const AppAlertContext = createContext(null);

export function AppAlertProvider({ children }) {
  const alertApi = useAppAlertState();

  return (
    <AppAlertContext.Provider value={alertApi}>
      {children}
      <alertApi.AlertModals />
    </AppAlertContext.Provider>
  );
}

export function useAppAlert() {
  const ctx = useContext(AppAlertContext);
  if (!ctx) {
    throw new Error('useAppAlert harus dipakai di dalam AppAlertProvider');
  }
  return ctx;
}
