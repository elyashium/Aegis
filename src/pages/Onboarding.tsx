import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useOnboarding } from '../contexts/OnboardingContext';
import Layout from '../components/Layout';
import OnboardingUserType from '../components/onboarding/OnboardingUserType';
import OnboardingStartupProfile from '../components/onboarding/OnboardingStartupProfile';
import OnboardingStartupGoals from '../components/onboarding/OnboardingStartupGoals';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

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

  // Calculate current step for progress indicator
  const getCurrentStep = () => {
    if (!onboardingState.userType) {
      return 1;
    }
    
    if (onboardingState.userType === 'established_business') {
      return onboardingState.onboardingStep + 2; // Step 1 (user type) + current step index + 1
    }
    
    return 1;
  };
  
  const totalSteps = 3; // User Type, Startup Profile, Goals
  const currentStep = getCurrentStep();

  return (
    <Layout hideFooter>
      <div className="min-h-screen flex flex-col items-center justify-center py-12">
        <div className="container-custom max-w-2xl">
          {/* Progress indicator */}
          <div className="mb-6 px-4">
            <div className="flex items-center justify-between">
              {[...Array(totalSteps)].map((_, index) => (
                <React.Fragment key={index}>
                  {/* Step circle */}
                  <div className="flex flex-col items-center">
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center
                        ${index + 1 < currentStep 
                          ? 'bg-teal-600 text-white' 
                          : index + 1 === currentStep 
                            ? 'bg-teal-100 border-2 border-teal-600 text-teal-800' 
                            : 'bg-beige-100 text-text-tertiary'
                        }`}
                    >
                      {index + 1 < currentStep ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <span className="text-xs mt-1 text-text-secondary">
                      {index === 0 ? 'Type' : index === 1 ? 'Profile' : 'Goals'}
                    </span>
                  </div>
                  
                  {/* Connector line (except after last step) */}
                  {index < totalSteps - 1 && (
                    <div 
                      className={`flex-1 h-1 mx-2
                        ${index + 1 < currentStep ? 'bg-teal-600' : 'bg-beige-200'}`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          
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