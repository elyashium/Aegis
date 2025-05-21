import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-beige-100 pt-12 pb-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and description */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center mb-4">
              <span className="text-2xl font-playfair font-bold text-teal-600">Aegis</span>
            </Link>
            <p className="text-text-secondary max-w-xs">
              Your AI-powered legal companion for startups. Get expert guidance through natural conversation.
            </p>
          </div>

          {/* Legal */}
          <div className="md:col-span-1">
            <h4 className="font-montserrat font-semibold text-lg mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-text-secondary hover:text-teal-600 text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-text-secondary hover:text-teal-600 text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="text-text-secondary hover:text-teal-600 text-sm">
                  Legal Disclaimer
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="md:col-span-1">
            <h4 className="font-montserrat font-semibold text-lg mb-4">Connect</h4>
            <div className="flex space-x-4 mb-4">
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="text-text-secondary hover:text-teal-600"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-text-secondary hover:text-teal-600"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-text-secondary hover:text-teal-600"
              >
                <Github size={20} />
              </a>
            </div>
            <p className="text-text-secondary text-sm">
              Contact us at <a href="mailto:info@aegis.ai" className="text-teal-600 hover:underline">info@aegis.ai</a>
            </p>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-beige-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-text-secondary text-sm mb-4 md:mb-0">
              &copy; {currentYear} Aegis. All rights reserved.
            </p>
            <p className="text-text-secondary text-sm text-center md:text-right">
              Aegis provides general information, not legal advice. Always consult with a qualified attorney for specific legal matters.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;