import React from 'react';
import Layout from '../components/Layout';
import { ArrowRight, Shield, Zap, MessageSquare } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <Shield className="h-8 w-8 text-teal-600" />,
      title: "Secure Communication",
      description: "End-to-end encryption ensures your conversations remain private and secure."
    },
    {
      icon: <Zap className="h-8 w-8 text-teal-600" />,
      title: "Real-time Responses",
      description: "Get instant responses powered by advanced AI technology."
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-teal-600" />,
      title: "Natural Conversations",
      description: "Experience fluid, context-aware conversations that feel natural and intuitive."
    }
  ];

  return (
    <Layout>
      <div className="section">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h1 className="mb-4">Powerful Features</h1>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Discover the advanced capabilities that make our AI chat platform stand out.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <a href="/register" className="btn-primary group">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Features;