import React from 'react';
import { Route, Routes } from 'react-router-dom';

// Import pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Onboarding from './pages/Onboarding';

// Import components
import ProtectedRoute from './components/ProtectedRoute';

// Import providers
import { OnboardingProvider } from './contexts/OnboardingContext';

function App() {
  return (
    <OnboardingProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected routes */}
        <Route 
          path="/onboarding" 
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/chat" 
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </OnboardingProvider>
  );
}

export default App;