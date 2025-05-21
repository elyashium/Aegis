import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TypeAnimation } from 'react-type-animation';
import { ArrowRight, CheckCircle, Shield, FileText, Brain } from 'lucide-react';
import Layout from '../components/Layout';
import SplineScene from '../components/Spline';

const Home: React.FC = () => {
  return (
    <Layout withPadding={false}>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-beige-100 to-beige-50 min-h-screen flex items-center">
        {/* Spline backdrop for desktop only, positioned more to the right */}
        <div className="absolute top-0 bottom-0 right-0 w-3/4 hidden lg:block overflow-hidden z-0">
          <SplineScene />
        </div>
        
        <div className="container-custom relative z-10 py-16 md:py-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <h1 className="mb-4 text-text-primary">
                Navigate Startup Law <br />
                <span className="text-teal-600">With Confidence</span>
              </h1>
              
              <div className="h-12 mb-6">
                <TypeAnimation
                  sequence={[
                    'Intelligent document drafting',
                    2000,
                    'Personalized legal guidance',
                    2000,
                    'Compliance checklists',
                    2000,
                  ]}
                  wrapper="p"
                  speed={50}
                  className="text-lg md:text-xl text-text-secondary font-mono"
                  repeat={Infinity}
                />
              </div>
              
              <p className="mb-8 text-text-secondary max-w-lg mx-auto lg:mx-0">
                Your AI-powered legal copilot for startups. Get expert guidance, draft legal documents, 
                and ensure compliance through natural conversation.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/register" className="btn-primary">
                  Get Started Free
                </Link>
                <Link to="/login" className="btn-outline">
                  Learn More
                </Link>
              </div>
            </motion.div>
            
            {/* Empty column to balance the layout and give space for the Spline component */}
            <div className="hidden lg:block"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="mb-4">Intelligent Legal Guidance <span className="text-teal-600">at Your Fingertips</span></h2>
              <p className="text-text-secondary max-w-2xl mx-auto">
                Aegis combines AI technology with legal expertise to provide startup founders with the tools they need to navigate complex legal challenges.
              </p>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Brain className="h-10 w-10 text-teal-600" />,
                title: "Intelligent Chat",
                description: "Ask legal questions in plain English and receive clear, actionable guidance tailored to your startup's specific needs."
              },
              {
                icon: <FileText className="h-10 w-10 text-teal-600" />,
                title: "Document Drafting",
                description: (<>Generate customized legal documents through natural conversation. <span className="font-mono">No more filling out tedious forms.</span></>)
              },
              {
                icon: <CheckCircle className="h-10 w-10 text-teal-600" />,
                title: "Compliance Checklists",
                description: (<>Stay on top of your legal obligations with <span className="font-mono">personalized compliance checklists</span> based on your business type and location.</>)
              },
              {
                icon: <Shield className="h-10 w-10 text-teal-600" />,
                title: "Secure Dashboard",
                description: (<>Manage all your legal documents, track compliance, and monitor your startup's legal health in one <span className="font-mono">secure environment</span>.</>)
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-beige-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-montserrat font-semibold mb-3">{feature.title}</h3>
                <p className="text-text-secondary">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section bg-beige-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="mb-4">How It <span className="text-teal-600">Works</span></h2>
              <p className="text-text-secondary max-w-2xl mx-auto">
                Aegis simplifies legal processes through conversational AI, making complex legal tasks accessible and manageable.
              </p>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Sign Up",
                description: "Create your account in seconds and tell us a bit about your startup."
              },
              {
                step: "02",
                title: "Describe Your Needs",
                description: "Chat naturally with your Aegis assistant about what you're looking to accomplish."
              },
              {
                step: "03",
                title: "Get Results",
                description: "Receive guidance, documents, and compliance tools tailored to your startup."
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                <div className="text-5xl font-playfair text-teal-600 opacity-20 mb-2 font-mono">
                  {step.step}
                </div>
                <h3 className="text-xl font-montserrat font-semibold mb-3">{step.title}</h3>
                <p className="text-text-secondary">{step.description}</p>
                
                {index < 2 && (
                  <div className="hidden md:block absolute top-10 right-0 transform translate-x-1/2">
                    <ArrowRight className="text-teal-600 h-6 w-6" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-teal-600 text-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="mb-4 text-white">Ready to Transform Your Startup's Legal Experience?</h2>
              <p className="mb-8 text-white/80">
                Join thousands of founders who are saving time and reducing legal risks with Aegis.
              </p>
              <Link to="/register" className="btn bg-white text-teal-600 hover:bg-beige-100">
                Get Started Free
              </Link>
              <div className="mt-4 text-white/60 text-sm font-mono">
                No credit card required. Free plan includes basic legal guidance and document templates.
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Legal Disclaimer */}
      <section className="py-8 bg-beige-100">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-lg font-montserrat font-semibold mb-2">Legal Disclaimer</h3>
            <p className="text-text-secondary text-sm font-mono">
              Aegis provides general legal information, not legal advice. While we strive for accuracy, 
              the information provided should not be considered a substitute for consultation with a qualified 
              attorney. Your use of this service does not create an attorney-client relationship. Always seek 
              professional legal counsel for specific legal matters.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;