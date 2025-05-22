import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useOnboarding } from '../contexts/OnboardingContext';
import Layout from '../components/Layout';
import OnboardingUserType from '../components/onboarding/OnboardingUserType';
import OnboardingStartupProfile from '../components/onboarding/OnboardingStartupProfile';
import OnboardingStartupGoals from '../components/onboarding/OnboardingStartupGoals';
import { motion } from 'framer-motion';

const Onboarding: React.FC = () => {
  const { user } = useAuth();
  const { onboardingState } = useOnboarding();
  
  // If user is already onboarded, redirect to chat or dashboard
  if (onboardingState.isOnboarded) {
    if (onboardingState.dashboardCreated) {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/chat" replace />;
    }
  }

  // Render the appropriate onboarding step
  const renderStep = () => {
    if (!onboardingState.userType) {
      return <OnboardingUserType />;
    }

    if (onboardingState.userType === 'established_business') {
      if (onboardingState.onboardingStep === 0) {
        return <OnboardingStartupProfile />;
      } else {
        return <OnboardingStartupGoals />;
      }
    } else {
      // For new_idea users, redirect them directly to chat
      return <Navigate to="/chat" replace />;
    }
  };

  return (
    <Layout hideFooter>
      <div className="min-h-screen flex items-center justify-center py-12">
        <div className="container-custom max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-lg shadow-custom p-8"
          >
            {renderStep()}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Onboarding; 