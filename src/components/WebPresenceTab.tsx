import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Globe, 
  CheckCircle2, 
  ChevronRight, 
  Code, 
  Layers, 
  Search, 
  ShoppingBag, 
  Users, 
  MessageSquare,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

const WebPresenceTab: React.FC = () => {
  const [expandedStep, setExpandedStep] = useState<number | null>(0);

  const steps = [
    {
      id: 0,
      title: "Define Your Online Goals",
      description: "Clarify what you want to achieve with your website",
      status: "active",
      icon: <Globe className="h-5 w-5" />,
      tasks: [
        { id: "goal-1", name: "Identify your target audience", completed: false },
        { id: "goal-2", name: "Define primary business objectives", completed: false },
        { id: "goal-3", name: "Determine key website features needed", completed: false },
        { id: "goal-4", name: "Set measurable success metrics", completed: false }
      ],
      content: (
        <div className="space-y-4">
          <p className="text-text-secondary">
            Before diving into website creation, it's important to clearly define what you want your online presence to accomplish. 
            This will guide all your future decisions.
          </p>
          
          <div className="space-y-3">
            <h4 className="font-medium">Questions to consider:</h4>
            <ul className="list-disc pl-5 space-y-2 text-text-secondary">
              <li>Who is your primary audience? (e.g., local customers, industry professionals)</li>
              <li>What actions do you want visitors to take? (e.g., contact you, make purchases)</li>
              <li>What information must be available on your website?</li>
              <li>How will your website support your business model?</li>
            </ul>
          </div>
          
          <div className="bg-beige-50 p-4 rounded-md">
            <h4 className="font-medium mb-2">Pro Tip</h4>
            <p className="text-sm text-text-secondary">
              Create a simple one-page document outlining your website goals, target audience, and key features. 
              This will serve as your roadmap throughout the website creation process.
            </p>
          </div>
          
          <div className="pt-2">
            <Button asChild>
              <Link to="/chat">
                Get AI Assistance with Goal Setting
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      )
    },
    {
      id: 1,
      title: "Choose Your Website Platform",
      description: "Select the right platform based on your needs",
      status: "upcoming",
      icon: <Layers className="h-5 w-5" />,
      tasks: [
        { id: "platform-1", name: "Research website building platforms", completed: false },
        { id: "platform-2", name: "Compare hosting options", completed: false },
        { id: "platform-3", name: "Select domain name", completed: false },
        { id: "platform-4", name: "Set up initial account", completed: false }
      ],
      content: (
        <div className="space-y-4">
          <p className="text-text-secondary">
            There are many ways to build a website today. The right choice depends on your technical skills, budget, and specific needs.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Website Builders</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-text-secondary mb-2">
                  Easy-to-use platforms with drag-and-drop interfaces.
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  <Badge variant="outline">Wix</Badge>
                  <Badge variant="outline">Squarespace</Badge>
                  <Badge variant="outline">Shopify</Badge>
                  <Badge variant="outline">Webflow</Badge>
                </div>
                <p className="text-xs text-text-tertiary mt-2">Best for: Beginners with limited technical skills</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Content Management Systems</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-text-secondary mb-2">
                  More flexible platforms with extensive customization options.
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  <Badge variant="outline">WordPress</Badge>
                  <Badge variant="outline">Drupal</Badge>
                  <Badge variant="outline">Joomla</Badge>
                </div>
                <p className="text-xs text-text-tertiary mt-2">Best for: More complex sites with regular content updates</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-beige-50 p-4 rounded-md">
            <h4 className="font-medium mb-2">Domain Name Tips</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-text-secondary">
              <li>Keep it short, memorable, and easy to spell</li>
              <li>Include keywords relevant to your business if possible</li>
              <li>Avoid hyphens and numbers</li>
              <li>Choose a reliable domain registrar (Namecheap, GoDaddy, Google Domains)</li>
            </ul>
          </div>
          
          <div className="pt-2">
            <Button asChild>
              <Link to="/chat">
                Get Platform Recommendations
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "Design Your Website",
      description: "Create an effective layout and visual identity",
      status: "upcoming",
      icon: <Code className="h-5 w-5" />,
      tasks: [
        { id: "design-1", name: "Choose website template/theme", completed: false },
        { id: "design-2", name: "Customize branding elements", completed: false },
        { id: "design-3", name: "Plan site structure and navigation", completed: false },
        { id: "design-4", name: "Create key page layouts", completed: false }
      ],
      content: (
        <div className="space-y-4">
          <p className="text-text-secondary">
            Your website's design should reflect your brand identity while providing a seamless user experience.
          </p>
          
          <div className="space-y-3">
            <h4 className="font-medium">Essential Pages to Include:</h4>
            <ul className="list-disc pl-5 space-y-2 text-text-secondary">
              <li><span className="font-medium">Homepage:</span> Clear value proposition and call-to-action</li>
              <li><span className="font-medium">About:</span> Your story, mission, and team</li>
              <li><span className="font-medium">Services/Products:</span> What you offer</li>
              <li><span className="font-medium">Contact:</span> How to reach you</li>
              <li><span className="font-medium">FAQ:</span> Common questions answered</li>
            </ul>
          </div>
          
          <div className="bg-beige-50 p-4 rounded-md">
            <h4 className="font-medium mb-2">Design Principles</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-text-secondary">
              <li>Prioritize mobile responsiveness</li>
              <li>Use consistent colors and typography</li>
              <li>Ensure adequate contrast for readability</li>
              <li>Keep navigation intuitive and simple</li>
              <li>Use high-quality images and graphics</li>
            </ul>
          </div>
          
          <div className="pt-2">
            <Button asChild>
              <Link to="/chat">
                Get Design Assistance
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "Create Compelling Content",
      description: "Develop content that engages your audience",
      status: "upcoming",
      icon: <MessageSquare className="h-5 w-5" />,
      tasks: [
        { id: "content-1", name: "Write homepage copy", completed: false },
        { id: "content-2", name: "Create about page content", completed: false },
        { id: "content-3", name: "Develop service/product descriptions", completed: false },
        { id: "content-4", name: "Prepare images and media", completed: false }
      ],
      content: (
        <div className="space-y-4">
          <p className="text-text-secondary">
            Great content communicates your value proposition and connects with your audience.
          </p>
          
          <div className="space-y-3">
            <h4 className="font-medium">Content Writing Tips:</h4>
            <ul className="list-disc pl-5 space-y-2 text-text-secondary">
              <li>Focus on benefits, not just features</li>
              <li>Use clear, concise language</li>
              <li>Break text into scannable sections with headings</li>
              <li>Include relevant keywords for SEO</li>
              <li>Use compelling calls-to-action</li>
            </ul>
          </div>
          
          <div className="bg-beige-50 p-4 rounded-md">
            <h4 className="font-medium mb-2">Content Checklist</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-text-secondary">
              <li>Clear headline that communicates your value</li>
              <li>Subheadings that guide readers through your content</li>
              <li>Professional, high-quality images</li>
              <li>Social proof (testimonials, reviews, case studies)</li>
              <li>Contact information that's easy to find</li>
            </ul>
          </div>
          
          <div className="pt-2">
            <Button asChild>
              <Link to="/chat">
                Get AI Content Writing Help
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: "Optimize for Search Engines",
      description: "Ensure your website can be found online",
      status: "upcoming",
      icon: <Search className="h-5 w-5" />,
      tasks: [
        { id: "seo-1", name: "Perform keyword research", completed: false },
        { id: "seo-2", name: "Optimize page titles and meta descriptions", completed: false },
        { id: "seo-3", name: "Improve site loading speed", completed: false },
        { id: "seo-4", name: "Set up Google Business Profile", completed: false }
      ],
      content: (
        <div className="space-y-4">
          <p className="text-text-secondary">
            Search Engine Optimization (SEO) helps potential customers find your website when searching online.
          </p>
          
          <div className="space-y-3">
            <h4 className="font-medium">SEO Basics:</h4>
            <ul className="list-disc pl-5 space-y-2 text-text-secondary">
              <li>Research keywords relevant to your business</li>
              <li>Optimize page titles, headings, and content</li>
              <li>Create descriptive URLs and meta descriptions</li>
              <li>Ensure your website loads quickly</li>
              <li>Make your site mobile-friendly</li>
            </ul>
          </div>
          
          <div className="bg-beige-50 p-4 rounded-md">
            <h4 className="font-medium mb-2">Free SEO Tools</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-text-secondary">
              <li>Google Search Console</li>
              <li>Google Analytics</li>
              <li>Ubersuggest</li>
              <li>PageSpeed Insights</li>
              <li>Yoast SEO (WordPress plugin)</li>
            </ul>
          </div>
          
          <div className="pt-2">
            <Button asChild>
              <Link to="/chat">
                Get SEO Strategy Assistance
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: "Launch and Promote",
      description: "Go live and attract visitors to your website",
      status: "upcoming",
      icon: <ShoppingBag className="h-5 w-5" />,
      tasks: [
        { id: "launch-1", name: "Test website functionality", completed: false },
        { id: "launch-2", name: "Set up analytics", completed: false },
        { id: "launch-3", name: "Create social media profiles", completed: false },
        { id: "launch-4", name: "Develop promotion strategy", completed: false }
      ],
      content: (
        <div className="space-y-4">
          <p className="text-text-secondary">
            Launching your website is just the beginning. You'll need a strategy to drive traffic and engage visitors.
          </p>
          
          <div className="space-y-3">
            <h4 className="font-medium">Pre-Launch Checklist:</h4>
            <ul className="list-disc pl-5 space-y-2 text-text-secondary">
              <li>Test all pages and links</li>
              <li>Check mobile responsiveness</li>
              <li>Set up analytics tracking</li>
              <li>Create a backup of your site</li>
              <li>Test contact forms and other functionality</li>
            </ul>
          </div>
          
          <div className="bg-beige-50 p-4 rounded-md">
            <h4 className="font-medium mb-2">Promotion Strategies</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-text-secondary">
              <li>Share on social media platforms</li>
              <li>Email your existing contacts</li>
              <li>Consider local business directories</li>
              <li>Run targeted online ads</li>
              <li>Create valuable content to attract visitors</li>
            </ul>
          </div>
          
          <div className="pt-2">
            <Button asChild>
              <Link to="/chat">
                Get Launch Strategy Help
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      )
    },
    {
      id: 6,
      title: "Maintain and Improve",
      description: "Keep your website updated and optimized",
      status: "upcoming",
      icon: <Users className="h-5 w-5" />,
      tasks: [
        { id: "maintain-1", name: "Schedule regular content updates", completed: false },
        { id: "maintain-2", name: "Monitor website analytics", completed: false },
        { id: "maintain-3", name: "Perform security updates", completed: false },
        { id: "maintain-4", name: "Collect and respond to user feedback", completed: false }
      ],
      content: (
        <div className="space-y-4">
          <p className="text-text-secondary">
            A website is never truly "finished." Regular maintenance and improvements are essential for long-term success.
          </p>
          
          <div className="space-y-3">
            <h4 className="font-medium">Maintenance Tasks:</h4>
            <ul className="list-disc pl-5 space-y-2 text-text-secondary">
              <li>Update content regularly</li>
              <li>Monitor and analyze visitor behavior</li>
              <li>Keep software and plugins updated</li>
              <li>Perform regular backups</li>
              <li>Test and optimize for conversions</li>
            </ul>
          </div>
          
          <div className="bg-beige-50 p-4 rounded-md">
            <h4 className="font-medium mb-2">Growth Opportunities</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-text-secondary">
              <li>Start a blog to drive organic traffic</li>
              <li>Add new features based on user feedback</li>
              <li>Explore email marketing integration</li>
              <li>Consider adding live chat support</li>
              <li>Expand to new markets or audiences</li>
            </ul>
          </div>
          
          <div className="pt-2">
            <Button asChild>
              <Link to="/chat">
                Get Website Growth Strategies
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      )
    }
  ];

  const toggleStep = (stepId: number) => {
    if (expandedStep === stepId) {
      setExpandedStep(null);
    } else {
      setExpandedStep(stepId);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Completed
          </Badge>
        );
      case "active":
        return (
          <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
            In Progress
          </Badge>
        );
      case "upcoming":
        return (
          <Badge variant="outline" className="bg-beige-100 text-text-secondary border-beige-200">
            Upcoming
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-playfair text-teal-600">Website Creation Guide</h2>
        <Button variant="outline" size="sm" asChild>
          <a href="https://www.example.com/resources" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            Resources
          </a>
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-custom p-6">
        <h3 className="text-lg font-medium mb-4">Your Website Creation Journey</h3>
        <p className="text-text-secondary mb-6">
          Follow these steps to establish your online presence with a professional website
          that attracts customers and supports your business goals.
        </p>
        
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="border border-beige-200 rounded-lg overflow-hidden">
              <div 
                className={`flex items-center justify-between p-4 cursor-pointer ${
                  expandedStep === step.id ? 'bg-beige-50' : 'bg-white'
                }`}
                onClick={() => toggleStep(step.id)}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step.status === 'completed' 
                      ? 'bg-green-100' 
                      : step.status === 'active'
                        ? 'bg-teal-100'
                        : 'bg-beige-100'
                  }`}>
                    {step.status === 'completed' 
                      ? <CheckCircle2 className="h-5 w-5 text-green-600" /> 
                      : step.icon}
                  </div>
                  <div>
                    <div className="flex items-center">
                      <h4 className="font-medium">{step.title}</h4>
                      <span className="ml-3">{getStatusBadge(step.status)}</span>
                    </div>
                    <p className="text-sm text-text-tertiary">{step.description}</p>
                  </div>
                </div>
                <ChevronRight className={`h-5 w-5 text-text-tertiary transition-transform ${
                  expandedStep === step.id ? 'rotate-90' : ''
                }`} />
              </div>
              
              {expandedStep === step.id && (
                <div className="p-4 border-t border-beige-200">
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Tasks:</h4>
                    <div className="space-y-2">
                      {step.tasks.map(task => (
                        <div key={task.id} className="flex items-center">
                          <div className={`w-5 h-5 rounded border ${
                            task.completed 
                              ? 'bg-teal-600 border-teal-600' 
                              : 'border-beige-300'
                          } mr-3 flex items-center justify-center`}>
                            {task.completed && <CheckCircle2 className="h-3 w-3 text-white" />}
                          </div>
                          <span className={task.completed ? 'line-through text-text-tertiary' : ''}>
                            {task.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  {step.content}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-beige-100 rounded-lg p-4">
        <h3 className="text-sm font-medium mb-2">Need Additional Help?</h3>
        <p className="text-text-secondary text-xs mb-3">
          Our AI assistant can help you with specific questions about website creation, design best practices,
          content development, and marketing strategies.
        </p>
        <Button size="sm" asChild>
          <Link to="/chat">
            Chat with AI Assistant
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default WebPresenceTab; 