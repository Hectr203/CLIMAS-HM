

import React from "react";
import Routes from "./Routes";
import { AuthProvider } from "./hooks/useAuth.jsx";

import { NotificationProvider } from "./context/NotificationContext.jsx";
import NotificationContainer from "./ui/NotificationContainer";
import { BrowserRouter } from "react-router-dom";
import { ConfirmDialogProvider } from "./ui/ConfirmDialogContext.jsx";
import "./styles/index.css";
import "./styles/tailwind.css";


function App() {
  return (
    <NotificationProvider>
      <NotificationContainer />
      <ConfirmDialogProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes />
          </AuthProvider>
        </BrowserRouter>
      </ConfirmDialogProvider>
    </NotificationProvider>
  );
}

export default App;