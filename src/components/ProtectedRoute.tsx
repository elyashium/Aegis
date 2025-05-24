import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useOnboarding } from '../contexts/OnboardingContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { onboardingState } = useOnboarding();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // First, check if the user is authenticated
    if (!authLoading && !user) {
      navigate('/login', { replace: true });
      return;
    }

    // Then, check if we need to redirect based on onboarding status
    if (!authLoading && user && !onboardingState.isLoading) {
      const isOnboardingRoute = location.pathname === '/onboarding';
      
      // If user is not onboarded and not on the onboarding route, redirect to onboarding
      if (!onboardingState.isOnboarded && !isOnboardingRoute) {
        console.log('User needs onboarding, redirecting to onboarding page');
        navigate('/onboarding', { replace: true });
        return;
      }
      
      // If user is already onboarded but on the onboarding route, redirect to appropriate page
      if (onboardingState.isOnboarded && isOnboardingRoute) {
        console.log('User already onboarded, redirecting to appropriate page');
        if (onboardingState.dashboardCreated) {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/chat', { replace: true });
        }
        return;
      }
    }
  }, [user, authLoading, onboardingState.isOnboarded, onboardingState.isLoading, onboardingState.dashboardCreated, navigate, location.pathname]);

  // Show loading state when auth or onboarding data is loading
  if (authLoading || onboardingState.isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-beige-50">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-beige-200 border-t-teal-600 mx-auto"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  // If we're on the onboarding route and the user is not onboarded, or
  // if we're not on the onboarding route and the user is onboarded,
  // render the children
  return user ? <>{children}</> : null;
};

export default ProtectedRoute;