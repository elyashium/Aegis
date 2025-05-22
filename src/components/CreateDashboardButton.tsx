import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useOnboarding } from '../contexts/OnboardingContext';
import { motion } from 'framer-motion';

interface CreateDashboardButtonProps {
  className?: string;
}

const CreateDashboardButton: React.FC<CreateDashboardButtonProps> = ({ className = '' }) => {
  const [isCreating, setIsCreating] = useState(false);
  const { createDashboard } = useOnboarding();
  const navigate = useNavigate();
  
  const handleCreateDashboard = async () => {
    setIsCreating(true);
    
    try {
      await createDashboard();
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating dashboard:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${className}`}
    >
      <button
        onClick={handleCreateDashboard}
        disabled={isCreating}
        className="btn-primary px-4 py-2 w-full flex items-center justify-center"
      >
        {isCreating ? (
          <span className="flex items-center">
            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
            Creating Dashboard...
          </span>
        ) : (
          'Create Your Dashboard'
        )}
      </button>
    </motion.div>
  );
};

export default CreateDashboardButton; 