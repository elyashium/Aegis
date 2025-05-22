import React, { useState } from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { motion } from 'framer-motion';

// Entity type options
const entityTypes = [
  'LLC',
  'C-Corporation',
  'S-Corporation',
  'Sole Proprietorship',
  'Partnership',
  'Not yet formed',
  'Other',
];

// Industry options
const industries = [
  'Software & Technology',
  'Healthcare & Biotech',
  'Finance & Fintech',
  'E-commerce & Retail',
  'Manufacturing',
  'Real Estate',
  'Education',
  'Media & Entertainment',
  'Food & Beverage',
  'Other',
];

// Stage options
const stages = [
  'Idea',
  'Pre-seed',
  'Seed',
  'Series A',
  'Series B+',
  'Established',
];

// Key legal concerns options
const concernOptions = [
  'Intellectual Property',
  'Compliance & Regulation',
  'Contracts & Agreements',
  'Corporate Structure',
  'Employment Law',
  'Funding & Investment',
  'Data Privacy',
  'Tax Planning',
  'International Expansion',
];

const OnboardingStartupProfile: React.FC = () => {
  const { onboardingState, updateStartupProfile, nextStep } = useOnboarding();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>(
    onboardingState.startupProfile.keyConcerns || []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formErrors: Record<string, string> = {};

    // Validate required fields
    if (!onboardingState.startupProfile.companyName) {
      formErrors.companyName = 'Company name is required';
    }
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    // Update concerns in profile
    updateStartupProfile({ keyConcerns: selectedConcerns });
    
    // Move to next step
    nextStep();
  };

  const handleInputChange = (field: string, value: string) => {
    updateStartupProfile({ [field]: value });
    
    // Clear error for this field if exists
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const toggleConcern = (concern: string) => {
    setSelectedConcerns(prev => {
      if (prev.includes(concern)) {
        return prev.filter(c => c !== concern);
      } else {
        return [...prev, concern];
      }
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-playfair mb-2 text-text-primary text-center">
        Tell us about your startup
      </h2>
      <p className="text-text-secondary mb-8 text-center">
        This information helps us provide more relevant legal guidance
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Name */}
        <div>
          <label htmlFor="companyName" className="block text-text-primary mb-1 text-sm font-medium">
            Company Name*
          </label>
          <input
            id="companyName"
            type="text"
            value={onboardingState.startupProfile.companyName || ''}
            onChange={(e) => handleInputChange('companyName', e.target.value)}
            className={`input-field w-full ${errors.companyName ? 'border-red-500' : 'border-beige-200'}`}
            placeholder="Your company name"
          />
          {errors.companyName && (
            <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>
          )}
        </div>

        {/* Entity Type */}
        <div>
          <label htmlFor="entityType" className="block text-text-primary mb-1 text-sm font-medium">
            Entity Type
          </label>
          <select
            id="entityType"
            value={onboardingState.startupProfile.entityType || ''}
            onChange={(e) => handleInputChange('entityType', e.target.value)}
            className="input-field w-full"
          >
            <option value="">Select entity type</option>
            {entityTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Industry */}
        <div>
          <label htmlFor="industry" className="block text-text-primary mb-1 text-sm font-medium">
            Industry
          </label>
          <select
            id="industry"
            value={onboardingState.startupProfile.industry || ''}
            onChange={(e) => handleInputChange('industry', e.target.value)}
            className="input-field w-full"
          >
            <option value="">Select industry</option>
            {industries.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-text-primary mb-1 text-sm font-medium">
            Location
          </label>
          <input
            id="location"
            type="text"
            value={onboardingState.startupProfile.location || ''}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="input-field w-full"
            placeholder="City, State/Province, Country"
          />
        </div>

        {/* Stage */}
        <div>
          <label htmlFor="stage" className="block text-text-primary mb-1 text-sm font-medium">
            Stage
          </label>
          <select
            id="stage"
            value={onboardingState.startupProfile.stage || ''}
            onChange={(e) => handleInputChange('stage', e.target.value)}
            className="input-field w-full"
          >
            <option value="">Select company stage</option>
            {stages.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
        </div>

        {/* Key Concerns */}
        <div>
          <label className="block text-text-primary mb-2 text-sm font-medium">
            Key Legal Concerns (Select all that apply)
          </label>
          <div className="flex flex-wrap gap-2 mt-1">
            {concernOptions.map((concern) => (
              <motion.button
                key={concern}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleConcern(concern)}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  selectedConcerns.includes(concern)
                    ? 'bg-teal-100 text-teal-800 border border-teal-300'
                    : 'bg-beige-100 text-text-secondary border border-beige-200'
                }`}
              >
                {concern}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="btn-primary w-full py-3"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default OnboardingStartupProfile; 