import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from './AuthContext';

// User type definitions
export type UserType = 'new_idea' | 'established_business' | null;

// Startup profile definition
export interface StartupProfile {
  companyName?: string;
  entityType?: string; 
  industry?: string;
  location?: string;
  stage?: string;
  keyConcerns?: string[];
  goals?: string;
}

// Onboarding state definition
interface OnboardingState {
  isOnboarded: boolean;
  userType: UserType;
  startupProfile: StartupProfile;
  onboardingStep: number;
  dashboardCreated: boolean;
  isLoading: boolean;
}

// Context properties
interface OnboardingContextProps {
  onboardingState: OnboardingState;
  setUserType: (type: UserType) => void;
  setStartupProfile: (profile: StartupProfile) => void;
  updateStartupProfile: (updates: Partial<StartupProfile>) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetOnboarding: () => void;
  completeOnboarding: () => Promise<void>;
  createDashboard: () => Promise<void>;
  setDashboardCreated: (created: boolean) => void;
}

// Initial state
const initialState: OnboardingState = {
  isOnboarded: false,
  userType: null,
  startupProfile: {},
  onboardingStep: 0,
  dashboardCreated: false,
  isLoading: true,
};

// Create context
const OnboardingContext = createContext<OnboardingContextProps | undefined>(undefined);

// Hook for using the context
export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

// Provider component
export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [onboardingState, setOnboardingState] = useState<OnboardingState>(initialState);
  const { user } = useAuth();

  // Load onboarding state from database when user changes
  useEffect(() => {
    const loadOnboardingState = async () => {
      if (!user) {
        setOnboardingState({...initialState, isLoading: false});
        return;
      }

      try {
        console.log('Loading onboarding state for user:', user.id);
        setOnboardingState(prev => ({...prev, isLoading: true}));
        
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') { // Not found
            console.log('No user profile found, user needs onboarding');
            // Create a new profile entry but don't mark as onboarded yet
            await supabase.from('user_profiles').insert({
              user_id: user.id,
              is_onboarded: false,
              dashboard_created: false,
              created_at: new Date().toISOString()
            });
            setOnboardingState({
              ...initialState,
              isLoading: false
            });
          } else {
            console.error('Error loading onboarding state:', error);
            setOnboardingState(prev => ({...prev, isLoading: false}));
          }
          return;
        }

        if (data) {
          console.log('User profile found:', data);
          setOnboardingState({
            isOnboarded: data.is_onboarded || false,
            userType: data.user_type as UserType,
            startupProfile: {
              companyName: data.company_name || '',
              entityType: data.entity_type || '',
              industry: data.industry || '',
              location: data.location || '',
              stage: data.stage || '',
              keyConcerns: data.key_concerns || [],
              goals: data.goals || '',
            },
            onboardingStep: 0, // Reset step when loading
            dashboardCreated: data.dashboard_created || false,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Unexpected error loading onboarding state:', error);
        setOnboardingState(prev => ({...prev, isLoading: false}));
      }
    };

    loadOnboardingState();
  }, [user]);

  // Set user type
  const setUserType = (type: UserType) => {
    setOnboardingState(prev => ({ ...prev, userType: type }));
  };

  // Set full startup profile
  const setStartupProfile = (profile: StartupProfile) => {
    setOnboardingState(prev => ({ ...prev, startupProfile: profile }));
  };

  // Update specific fields in the startup profile
  const updateStartupProfile = (updates: Partial<StartupProfile>) => {
    setOnboardingState(prev => ({
      ...prev,
      startupProfile: { ...prev.startupProfile, ...updates },
    }));
  };

  // Move to next step
  const nextStep = () => {
    setOnboardingState(prev => ({ ...prev, onboardingStep: prev.onboardingStep + 1 }));
  };

  // Move to previous step
  const prevStep = () => {
    setOnboardingState(prev => ({ ...prev, onboardingStep: Math.max(0, prev.onboardingStep - 1) }));
  };

  // Reset onboarding
  const resetOnboarding = () => {
    setOnboardingState({...initialState, isLoading: false});
  };

  // Mark onboarding as complete and save to database
  const completeOnboarding = async () => {
    if (!user) return;

    try {
      console.log('Completing onboarding for user:', user.id);
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          is_onboarded: true,
          user_type: onboardingState.userType,
          company_name: onboardingState.startupProfile.companyName,
          entity_type: onboardingState.startupProfile.entityType,
          industry: onboardingState.startupProfile.industry,
          location: onboardingState.startupProfile.location,
          stage: onboardingState.startupProfile.stage,
          key_concerns: onboardingState.startupProfile.keyConcerns,
          goals: onboardingState.startupProfile.goals,
          dashboard_created: onboardingState.dashboardCreated,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) {
        console.error('Error saving onboarding state:', error);
        return;
      }

      setOnboardingState(prev => ({ ...prev, isOnboarded: true }));
      console.log('Onboarding completed successfully');
    } catch (error) {
      console.error('Unexpected error completing onboarding:', error);
    }
  };

  // Create user dashboard based on API response
  const createDashboard = async () => {
    if (!user) return;

    try {
      console.log('Creating dashboard for user:', user.id);
      // Here we would call the API endpoint to generate dashboard content
      // This is a placeholder for the actual API call
      
      // Mark dashboard as created
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          dashboard_created: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating dashboard status:', error);
        return;
      }

      setOnboardingState(prev => ({ ...prev, dashboardCreated: true }));
      console.log('Dashboard created successfully');
    } catch (error) {
      console.error('Unexpected error creating dashboard:', error);
    }
  };

  // Set dashboard created status
  const setDashboardCreated = (created: boolean) => {
    setOnboardingState(prev => ({ ...prev, dashboardCreated: created }));
  };

  const value = {
    onboardingState,
    setUserType,
    setStartupProfile,
    updateStartupProfile,
    nextStep,
    prevStep,
    resetOnboarding,
    completeOnboarding,
    createDashboard,
    setDashboardCreated,
  };

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}; 