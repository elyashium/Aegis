import React, { useState, useEffect } from 'react';
import { FileText, Upload, X, Download, AlertTriangle, RefreshCw, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { useAuth } from '../contexts/AuthContext';
import { fetchDocumentsForUser, Document as DocType } from '../utils/dashboardUtils';
import { useLocation } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

const UploadTab: React.FC = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [documentType, setDocumentType] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [requiredDocuments, setRequiredDocuments] = useState<DocType[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<DocType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  // Fetch documents from Supabase
  const loadDocuments = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Loading documents for user...');
      const docs = await fetchDocumentsForUser(user.id);
      
      // Separate required documents (without file_path) from uploaded documents (with file_path)
      const required = docs.filter(doc => doc.file_path === null);
      const uploaded = docs.filter(doc => doc.file_path !== null);
      
      console.log(`Loaded ${required.length} required documents and ${uploaded.length} uploaded documents`);
      
      setRequiredDocuments(required);
      setRecentDocuments(uploaded);
    } catch (err: any) {
      console.error('Error loading documents:', err);
      setError(err.message || 'Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [user]);

  // Check for refresh signal from location state
  useEffect(() => {
    if (location.state?.refreshChecklists) {
      console.log('UploadTab detected refresh signal');
      loadDocuments();
    }
  }, [location.state]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  // Upload file to Supabase Storage and update document in database
  const uploadFile = async (file: File, docType: string): Promise<string | null> => {
    if (!user) return null;
    
    // Create a unique path for the file
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(filePath, file);
    
    if (error) {
      console.error('Error uploading file:', error);
      return null;
    }
    
    return filePath;
  };

  // Create or update document record in database
  const saveDocumentRecord = async (filePath: string, name: string, type: string): Promise<DocType | null> => {
    if (!user) return null;
    
    // Check if this is a required document we're fulfilling
    const matchingRequiredDoc = requiredDocuments.find(doc => 
      doc.name.toLowerCase() === name.toLowerCase() ||
      (documentName && doc.name.toLowerCase() === documentName.toLowerCase())
    );
    
    const now = new Date();
    let docRecord;
    
    if (matchingRequiredDoc) {
      // Update the existing required document
      const { data, error } = await supabase
        .from('documents')
        .update({
          file_path: filePath,
          document_type: type,
          upload_date: now.toISOString(),
          metadata: { 
            ...matchingRequiredDoc.metadata,
            status: 'Uploaded',
            original_filename: name
          },
          updated_at: now.toISOString()
        })
        .eq('id', matchingRequiredDoc.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating document record:', error);
        return null;
      }
      
      docRecord = {
        ...data,
        upload_date: new Date(data.upload_date),
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at)
      };
    } else {
      // Create a new document record
      const { data, error } = await supabase
        .from('documents')
        .insert({
          id: uuidv4(),
          user_id: user.id,
          name: documentName || name,
          document_type: type,
          upload_date: now.toISOString(),
          file_path: filePath,
          metadata: { status: 'Uploaded', original_filename: name },
          created_at: now.toISOString(),
          updated_at: now.toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating document record:', error);
        return null;
      }
      
      docRecord = {
        ...data,
        upload_date: new Date(data.upload_date),
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at)
      };
    }
    
    return docRecord;
  };

  const handleUpload = async () => {
    if (files.length === 0 || !documentType) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(Math.floor((i / files.length) * 50)); // First half for upload
        
        // Upload the file to storage
        const filePath = await uploadFile(file, documentType);
        if (!filePath) {
          throw new Error(`Failed to upload ${file.name}`);
        }
        
        // Create/Update the document record
        setUploadProgress(50 + Math.floor((i / files.length) * 50)); // Second half for database
        await saveDocumentRecord(filePath, file.name, documentType);
      }
      
      setUploadProgress(100);
      setTimeout(() => {
        setUploading(false);
        setFiles([]);
        setDocumentType("");
        setDocumentName("");
        loadDocuments(); // Refresh the document lists
      }, 1000);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Upload failed');
      setUploading(false);
    }
  };

  // Get a list of unique document names from required documents
  const requiredDocumentNames = [...new Set(requiredDocuments.map(doc => doc.name))];

  // Group required documents by type
  const groupedRequiredDocs = requiredDocuments.reduce<Record<string, DocType[]>>((acc, doc) => {
    const type = doc.document_type || 'Other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(doc);
    return acc;
  }, {});

  // Check if a required document has been uploaded
  const isDocumentUploaded = (docName: string): boolean => {
    return recentDocuments.some(doc => doc.name.toLowerCase() === docName.toLowerCase());
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full py-10">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-2 text-text-secondary">Loading documents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-600">
        <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
        <p>Error: {error}</p>
        <Button onClick={loadDocuments} className="mt-4 flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-playfair text-teal-600">Document Management</h2>
        <Button variant="outline" size="sm" onClick={loadDocuments} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh Documents
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload Compliance Documents</CardTitle>
            <CardDescription>Upload your business licenses, permits, and compliance documentation</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[600px] overflow-y-auto">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="document-type">Document Type</Label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger id="document-type">
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Standard document types */}
                    <SelectItem value="business-license">Business License</SelectItem>
                    <SelectItem value="tax-registration">Tax Registration</SelectItem>
                    <SelectItem value="health-permit">Health Department Permit</SelectItem>
                    <SelectItem value="safety-inspection">Safety Inspection</SelectItem>
                    <SelectItem value="employee-documentation">Employee Documentation</SelectItem>
                    <SelectItem value="industry-certification">Industry Certification</SelectItem>
                    
                    {/* Required documents from guidance */}
                    {requiredDocumentNames.length > 0 && (
                      <>
                        <Separator className="my-1" />
                        <div className="px-2 py-1 text-xs text-text-tertiary">Required Documents</div>
                        {requiredDocumentNames.map((name, index) => (
                          <SelectItem key={`req-${index}`} value={`required-${name}`}>
                            {name}
                          </SelectItem>
                        ))}
                      </>
                    )}
                    
                    <Separator className="my-1" />
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Document name input for when user selects "other" */}
              {documentType === "other" && (
                <div className="space-y-2">
                  <Label htmlFor="document-name">Document Name</Label>
                  <Input 
                    id="document-name" 
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    placeholder="Enter document name"
                  />
                </div>
              )}
              
              {/* Document name display when a required document is selected */}
              {documentType.startsWith('required-') && (
                <div className="p-2 bg-beige-50 rounded-md text-sm">
                  Uploading: <span className="font-medium">{documentType.replace('required-', '')}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="file-upload">Upload File</Label>
                <div className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-beige-50 transition-colors">
                  <Input id="file-upload" type="file" className="hidden" onChange={handleFileChange} multiple />
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-text-tertiary" />
                      <p className="text-sm font-medium">Drag and drop files here or click to browse</p>
                      <p className="text-xs text-text-tertiary">Supports PDF, JPG, PNG, DOC, DOCX (Max 10MB)</p>
                    </div>
                  </Label>
                </div>
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Files</Label>
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-text-tertiary" />
                          <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                          <span className="text-xs text-text-tertiary">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveFile(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              <Button
                className="w-full"
                disabled={files.length === 0 || !documentType || uploading}
                onClick={handleUpload}
              >
                {uploading ? "Uploading..." : "Upload Documents"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Required Documents</CardTitle>
            <CardDescription>Documents needed based on your guidance</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[600px] overflow-y-auto">
            <div className="space-y-4">
              {Object.keys(groupedRequiredDocs).length > 0 ? (
                Object.entries(groupedRequiredDocs).map(([type, docs], index) => (
                  <div key={index} className="p-3 border rounded-md">
                    <h3 className="font-medium mb-1">{type}</h3>
                    <ul className="space-y-2 text-sm">
                      {docs.map((doc) => {
                        const isUploaded = recentDocuments.some(
                          uploaded => uploaded.name.toLowerCase() === doc.name.toLowerCase()
                        );
                        
                        return (
                          <li key={doc.id} className="flex items-center gap-2">
                            {isUploaded ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <FileText className="h-4 w-4 text-text-tertiary" />
                            )}
                            <span className={isUploaded ? "line-through text-text-tertiary" : ""}>
                              {doc.name}
                            </span>
                            {doc.metadata && doc.metadata.status && (
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                isUploaded 
                                  ? "bg-green-50 text-green-700" 
                                  : "bg-amber-50 text-amber-700"
                              }`}>
                                {isUploaded ? "Uploaded" : doc.metadata.status}
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-text-tertiary">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No required documents found</p>
                  <p className="text-sm mt-1">Generate guidance in chat to see required documents</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Document Uploads</CardTitle>
            <CardDescription>View and manage your previously uploaded documents</CardDescription>
          </CardHeader>
          <CardContent>
            {recentDocuments.length > 0 ? (
              <div className="space-y-1">
                {recentDocuments.map((doc, index) => (
                  <div key={doc.id}>
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-text-tertiary" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <div className="flex items-center gap-2 text-xs text-text-tertiary">
                            <span>{doc.document_type}</span>
                            <Separator orientation="vertical" className="h-3" />
                            <span>Uploaded: {new Date(doc.upload_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                    {index < recentDocuments.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-text-tertiary">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No uploaded documents yet</p>
                <p className="text-sm mt-1">Upload documents using the form above</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default UploadTab; 