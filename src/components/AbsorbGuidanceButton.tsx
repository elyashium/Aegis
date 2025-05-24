import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { absorbRagGuidance } from '../utils/dashboardUtils';
import { useNavigate } from 'react-router-dom';

interface AbsorbGuidanceButtonProps {
  ragMarkdown: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

const AbsorbGuidanceButton: React.FC<AbsorbGuidanceButtonProps> = ({ 
  ragMarkdown, 
  onSuccess, 
  onError 
}) => {
  const [isAbsorbing, setIsAbsorbing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [alreadyExists, setAlreadyExists] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const handleAbsorbGuidance = async () => {
    if (!user || !ragMarkdown) return;
    
    setIsAbsorbing(true);
    
    try {
      const result = await absorbRagGuidance(user.id, ragMarkdown);
      
      if (result.success) {
        if (result.alreadyExisted) {
          // Items already exist, show a different message
          setAlreadyExists(true);
          setIsComplete(true);
          if (onSuccess) onSuccess();
          
          // Navigate to dashboard with no special highlighting
          navigate('/dashboard');
        } else {
          // New items were created
          setIsComplete(true);
          if (onSuccess) onSuccess();
          
          let targetTab = 'overview'; // Default to overview

          if (result.createdItems.checklists && result.createdItems.checklists.length > 0) {
            // Find the first checklist that is NOT the compliance dashboard
            const firstNonComplianceChecklist = result.createdItems.checklists.find(
              (c: any) => c.checklist.name !== "Compliance Dashboard"
            );
            if (firstNonComplianceChecklist) {
              targetTab = `checklist-${firstNonComplianceChecklist.checklist.id}`;
            } else if (result.createdItems.complianceChecklist) {
              // If only compliance checklist was created, or all others were filtered out
              targetTab = 'compliance';
            }
          } else if (result.createdItems.complianceChecklist) {
            // If only compliance checklist was created
            targetTab = 'compliance';
          }

          console.log('AbsorbGuidanceButton: Navigating to dashboard, targetTab:', targetTab);

          // Navigate to dashboard with state to trigger refresh and set active tab
          navigate('/dashboard', { 
            state: { 
              refreshChecklists: true,
              activeTab: targetTab
            } 
          });
        }
      } else {
        if (onError) onError(new Error('Failed to absorb guidance'));
      }
    } catch (error) {
      console.error('Error absorbing guidance:', error);
      if (onError) onError(error);
    } finally {
      setIsAbsorbing(false);
    }
  };
  
  return (
    <div className="mt-4">
      <button
        onClick={handleAbsorbGuidance}
        disabled={isAbsorbing || isComplete || !ragMarkdown}
        className={`
          px-4 py-2 rounded-md text-sm font-medium transition-all
          ${isComplete 
            ? (alreadyExists ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-green-100 text-green-800 border border-green-300')
            : isAbsorbing 
              ? 'bg-blue-100 text-blue-800 border border-blue-300 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }
        `}
      >
        {isComplete 
          ? (alreadyExists ? '✓ Already Added to Dashboard' : '✓ Added to Dashboard')
          : isAbsorbing 
            ? 'Adding to Dashboard...' 
            : 'Update Dashboard with this Guidance'
        }
      </button>
      
      {isComplete && !alreadyExists && (
        <p className="mt-2 text-sm text-green-600">
          Guidance has been successfully absorbed and you are being redirected to the dashboard.
        </p>
      )}
      
      {isComplete && alreadyExists && (
        <p className="mt-2 text-sm text-amber-600">
          This guidance is already in your dashboard. Navigating to dashboard now.
        </p>
      )}
    </div>
  );
};

export default AbsorbGuidanceButton; 