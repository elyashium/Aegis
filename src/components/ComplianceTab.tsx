import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, Download, FileText, Upload } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Separator } from './ui/separator';

const ComplianceTab: React.FC = () => {
  const categories = [
    {
      id: "business-licenses",
      title: "Business Licenses & Permits",
      items: [
        { id: "business-reg", name: "Business Registration", status: "complete", hasDocument: true },
        { id: "seller-permit", name: "Seller's Permit", status: "complete", hasDocument: true },
        { id: "health-permit", name: "Health Department Permit", status: "in-progress", hasDocument: false },
        { id: "fire-safety", name: "Fire Safety Inspection", status: "pending", hasDocument: false },
      ],
    },
    {
      id: "safety-compliance",
      title: "Safety & Health Compliance",
      items: [
        { id: "emergency-plan", name: "Emergency Action Plan", status: "complete", hasDocument: true },
        { id: "osha-checklist", name: "OSHA Compliance Checklist", status: "in-progress", hasDocument: false },
        { id: "safety-training", name: "Safety Training Documentation", status: "in-progress", hasDocument: false },
        { id: "hazard-comm", name: "Hazard Communication Program", status: "pending", hasDocument: false },
      ],
    },
    {
      id: "labor-compliance",
      title: "Labor Law Compliance",
      items: [
        { id: "employee-handbook", name: "Employee Handbook", status: "complete", hasDocument: true },
        { id: "labor-posters", name: "Labor Law Posters", status: "complete", hasDocument: true },
        { id: "payroll-tax", name: "Payroll Tax Registration", status: "complete", hasDocument: true },
        { id: "workers-comp", name: "Workers' Compensation Insurance", status: "in-progress", hasDocument: false },
      ],
    },
    {
      id: "industry-specific",
      title: "Industry-Specific Requirements",
      items: [
        { id: "food-handler", name: "Food Handler Certification", status: "complete", hasDocument: true },
        { id: "alcohol-license", name: "Alcohol License", status: "in-progress", hasDocument: false },
        { id: "product-safety", name: "Product Safety Certification", status: "pending", hasDocument: false },
        { id: "environmental", name: "Environmental Compliance", status: "pending", hasDocument: false },
      ],
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "complete":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Complete
          </Badge>
        );
      case "in-progress":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            In Progress
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Required
          </Badge>
        );
      default:
        return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "complete":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "in-progress":
      case "pending":
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-playfair text-teal-600">Compliance Requirements</h2>
        <Button variant="outline" size="sm" asChild>
          <Link to="/upload">
            <Upload className="h-4 w-4 mr-2" />
            Upload Documents
          </Link>
        </Button>
      </div>

      <div className="space-y-6">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardHeader className="pb-3">
              <CardTitle>{category.title}</CardTitle>
              <CardDescription>
                {category.items.filter((item) => item.status === "complete").length} of {category.items.length}{" "}
                requirements completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {category.items.map((item) => (
                  <div key={item.id} className="flex items-start justify-between py-2 border-b last:border-0">
                    <div className="flex items-start gap-3">
                      <Checkbox id={item.id} checked={item.status === "complete"} />
                      <div>
                        <Label htmlFor={item.id} className="font-medium cursor-pointer">
                          {item.name}
                        </Label>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusIcon(item.status)}
                          <span className="text-xs text-text-tertiary">
                            {item.status === "complete"
                              ? "Completed"
                              : item.status === "in-progress"
                                ? "In progress"
                                : "Required"}
                          </span>
                          {item.hasDocument && (
                            <>
                              <Separator orientation="vertical" className="h-3" />
                              <span className="text-xs text-text-tertiary flex items-center">
                                <FileText className="h-3 w-3 mr-1" />
                                Document uploaded
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(item.status)}
                      {item.hasDocument ? (
                        <Button variant="ghost" size="icon" title="Download Document">
                          <Download className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" title="Upload Document" asChild>
                          <Link to="/upload">
                            <Upload className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ComplianceTab; 