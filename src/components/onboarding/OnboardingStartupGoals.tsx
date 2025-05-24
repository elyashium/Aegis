import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const OnboardingStartupGoals: React.FC = () => {
  const { onboardingState, updateStartupProfile, prevStep, completeOnboarding, createDashboard } = useOnboarding();
  const [goals, setGoals] = useState(onboardingState.startupProfile.goals || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Update goals in the profile
      updateStartupProfile({ goals });
      
      // Mark onboarding as complete
      await completeOnboarding();
      
      // Show success state briefly
      setIsComplete(true);
      
      // Create the dashboard based on the profile info
      await createDashboard();
      
      // Short delay before navigating to give user feedback
      setTimeout(() => {
        // Navigate to dashboard
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setIsSubmitting(false);
    }
  };

  if (isComplete) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex justify-center mb-6"
        >
          <div className="bg-green-100 p-4 rounded-full">
            <CheckCircle size={48} className="text-green-600" />
          </div>
        </motion.div>
        <h2 className="text-2xl font-playfair mb-2 text-text-primary">
          Onboarding Complete!
        </h2>
        <p className="text-text-secondary mb-4">
          Your dashboard is being created. You'll be redirected shortly...
        </p>
        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </motion.div>
    );
  }

  return (
    <div>
      <button 
        onClick={prevStep}
        className="flex items-center text-text-secondary mb-8 hover:text-text-primary transition-colors"
        disabled={isSubmitting}
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
            disabled={isSubmitting}
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
              'Complete & Create Dashboard'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OnboardingStartupGoals; 