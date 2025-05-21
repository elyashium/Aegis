import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  fullHeight?: boolean;
  withPadding?: boolean;
  hideFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  fullHeight = false,
  withPadding = true,
  hideFooter = false
}) => {
  const location = useLocation();
  const isOnChatPage = location.pathname === '/chat';
  
  // Adjust padding for chat page
  const mainPadding = withPadding 
    ? isOnChatPage ? 'pt-24 sm:pt-20' : 'pt-20' 
    : '';
  
  // Prevent body scroll on chat page
  useEffect(() => {
    if (isOnChatPage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOnChatPage]);
  
  return (
    <div className={`flex flex-col min-h-screen ${isOnChatPage ? 'overflow-hidden' : ''}`}>
      <Header />
      <main 
        className={`flex-grow ${mainPadding} ${
          fullHeight ? 'flex flex-col' : ''
        } ${isOnChatPage ? 'overflow-hidden' : ''}`}
      >
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default Layout;