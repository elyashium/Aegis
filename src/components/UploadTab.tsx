import React, { useState } from 'react';
import { FileText, Upload, X, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';

const UploadTab: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [documentType, setDocumentType] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (files.length === 0 || !documentType) return;

    setUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setUploading(false);
            setFiles([]);
            setDocumentType("");
          }, 1000);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const recentDocuments = [
    { name: "Business Registration.pdf", type: "Business License", date: "May 15, 2025", size: "1.2 MB" },
    { name: "Employee Handbook.docx", type: "Labor Compliance", date: "May 10, 2025", size: "3.5 MB" },
    { name: "Food Handler Certificate.pdf", type: "Industry Specific", date: "May 5, 2025", size: "0.8 MB" },
    { name: "Tax Registration.pdf", type: "Business License", date: "April 28, 2025", size: "1.5 MB" },
    { name: "Emergency Plan.pdf", type: "Safety Compliance", date: "April 20, 2025", size: "2.1 MB" },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload Compliance Documents</CardTitle>
            <CardDescription>Upload your business licenses, permits, and compliance documentation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="document-type">Document Type</Label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger id="document-type">
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business-license">Business License</SelectItem>
                    <SelectItem value="tax-registration">Tax Registration</SelectItem>
                    <SelectItem value="health-permit">Health Department Permit</SelectItem>
                    <SelectItem value="safety-inspection">Safety Inspection</SelectItem>
                    <SelectItem value="employee-documentation">Employee Documentation</SelectItem>
                    <SelectItem value="industry-certification">Industry Certification</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
            <CardTitle>Document Requirements</CardTitle>
            <CardDescription>Required documents based on your business profile</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 border rounded-md">
                <h3 className="font-medium mb-1">Business Licenses & Permits</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-text-tertiary" />
                    <span>Business Registration Certificate</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-text-tertiary" />
                    <span>Seller's Permit</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-text-tertiary" />
                    <span>Health Department Permit</span>
                  </li>
                </ul>
              </div>

              <div className="p-3 border rounded-md">
                <h3 className="font-medium mb-1">Safety & Health Compliance</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-text-tertiary" />
                    <span>Emergency Action Plan</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-text-tertiary" />
                    <span>OSHA Compliance Documentation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-text-tertiary" />
                    <span>Safety Training Records</span>
                  </li>
                </ul>
              </div>

              <div className="p-3 border rounded-md">
                <h3 className="font-medium mb-1">Industry-Specific Requirements</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-text-tertiary" />
                    <span>Food Handler Certification</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-text-tertiary" />
                    <span>Alcohol License</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-text-tertiary" />
                    <span>Product Safety Certification</span>
                  </li>
                </ul>
              </div>
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
            <div className="space-y-1">
              {recentDocuments.map((doc, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-text-tertiary" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <div className="flex items-center gap-2 text-xs text-text-tertiary">
                          <span>{doc.type}</span>
                          <Separator orientation="vertical" className="h-3" />
                          <span>Uploaded: {doc.date}</span>
                          <Separator orientation="vertical" className="h-3" />
                          <span>{doc.size}</span>
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
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default UploadTab; 