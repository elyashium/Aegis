import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FileText, CheckSquare, AlertCircle, Clock, Download, ExternalLink, Loader2, Upload, RefreshCw } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useOnboarding } from '../contexts/OnboardingContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import UploadTab from '../components/UploadTab';
import ComplianceTab from '../components/ComplianceTab';
import WebPresenceTab from '../components/WebPresenceTab';
import { fetchChecklistsForUser, fetchChecklistItemsForChecklist, Checklist, ChecklistItem } from '../utils/dashboardUtils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';

// Component for dynamically generated checklist tabs
const ChecklistTab: React.FC<{ checklist: Checklist }> = ({ checklist }) => {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const checklistItems = await fetchChecklistItemsForChecklist(checklist.id);
        setItems(checklistItems || []);
      } catch (err: any) {
        console.error(`Error loading items for checklist ${checklist.id}:`, err);
        setError(err.message || 'Failed to load checklist items');
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [checklist.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        <span className="ml-2">Loading checklist items...</span>
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

  const completedCount = items.filter(item => item.completed).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>{checklist.name}</CardTitle>
          <CardDescription>
            {completedCount} of {items.length} items completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-start justify-between py-3 border-b last:border-0">
                <div className="flex items-start gap-3">
                  <Checkbox 
                    id={item.id} 
                    checked={item.completed}
                    // Read-only in this view - users can update in the Compliance tab
                    disabled
                  />
                  <div>
                    <Label htmlFor={item.id} className={`font-medium ${item.completed ? 'line-through text-text-tertiary' : ''}`}>
                      {item.text}
                    </Label>
                  </div>
                </div>
                <div>
                  <Badge variant="outline" className={item.completed 
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                  }>
                    {item.completed ? "Complete" : "Pending"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { onboardingState } = useOnboarding();
  const { startupProfile } = onboardingState;
  const [userChecklists, setUserChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const location = useLocation();
  const navigate = useNavigate();
  
  // Load checklists for dynamic tabs
  const loadChecklists = async () => {
    if (!user) return;
    
    try {
      console.log('Loading checklists for user...');
      const checklists = await fetchChecklistsForUser(user.id);
      console.log('Fetched checklists:', checklists);
      
      // Filter out ANY compliance-related checklists as they should only appear in the Compliance tab
      const filteredChecklists = checklists.filter(
        checklist => 
          checklist.name !== 'Compliance Dashboard' &&
          !checklist.name.toLowerCase().includes('compliance') &&
          !checklist.name.toLowerCase().includes('legal requirement') &&
          !checklist.name.toLowerCase().includes('compliance checklist') &&
          !checklist.name.toLowerCase().includes('compliance dashboard')
      );
      console.log('Filtered checklists (excluding compliance):', filteredChecklists);
      setUserChecklists(filteredChecklists);
    } catch (err) {
      console.error('Error loading checklists:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadChecklists();
  }, [user]);
  
  // Check for state from navigation (used when redirected from AbsorbGuidanceButton)
  useEffect(() => {
    if (location.state?.refreshChecklists) {
      console.log('Dashboard received refresh signal, reloading checklists...');
      setLoading(true); // Set loading true before starting to load checklists
      loadChecklists(); // This already sets loading to false in its finally block
      
      let intendedTab = location.state.activeTab;
      console.log('Dashboard received intendedTab from location state:', intendedTab);

      // Check if the intended tab is a checklist ID that matches the "Compliance Dashboard"
      if (intendedTab && intendedTab.startsWith('checklist-')) {
        const checklistIdFromState = intendedTab.replace('checklist-', '');
        // We need to access the full userChecklists *before* filtering to check its name
        // This check is a bit tricky because userChecklists (filtered) won't have it.
        // A simpler approach is to rely on the AbsorbGuidanceButton sending 'compliance' directly.
        // However, if it *could* send an ID that IS the compliance dashboard, we'd need to fetch raw list.
        // For now, we assume AbsorbGuidanceButton sends 'compliance' for the compliance tab.
        // The `userChecklists` state variable already filters out the "Compliance Dashboard".
        // So, if `intendedTab` refers to a checklist ID that *is* the compliance dashboard ID,
        // it wouldn't be found in `userChecklists.map(c => c.id)`. 
        // The filter in `loadChecklists` ensures Compliance Dashboard isn't in `userChecklists`.
        
        // If AbsorbGuidanceButton sends the specific ID of the compliance dashboard, 
        // we would need to compare it against the known name or have a way to identify it.
        // The current filtering in loadChecklists correctly removes it from dynamic tab generation.
        // The AbsorbGuidanceButton logic was updated to send 'compliance' string directly.
      }
      
      if (intendedTab) {
        console.log('Setting active tab to:', intendedTab);
        setActiveTab(intendedTab);
      }
      // Clear the state to prevent re-triggering on other renders
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, user, navigate]); // Add user to dependencies, as loadChecklists depends on it
  
  // Sample data - in a real app, this would come from your backend
  const documents = [
    { id: 1, name: 'Non-Disclosure Agreement', date: '2025-04-10', type: 'Legal Document' },
    { id: 2, name: 'Terms of Service', date: '2025-04-05', type: 'Legal Document' },
  ];

  const recentActivity = [
    { id: 1, type: 'document_uploaded', description: 'Business Registration Certificate uploaded', date: '2025-04-15' },
    { id: 2, type: 'compliance_updated', description: 'GDPR Compliance checklist updated', date: '2025-04-14' },
    { id: 3, type: 'document_generated', description: 'Terms of Service document generated', date: '2025-04-12' },
    { id: 4, type: 'document_uploaded', description: 'Employee Handbook uploaded', date: '2025-04-10' },
    { id: 5, type: 'compliance_alert', description: 'Business license renewal due in 30 days', date: '2025-04-08' },
  ];

  const alerts = [
    { id: 1, title: 'Business License Renewal', description: 'Your business license expires in 30 days.', severity: 'high', date: '2025-05-15' },
    { id: 2, title: 'Privacy Policy Update', description: 'Update your privacy policy to comply with new regulations.', severity: 'medium', date: '2025-06-01' },
    { id: 3, type: 'tax_filing_reminder', description: 'Quarterly taxes are due soon.', severity: 'low', date: '2025-04-30' },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'low':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Handle tab change manually since our Tabs component doesn't support controlled mode
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Function to handle manual refresh
  const handleManualRefresh = () => {
    console.log('Manual refresh triggered');
    loadChecklists();
  };

  return (
    <Layout>
      <div className="bg-beige-50 min-h-screen py-8">
        <div className="container-custom">
          {/* Welcome header with refresh button */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-playfair mb-2">Welcome to Your Legal Dashboard</h1>
              <p className="text-text-secondary">
                Track your legal documents, compliance progress, and recent activity
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManualRefresh}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Dashboard
            </Button>
          </div>
          
          {/* Dashboard Tabs */}
          <Tabs defaultValue={activeTab} className="mb-8">
            <TabsList>
              <TabsTrigger value="overview" onClick={() => handleTabChange("overview")}>Overview</TabsTrigger>
              <TabsTrigger value="upload" onClick={() => handleTabChange("upload")}>Upload Documents</TabsTrigger>
              <TabsTrigger value="compliance" onClick={() => handleTabChange("compliance")}>Compliance</TabsTrigger>
              <TabsTrigger value="webpresence" onClick={() => handleTabChange("webpresence")}>Website Guide</TabsTrigger>
              
              {/* Dynamic tabs based on checklists */}
              {userChecklists.map(checklist => (
                <TabsTrigger 
                  key={checklist.id} 
                  value={`checklist-${checklist.id}`}
                  onClick={() => handleTabChange(`checklist-${checklist.id}`)}
                >
                  {checklist.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {/* Overview Tab Content */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left column - Startup Profile & Documents */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Startup Profile Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white rounded-lg shadow-custom p-6"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-playfair text-teal-600">Startup Profile</h2>
                      <Link to="/onboarding" className="text-sm text-teal-600 hover:text-teal-700">Edit</Link>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm text-text-tertiary">Company Name</h3>
                        <p className="font-medium">{startupProfile.companyName || 'Not specified'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm text-text-tertiary">Entity Type</h3>
                        <p className="font-medium">{startupProfile.entityType || 'Not specified'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm text-text-tertiary">Industry</h3>
                        <p className="font-medium">{startupProfile.industry || 'Not specified'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm text-text-tertiary">Location</h3>
                        <p className="font-medium">{startupProfile.location || 'Not specified'}</p>
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Recent Documents Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="bg-white rounded-lg shadow-custom p-6"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-playfair text-teal-600">Recent Documents</h2>
                      <Link to="/upload" className="text-sm text-teal-600 hover:text-teal-700">View All</Link>
                    </div>
                    
                    <div className="space-y-4">
                      {documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-beige-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-teal-600" />
                            <div>
                              <p className="font-medium">{doc.name}</p>
                              <p className="text-xs text-text-tertiary">{doc.type} • {doc.date}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      ))}
                      
                      <Button variant="outline" className="w-full" asChild>
                        <Link to="/upload">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload New Document
                        </Link>
                      </Button>
                    </div>
                  </motion.div>
                  
                  {/* Recent Activity Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="bg-white rounded-lg shadow-custom p-6"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-playfair text-teal-600">Recent Activity</h2>
                    </div>
                    
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                          <div className="mt-0.5">
                            {activity.type === 'document_uploaded' && <Upload className="h-4 w-4 text-teal-600" />}
                            {activity.type === 'compliance_updated' && <CheckSquare className="h-4 w-4 text-teal-600" />}
                            {activity.type === 'document_generated' && <FileText className="h-4 w-4 text-teal-600" />}
                            {activity.type === 'compliance_alert' && <AlertCircle className="h-4 w-4 text-amber-500" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">{activity.description}</p>
                            <p className="text-xs text-text-tertiary">{activity.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
                
                {/* Right column - Alerts & Compliance */}
                <div className="space-y-8">
                  {/* Compliance Alerts Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="bg-white rounded-lg shadow-custom p-6"
                  >
                    <h2 className="text-xl font-playfair text-teal-600 mb-4">Compliance Alerts</h2>
                    
                    <div className="space-y-4">
                      {alerts.map((alert) => (
                        <div 
                          key={alert.id} 
                          className={`p-3 rounded-lg border-l-4 ${getSeverityColor(alert.severity)}`}
                        >
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium">{alert.title}</h3>
                            <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                              {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-sm text-text-secondary mt-1">{alert.description}</p>
                          <div className="flex items-center gap-1 mt-2 text-xs text-text-tertiary">
                            <Clock className="h-3 w-3" />
                            <span>Due by {alert.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                  
                  {/* Compliance Progress Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    className="bg-white rounded-lg shadow-custom p-6"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-playfair text-teal-600">Compliance Progress</h2>
                      <Link to="/dashboard?tab=compliance" className="text-sm text-teal-600 hover:text-teal-700">View Details</Link>
                    </div>
                    
                    {userChecklists.length > 0 ? (
                      <div className="space-y-4">
                        {userChecklists.slice(0, 3).map((checklist) => (
                          <div key={checklist.id} className="flex flex-col gap-1">
                            <div className="flex justify-between items-center">
                              <h3 className="text-sm font-medium">{checklist.name}</h3>
                              <span className="text-xs text-text-tertiary">{checklist.progress}%</span>
                            </div>
                            <div className="w-full bg-beige-100 rounded-full h-2">
                              <div 
                                className="bg-teal-600 h-2 rounded-full" 
                                style={{ width: `${checklist.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                        
                        {userChecklists.length > 3 && (
                          <Button variant="link" className="text-sm p-0 h-auto">
                            View {userChecklists.length - 3} more checklists
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-text-tertiary">
                        <p>No checklists available</p>
                        <p className="text-xs mt-1">Generate guidance in chat to create checklists</p>
                      </div>
                    )}
                  </motion.div>
                  
                  {/* Legal Resources Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                    className="bg-white rounded-lg shadow-custom p-6"
                  >
                    <h2 className="text-xl font-playfair text-teal-600 mb-4">Legal Resources</h2>
                    
                    <div className="space-y-3">
                      <a href="#" className="flex items-center gap-2 p-2 hover:bg-beige-50 rounded-md transition-colors">
                        <ExternalLink className="h-4 w-4 text-teal-600" />
                        <span className="text-sm">Small Business Administration</span>
                      </a>
                      <a href="#" className="flex items-center gap-2 p-2 hover:bg-beige-50 rounded-md transition-colors">
                        <ExternalLink className="h-4 w-4 text-teal-600" />
                        <span className="text-sm">Chamber of Commerce</span>
                      </a>
                      <a href="#" className="flex items-center gap-2 p-2 hover:bg-beige-50 rounded-md transition-colors">
                        <ExternalLink className="h-4 w-4 text-teal-600" />
                        <span className="text-sm">Legal Templates Library</span>
                      </a>
                    </div>
                  </motion.div>
                  
                  {/* Legal Disclaimer */}
                  <div className="bg-beige-100 rounded-lg p-4">
                    <h3 className="text-sm font-medium mb-2">Legal Disclaimer</h3>
                    <p className="text-text-secondary text-xs">
                      Aegis provides general legal information, not legal advice. While we strive for accuracy, 
                      the information provided should not be considered a substitute for consultation with a qualified 
                      attorney. Your use of this service does not create an attorney-client relationship. Always seek 
                      professional legal counsel for specific legal matters.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Upload Tab Content */}
            <TabsContent value="upload">
              <UploadTab />
            </TabsContent>
            
            {/* Compliance Tab Content */}
            <TabsContent value="compliance">
              <ComplianceTab />
            </TabsContent>

            {/* Web Presence Tab Content */}
            <TabsContent value="webpresence">
              <WebPresenceTab />
            </TabsContent>
            
            {/* Dynamic Checklist Tabs Content */}
            {userChecklists.map(checklist => (
              <TabsContent key={checklist.id} value={`checklist-${checklist.id}`}>
                <ChecklistTab checklist={checklist} />
              </TabsContent>
            ))}
          </Tabs>
          
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;