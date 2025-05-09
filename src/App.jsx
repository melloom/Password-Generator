import React, { useState, useEffect } from 'react';
import './App.css';
import './styles/pwa.css'; // Import PWA-specific styles
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import PasswordGenerator from './components/PasswordGenerator';
import Login from './components/Login';
import Register from './components/Register';
import PasswordViewer from './components/PasswordViewer';
import { useTranslation } from 'react-i18next';
import './i18n'; // Import i18n configuration
import ErrorBoundary from './components/ErrorBoundary';

// Protected route component using localStorage for auth
function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem('sessionId') !== null;
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function App() {
  const { i18n } = useTranslation();
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true' ||
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Apply stored language preference or detect from browser
  useEffect(() => {
    const storedLanguage = localStorage.getItem('language');
    if (storedLanguage) {
      i18n.changeLanguage(storedLanguage).then(() => {
        // Set RTL for Arabic
        const isRTL = ['ar'].includes(storedLanguage);
        document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
      });
    } else {
      // Try to detect language from browser
      const detectedLanguage = navigator.language.split('-')[0];
      // Only change if we support this language
      if (['en', 'es', 'fr', 'de', 'ar', 'ja'].includes(detectedLanguage)) {
        i18n.changeLanguage(detectedLanguage).then(() => {
          // Set RTL for Arabic
          const isRTL = ['ar'].includes(detectedLanguage);
          document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
        });
      }
    }
  }, [i18n]);

  // Add a timeout to ensure loading state is cleared even if something goes wrong
  useEffect(() => {
    if (isLoading) {
      // Force loading to end after 5 seconds if it hasn't already
      const loadingTimeout = setTimeout(() => {
        setIsLoading(false);
        console.log('Loading timed out - forcing completion');
      }, 5000); // 5 second timeout

      // Cleanup timeout if loading ends normally
      return () => clearTimeout(loadingTimeout);
    }
  }, [isLoading]);

  // In your loading/initialization code, ensure error handling is in place
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        // Your existing initialization code here
        
        // Ensure proper loading state reset
        setIsLoading(false);
      } catch (error) {
        console.error("Initialization error:", error);
        // Always reset loading state even if there's an error
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  const isAuthenticated = localStorage.getItem('sessionId') !== null;

  return (
    <Router>
      <ErrorBoundary>
        <div className="App">
          <Routes>
            <Route path="/login" element={
              isAuthenticated ? <Navigate to="/" /> : <Login />
            } />
            <Route path="/register" element={
              isAuthenticated ? <Navigate to="/" /> : <Register />
            } />
            <Route path="/dashboard" element={
              <PasswordGenerator darkMode={darkMode} setDarkMode={setDarkMode} />
            } />
            <Route path="/view" element={
              <PasswordViewer darkMode={darkMode} />
            } />
            <Route path="/" element={
              <PasswordGenerator darkMode={darkMode} setDarkMode={setDarkMode} />
            } />
          </Routes>
        </div>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
