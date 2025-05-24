import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Clock, Download, FileText, Upload, AlertTriangle, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { useAuth } from '../contexts/AuthContext';
import {
  type Checklist, 
  type ChecklistItem, 
  fetchChecklistByName, 
  fetchChecklistItemsForChecklist, 
  updateChecklistItemCompletion,
  updateChecklistProgress,
  fetchChecklistsForUser
} from '../utils/dashboardUtils';

interface ComplianceItem extends ChecklistItem {
  // Add any specific fields if needed for compliance display
}

const ComplianceTab: React.FC = () => {
  const { user } = useAuth();
  const [complianceChecklists, setComplianceChecklists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const loadComplianceData = async () => {
      if (!user) return;
      
      try {
        // Fetch all checklists for this user
        const allChecklists = await fetchChecklistsForUser(user.id);
        
        // Filter to find compliance-related checklists
        const complianceRelatedChecklists = allChecklists.filter(checklist => 
          checklist.name === 'Compliance Dashboard' ||
          checklist.name.toLowerCase().includes('compliance') ||
          checklist.name.toLowerCase().includes('legal requirement')
        );
        
        // Also include step-based checklists
        const stepChecklists = allChecklists.filter(checklist => 
          checklist.name.toLowerCase().startsWith('step ') || 
          checklist.name.toLowerCase().match(/^step\s*\d+:/i)
        );
        
        // Combine both types of checklists
        const allRelevantChecklists = [...complianceRelatedChecklists, ...stepChecklists];
        
        console.log('Found compliance and step checklists:', allRelevantChecklists);
        
        // For each checklist, fetch its items
        const checklistsWithItems = await Promise.all(
          allRelevantChecklists.map(async (checklist) => {
            const items = await fetchChecklistItemsForChecklist(checklist.id);
            return { 
              checklist,
              items: items || []
            };
          })
        );
        
        // Sort checklists: first regular compliance ones, then step-based ones in order
        const sortedChecklists = checklistsWithItems.sort((a, b) => {
          const aName = a.checklist.name.toLowerCase();
          const bName = b.checklist.name.toLowerCase();
          
          // Step-based checklists should be sorted by step number
          const aIsStep = aName.startsWith('step ') || aName.match(/^step\s*\d+:/i);
          const bIsStep = bName.startsWith('step ') || bName.match(/^step\s*\d+:/i);
          
          // If both are step-based or neither is step-based
          if (aIsStep === bIsStep) {
            if (aIsStep) {
              // Extract step numbers for comparison
              const aMatch = aName.match(/step\s*(\d+)/i);
              const bMatch = bName.match(/step\s*(\d+)/i);
              const aNum = aMatch ? parseInt(aMatch[1]) : 0;
              const bNum = bMatch ? parseInt(bMatch[1]) : 0;
              return aNum - bNum;
            } else {
              // For non-step checklists, sort alphabetically
              return aName.localeCompare(bName);
            }
          }
          
          // Put non-step checklists before step checklists
          return aIsStep ? 1 : -1;
        });
        
        setComplianceChecklists(sortedChecklists);
      } catch (err: any) {
        console.error('Error loading compliance data:', err);
        setError(err.message || 'Failed to load compliance data');
      } finally {
        setLoading(false);
      }
    };

    loadComplianceData();
  }, [user]);

  // Check for refresh signal from location state
  useEffect(() => {
    if (location.state?.refreshChecklists) {
      console.log('ComplianceTab detected refresh signal');
      loadComplianceData();
    }
  }, [location.state]);

  const handleCheckboxChange = async (itemId: string, checked: boolean) => {
    try {
      await updateChecklistItemCompletion(itemId, checked);
      
      // Update the local state
      setComplianceChecklists(prev => 
        prev.map(checklistData => ({
          checklist: checklistData.checklist,
          items: checklistData.items.map(item => 
            item.id === itemId ? { ...item, completed: checked } : item
          )
        }))
      );
    } catch (err) {
      console.error('Error updating checklist item:', err);
    }
  };

  const getStatusBadge = (completed: boolean) => {
    return completed ? (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        Complete
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
        Pending
      </Badge>
    );
  };

  const getStatusIcon = (completed: boolean) => {
    return completed ? (
      <CheckCircle2 className="h-4 w-4 text-green-500" />
    ) : (
      <Clock className="h-4 w-4 text-amber-500" />
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        <span className="ml-2">Loading compliance checklists...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-600">
        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
        <p>Error: {error}</p>
      </div>
    );
  }

  if (complianceChecklists.length === 0) {
    return (
      <div className="text-center py-10 text-text-secondary">
        <p>No compliance checklists found.</p>
        <p className="text-sm mt-2">Generate legal guidance in chat to create compliance checklists.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <p className="text-text-secondary mb-6">
        Track your compliance progress across various legal and regulatory requirements.
      </p>

      {complianceChecklists.map((checklistData) => (
        <Card key={checklistData.checklist.id} className="mb-6">
          <CardHeader>
            <CardTitle>{checklistData.checklist.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {checklistData.items.length === 0 ? (
                <p className="text-text-tertiary py-2">No items in this checklist</p>
              ) : (
                checklistData.items.map((item) => (
                  <div key={item.id} className="flex items-start space-x-3 py-3 border-b border-beige-100 last:border-0">
                    <Checkbox 
                      id={item.id}
                      checked={item.completed}
                      onCheckedChange={(checked) => handleCheckboxChange(item.id, Boolean(checked))}
                      className="mt-1"
                    />
                    <div>
                      <Label 
                        htmlFor={item.id}
                        className={`font-medium ${item.completed ? 'line-through text-text-tertiary' : ''}`}
                      >
                        {item.text}
                      </Label>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ComplianceTab; 