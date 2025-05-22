import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useOnboarding, UserType } from '../../contexts/OnboardingContext';
import { FileText, Briefcase } from 'lucide-react';

const OnboardingUserType: React.FC = () => {
  const { setUserType, completeOnboarding } = useOnboarding();
  const navigate = useNavigate();

  const handleSelection = async (type: UserType) => {
    setUserType(type);
    
    if (type === 'new_idea') {
      // For new idea users, complete onboarding and send them directly to chat
      await completeOnboarding();
      navigate('/chat');
    } else {
      // For established business users, continue with the onboarding process
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-3xl font-playfair mb-2 text-text-primary">Welcome to Aegis</h2>
      <p className="text-text-secondary mb-8">Let's get to know more about your needs</p>
      
      <h3 className="text-xl font-medium mb-6">Which best describes you?</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* New Idea Card */}
        <motion.div
          whileHover={{ y: -5 }}
          className="border border-beige-200 rounded-lg p-6 cursor-pointer hover:bg-beige-50 transition-colors"
          onClick={() => handleSelection('new_idea')}
        >
          <div className="flex justify-center mb-4">
            <FileText size={48} className="text-teal-600" />
          </div>
          <h3 className="text-lg font-medium mb-2">I'm drafting a new idea</h3>
          <p className="text-text-secondary text-sm">
            I'm just starting out and want to explore legal considerations for my idea
          </p>
        </motion.div>
        
        {/* Established Business Card */}
        <motion.div
          whileHover={{ y: -5 }}
          className="border border-beige-200 rounded-lg p-6 cursor-pointer hover:bg-beige-50 transition-colors"
          onClick={() => handleSelection('established_business')}
        >
          <div className="flex justify-center mb-4">
            <Briefcase size={48} className="text-teal-600" />
          </div>
          <h3 className="text-lg font-medium mb-2">I have an established business</h3>
          <p className="text-text-secondary text-sm">
            I already have a business or startup and need specific legal guidance
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default OnboardingUserType; 