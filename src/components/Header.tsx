import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const isOnChatPage = location.pathname === '/chat';

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Effect to close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  // Header style is always solid on chat page
  const headerBaseStyle = isOnChatPage 
    ? 'fixed top-0 left-0 right-0 z-50 backdrop-blur-md py-2 border-b border-beige-300 bg-beige-200/95' 
    : `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'backdrop-blur-md py-2' : 'bg-transparent py-4'
      }`;

  return (
    <header className={headerBaseStyle}>
      <div className="container-custom">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-playfair font-bold text-teal-600">Aegis</span>
            </Link>
            
            {/* Chat title (only shown on chat page) */}
            {isOnChatPage && (
              <div className="hidden sm:flex flex-col ml-8 border-l pl-6 border-beige-300">
                <h1 className="text-xl font-playfair text-teal-600">Aegis Chat</h1>
                <p className="text-text-secondary text-xs">Ask questions, request documents, or get compliance guidance</p>
              </div>
            )}
          </div>

          {/* Auth/User Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/dashboard" className="btn-secondary">
                  Dashboard
                </Link>
                {!isOnChatPage && (
                  <Link to="/chat" className="btn-primary">
                    Chat
                  </Link>
                )}
                <button onClick={handleSignOut} className="text-text-secondary hover:text-teal-600">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-text-primary hover:text-teal-600">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="lg:hidden focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-text-primary" />
            ) : (
              <Menu className="h-6 w-6 text-text-primary" />
            )}
          </button>
        </div>

        {/* Mobile Chat Title (only shown on chat page) */}
        {isOnChatPage && !isMenuOpen && (
          <div className="sm:hidden mt-2 text-center">
            <h1 className="text-lg font-playfair text-teal-600">Aegis Chat</h1>
            <p className="text-text-secondary text-xs">Ask questions, request documents, or get compliance guidance</p>
          </div>
        )}

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden mt-4 py-4 backdrop-blur-md rounded-md absolute left-4 right-4 z-20">
            <div className="flex flex-col space-y-4 px-4">
              <div className="border-t border-beige-200 pt-4 mt-2">
                {user ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="block py-2 text-text-primary hover:text-teal-600"
                    >
                      Dashboard
                    </Link>
                    {!isOnChatPage && (
                      <Link
                        to="/chat"
                        className="block py-2 text-text-primary hover:text-teal-600"
                      >
                        Chat
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left py-2 text-text-primary hover:text-teal-600"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block py-2 text-text-primary hover:text-teal-600"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="block py-2 text-text-primary hover:text-teal-600"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;