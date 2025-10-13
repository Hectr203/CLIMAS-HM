

import React from "react";
import Routes from "./Routes";
import { AuthProvider } from "./hooks/useAuth.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import NotificationContainer from "./ui/NotificationContainer";
import { BrowserRouter } from "react-router-dom";
import "./styles/index.css";
import "./styles/tailwind.css";


function App() {
  return (
    <NotificationProvider>
      <NotificationContainer />
      <BrowserRouter>
        <AuthProvider>
          <Routes />
        </AuthProvider>
      </BrowserRouter>
    </NotificationProvider>
  );
}

export default App;