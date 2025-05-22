import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { ArrowLeft } from 'lucide-react';

const OnboardingStartupGoals: React.FC = () => {
  const { onboardingState, updateStartupProfile, prevStep, completeOnboarding, createDashboard } = useOnboarding();
  const [goals, setGoals] = useState(onboardingState.startupProfile.goals || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Update goals in the profile
      updateStartupProfile({ goals });
      
      // Mark onboarding as complete
      await completeOnboarding();
      
      // Create the dashboard based on the profile info
      await createDashboard();
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <button 
        onClick={prevStep}
        className="flex items-center text-text-secondary mb-8 hover:text-text-primary transition-colors"
      >
        <ArrowLeft size={16} className="mr-1" />
        <span>Back</span>
      </button>

      <h2 className="text-2xl font-playfair mb-2 text-text-primary">
        What are your legal objectives?
      </h2>
      <p className="text-text-secondary mb-8">
        Tell us what you want to accomplish with your startup regarding legal requirements
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="goals" className="block text-text-primary mb-2 text-sm font-medium">
            Your Legal Objectives
          </label>
          <textarea
            id="goals"
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            className="input-field w-full min-h-[150px]"
            placeholder="Example: I need to create a privacy policy for my app, set up contracts for new hires, and understand intellectual property protections for my software."
          />
          <p className="text-text-tertiary text-xs mt-1">
            Be specific about what legal documents, compliance measures, or legal advice you need.
          </p>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="btn-primary w-full py-3"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                Creating Your Dashboard...
              </span>
            ) : (
              'Create Your Dashboard'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OnboardingStartupGoals; 