import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileText, CheckSquare, AlertCircle, Clock, Download, ExternalLink } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import UploadTab from '../components/UploadTab';
import ComplianceTab from '../components/ComplianceTab';
import WebPresenceTab from '../components/WebPresenceTab';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Sample data - in a real app, this would come from your backend
  const documents = [
    { id: 1, name: 'Non-Disclosure Agreement', date: '2025-04-10', type: 'Legal Document' },
    { id: 2, name: 'Terms of Service', date: '2025-04-05', type: 'Legal Document' },
  ];
  
  const checklists = [
    { 
      id: 1, 
      name: 'GDPR Compliance', 
      progress: 25, 
      items: [
        { id: 1, text: 'Privacy Policy Implementation', completed: true },
        { id: 2, text: 'Data Processing Register', completed: true },
        { id: 3, text: 'Consent Mechanisms', completed: true },
        { id: 4, text: 'Data Subject Rights Procedures', completed: false },
        { id: 5, text: 'Data Breach Notification Process', completed: false },
        { id: 6, text: 'Data Protection Impact Assessment', completed: false },
        { id: 7, text: 'International Data Transfer Safeguards', completed: false },
        { id: 8, text: 'Appoint Data Protection Officer', completed: false },
      ]
    },
    { 
      id: 2, 
      name: 'Startup Incorporation', 
      progress: 60, 
      items: [
        { id: 1, text: 'Choose Business Entity', completed: true },
        { id: 2, text: 'File Formation Documents', completed: true },
        { id: 3, text: 'Obtain EIN', completed: true },
        { id: 4, text: 'Draft Bylaws/Operating Agreement', completed: false },
        { id: 5, text: 'Open Business Bank Account', completed: false },
      ]
    }
  ];
  
  const recentActivity = [
    { id: 1, text: 'Generated Non-Disclosure Agreement', date: '2025-04-10', type: 'document' },
    { id: 2, text: 'Updated GDPR Compliance Checklist', date: '2025-04-08', type: 'checklist' },
    { id: 3, text: 'Discussed incorporation options', date: '2025-04-05', type: 'chat' },
  ];

  return (
    <Layout>
      <div className="bg-beige-50 min-h-screen py-8">
        <div className="container-custom">
          {/* Welcome header */}
          <div className="mb-8">
            <h1 className="text-3xl font-playfair mb-2">Welcome to Your Legal Dashboard</h1>
            <p className="text-text-secondary">
              Track your legal documents, compliance progress, and recent activity
            </p>
          </div>
          
          {/* Dashboard Tabs */}
          <Tabs defaultValue="overview" className="mb-8">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="upload">Upload Documents</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
              <TabsTrigger value="webpresence">Website Guide</TabsTrigger>
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
                      <button className="text-sm text-teal-600 hover:text-teal-700">Edit</button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-text-tertiary text-sm mb-1">Company Name</p>
                        <p className="font-medium">Aegis Inc.</p>
                      </div>
                      <div>
                        <p className="text-text-tertiary text-sm mb-1">Entity Type</p>
                        <p className="font-medium font-mono">Delaware C-Corporation</p>
                      </div>
                      <div>
                        <p className="text-text-tertiary text-sm mb-1">Industry</p>
                        <p className="font-medium">Legal Technology</p>
                      </div>
                      <div>
                        <p className="text-text-tertiary text-sm mb-1">Stage</p>
                        <p className="font-medium">Early-stage</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-beige-100">
                      <p className="text-text-tertiary text-sm mb-1">Key Concerns</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {['Data Privacy', 'Intellectual Property', 'Founder Agreements'].map((tag, i) => (
                          <span key={i} className="px-3 py-1 bg-beige-100 text-text-secondary text-xs font-mono rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Documents Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="bg-white rounded-lg shadow-custom p-6"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-playfair text-teal-600">My Documents</h2>
                      <Link to="/chat" className="text-sm text-teal-600 hover:text-teal-700">
                        Request New Document
                      </Link>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Example document items */}
                      <div className="flex items-center justify-between p-3 bg-beige-50 rounded-lg hover:bg-beige-100 transition-colors">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-teal-600 mr-3" />
                          <div>
                            <p className="font-medium font-mono">NDA_Template_v1.docx</p>
                            <p className="text-text-tertiary text-sm">Last modified: Apr 10, 2025</p>
                          </div>
                        </div>
                        <button className="text-teal-600 hover:text-teal-700">
                          <Download size={18} />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-beige-50 rounded-lg hover:bg-beige-100 transition-colors">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-teal-600 mr-3" />
                          <div>
                            <p className="font-medium font-mono">Terms_of_Service_2025.pdf</p>
                            <p className="text-text-tertiary text-sm">Last modified: Apr 8, 2025</p>
                          </div>
                        </div>
                        <button className="text-teal-600 hover:text-teal-700">
                          <Download size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Compliance Alerts */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="bg-white rounded-lg shadow-custom p-6"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-playfair text-teal-600">Compliance Alerts</h2>
                      <span className="px-3 py-1 bg-beige-100 text-text-secondary text-xs rounded-full">
                        2 Pending
                      </span>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-start p-3 bg-beige-50 rounded-md border-l-4 border-amber-500">
                        <AlertCircle size={20} className="text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">GDPR Compliance Deadline Approaching</p>
                          <p className="text-text-secondary text-sm mt-1">
                            Complete your GDPR compliance checklist by May 15, 2025
                          </p>
                          <div className="mt-2">
                            <Link to="/chat" className="text-teal-600 hover:underline text-sm">
                              Review Checklist
                            </Link>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start p-3 bg-beige-50 rounded-md border-l-4 border-teal-600">
                        <Clock size={20} className="text-teal-600 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Annual Report Filing Reminder</p>
                          <p className="text-text-secondary text-sm mt-1">
                            Your annual report filing is due in 45 days
                          </p>
                          <div className="mt-2">
                            <Link to="/chat" className="text-teal-600 hover:underline text-sm">
                              Get Assistance
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
                
                {/* Right column - Checklists & Activity */}
                <div className="space-y-8">
                  {/* Compliance Checklists */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="bg-white rounded-lg shadow-custom p-6"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-playfair text-teal-600">Compliance Checklists</h2>
                      <Link to="/chat" className="text-sm text-teal-600 hover:text-teal-700">
                        Create New
                      </Link>
                    </div>
                    
                    <div className="space-y-6">
                      {checklists.map((checklist) => (
                        <div key={checklist.id} className="border border-beige-200 rounded-md p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-medium">{checklist.name}</h3>
                            <span className="text-sm text-text-secondary">
                              {checklist.progress}% Complete
                            </span>
                          </div>
                          
                          <div className="w-full bg-beige-100 rounded-full h-2 mb-4">
                            <div 
                              className="bg-teal-600 h-2 rounded-full" 
                              style={{ width: `${checklist.progress}%` }}
                            ></div>
                          </div>
                          
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {checklist.items.slice(0, 3).map((item) => (
                              <div key={item.id} className="flex items-center">
                                <div className={`w-4 h-4 rounded-sm mr-2 flex items-center justify-center ${
                                  item.completed ? 'bg-teal-600' : 'border border-beige-300'
                                }`}>
                                  {item.completed && (
                                    <CheckSquare size={12} className="text-white" />
                                  )}
                                </div>
                                <span className={`text-sm ${
                                  item.completed ? 'text-text-tertiary line-through' : 'text-text-primary'
                                }`}>
                                  {item.text}
                                </span>
                              </div>
                            ))}
                          </div>
                          
                          {checklist.items.length > 3 && (
                            <button className="mt-3 text-teal-600 hover:underline text-sm">
                              View all {checklist.items.length} items
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                  
                  {/* Recent Activity */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    className="bg-white rounded-lg shadow-custom p-6"
                  >
                    <h2 className="text-xl font-playfair text-teal-600 mb-4">Recent Activity</h2>
                    
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-start pb-4 border-b border-beige-100 last:border-0 last:pb-0">
                          <div className="w-10 h-10 rounded-full bg-beige-100 flex items-center justify-center mr-3 flex-shrink-0">
                            {activity.type === 'document' && <FileText size={18} className="text-teal-600" />}
                            {activity.type === 'checklist' && <CheckSquare size={18} className="text-teal-600" />}
                            {activity.type === 'chat' && <ExternalLink size={18} className="text-teal-600" />}
                          </div>
                          <div>
                            <p className="font-medium font-mono">{activity.text}</p>
                            <p className="text-text-tertiary text-sm">
                              {new Date(activity.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-beige-100 text-center">
                      <Link to="/chat" className="text-teal-600 hover:underline text-sm">
                        Continue the conversation
                      </Link>
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
          </Tabs>
          
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;