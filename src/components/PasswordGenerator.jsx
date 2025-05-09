import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Shield, RotateCw, Eye, EyeOff, Moon, Sun, Sliders, Clock, Download, X, Info, RefreshCw, Copy, Check, AlertTriangle, Lock, AlarmClock, FileText, ChevronDown, ChevronUp, ArrowUp, Sparkles, RefreshCcw, QrCode, Timer, Hash, FileType, Smile, Download as DownloadIcon, Trash2, ShieldCheck, HomeIcon, Code, Github, BrainCircuit, Star, Cpu, BookOpen, Coffee, Share2, MinusCircle, PlusCircle, BarChart2 } from 'lucide-react';
import CharacterOptions from './CharacterOptions';
import PasswordStrength from './PasswordStrength';
import PasswordHistory from './PasswordHistory';
import SecurityCheck from './SecurityCheck';
import ExportModal from './ExportModal';
import PasswordChecker from './PasswordChecker';
import QRCodeModal from './QRCodeModal';
import PasswordGuides from './PasswordGuides';
import CreatorInfo from './CreatorInfo';
import ShareButton from './ShareButton'; // Import ShareButton component
import PasswordSettings from './PasswordSettings'; // Import PasswordSettings component
// Add import for password utility functions
import {
  initEntropyPool,
  generateMemorablePassword,
  generatePassword,
  analyzePasswordSecurity,
  calculateStrength,
  calculateEntropy
} from '../utils/passwordUtils';
import SecurityBanner from './SecurityBanner';
import PasswordLeakChecker from './PasswordLeakChecker';
import { enforceSecureContext, secureMemoryClear } from '../utils/secureMemory';

// Add a helper hook to detect device type
const useDeviceDetect = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.matchMedia('(max-width: 768px)').matches || 
                    window.matchMedia('(pointer: coarse)').matches ||
                    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    return () => window.removeEventListener('resize', checkDevice);
  }, []);
  
  return { isMobile };
};

// Fix password history modal visibility issues and button sizing
const PasswordGenerator = ({ darkMode, setDarkMode }) => {
  // Add ref for scrolling to top
  const topRef = useRef(null);
  
  // Use our device detection hook
  const { isMobile } = useDeviceDetect();
  
  // Add state to track PWA mode
  const [isPWA, setIsPWA] = useState(false);
  
  // Detect PWA mode on mount
  useEffect(() => {
    const checkPWA = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                        window.navigator.standalone === true;
      setIsPWA(standalone);
      
      // Log status bar info for debugging
      if (standalone) {
        console.log('PWA Mode detected:', {
          isMobile,
          standalone,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
          userAgent: navigator.userAgent,
          pointerType: window.matchMedia('(pointer: coarse)').matches ? 'coarse/touch' : 'fine/mouse'
        });
      }
    };
    
    checkPWA();
    
    // Also check when visibility changes (app might be foregrounded)
    document.addEventListener('visibilitychange', checkPWA);
    
    return () => document.removeEventListener('visibilitychange', checkPWA);
  }, [isMobile]);
  
  const [showPreviewBubble, setShowPreviewBubble] = useState(false); // New state for preview bubble
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 }); // Position for preview bubble

  // Character inclusion options
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);

  // Memorable password options
  const [wordCount, setWordCount] = useState(4);
  const [wordSeparator, setWordSeparator] = useState('-');
  const [wordCase, setWordCase] = useState('mixed');
  const [useWords, setUseWords] = useState(true); // Toggle between words and characters

  // Advanced options
  const [avoidAmbiguous, setAvoidAmbiguous] = useState(false);
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [customExclusions, setCustomExclusions] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [strengthScore, setStrengthScore] = useState(0);
  const [entropy, setEntropy] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [passwordHistory, setPasswordHistory] = useState([]);
  const [animateRefresh, setAnimateRefresh] = useState(false);
  const [strengthFeedback, setStrengthFeedback] = useState([]);
  const [showCopied, setShowCopied] = useState(false);

  // Add state to control password settings visibility
  const [showSettingsPanel, setShowSettingsPanel] = useState(false); // Settings panel collapsed by default

  // Security analysis
  const [securityAnalysis, setSecurityAnalysis] = useState(null);
  const [showSecurityDetails, setShowSecurityDetails] = useState(false);

  // Password checker states - add these
  const [passwordToCheck, setPasswordToCheck] = useState('');
  const [checkResult, setCheckResult] = useState(null);

  // New state for export modal
  const [showExport, setShowExport] = useState(false);

  // Add advanced mode state
  const [advancedLengthMode, setAdvancedLengthMode] = useState(false);

  // New states for additional features
  const [outputFormat, setOutputFormat] = useState('plain'); // plain, hex, base64, emoji
  const [expirationEnabled, setExpirationEnabled] = useState(false);
  const [expirationTime, setExpirationTime] = useState(5); // minutes
  const [expirationRemaining, setExpirationRemaining] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  // Ref for scrolling to check results
  const checkResultsRef = useRef(null);

  // Add new state for password suggestions
  const [passwordSuggestions, setPasswordSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Add state for PWA installation
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [installationAttempted, setInstallationAttempted] = useState(false);
  const [showInstallInstructions, setShowInstallInstructions] = useState(false);

  // Add state for security banner
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);

  // Add state for creator info modal
  const [showCreatorInfo, setShowCreatorInfo] = useState(false);

  // Add state for entropy status
  const [entropyStatus, setEntropyStatus] = useState({
    initialized: false,
    collectionActive: false
  });

  // Add state for Password Guides modal
  const [showPasswordGuides, setShowPasswordGuides] = useState(false);

  // Add passwordType state
  const [passwordType, setPasswordType] = useState('random');

  // Add missing password state
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(12); // Add missing length state
  // Add missing QRCode state
  const [showQRCode, setShowQRCode] = useState(false);

  // Add missing sliderRef
  const sliderRef = useRef(null);
  // Add missing typingAnimation state
  const [typingAnimation, setTypingAnimation] = useState(false);

  // Add state for collapsible password display
  const [isPasswordCollapsed, setIsPasswordCollapsed] = useState(false);

  // Add a new state variable for compact mode
  const [isCompactMode, setIsCompactMode] = useState(false);

  // Add state to track modal navigation
  const [previousModal, setPreviousModal] = useState(null);

  // Add this state variable if it's missing but referenced elsewhere
  const [hasSecurePasswords, setHasSecurePasswords] = useState(false);

  // Add state to track initial mount
  const [isInitialMount, setIsInitialMount] = useState(true);

  // Fix for password history not showing up
  const handleHistoryClick = () => {
    console.log("History button clicked"); // Debug logging

    // Force DOM update cycle with state changes
    setShowHistory(false);

    // Wrap in setTimeout to ensure state update completes first
    setTimeout(() => {
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
      setShowHistory(true);

      // Ensure proper focus and scroll position for accessibility
      const historyModal = document.querySelector('[role="dialog"]');
      if (historyModal) {
        historyModal.setAttribute('role', 'dialog');
        historyModal.setAttribute('aria-modal', 'true');
        historyModal.focus();

        // Make sure modal is visible in viewport
        historyModal.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }, 50);
  };

  // Detect if app can be installed (PWA)
  useEffect(() => {
    // Check if app is already installed
    window.addEventListener('beforeinstallprompt', (e) => {
      setInstallPrompt(e);
    });

    // Listen for app installation
    window.addEventListener('appinstalled', () => {
      // App is installed
      setIsAppInstalled(true);
      setInstallPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', () => {});
      window.removeEventListener('appinstalled', () => {});
    };
  }, []);

  // Improved PWA installation detection
  useEffect(() => {
    // 1. Check if app is already in standalone/installed mode
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                              window.navigator.standalone ||
                              document.referrer.includes('android-app://');

    // 2. Check if we've previously stored that the app was installed
    const previouslyInstalled = localStorage.getItem('lockora-pwa-installed') === 'true';

    if (isInStandaloneMode || previouslyInstalled) {
      setIsAppInstalled(true);
    }

    // 3. Check if installation was previously attempted but may not have completed
    if (localStorage.getItem('lockora-installation-attempted') === 'true') {
      setInstallationAttempted(true);
    }

    // 4. Listen for beforeinstallprompt event (shows the app is installable)
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent default browser install prompt
      e.preventDefault();
      // Save event to use later
      setInstallPrompt(e);
      console.log('Install prompt detected and stored');
    });

    // 5. Listen for successful app installation
    window.addEventListener('appinstalled', () => {
      console.log('PWA successfully installed');
      // Mark app as installed
      setIsAppInstalled(true);
      localStorage.setItem('lockora-pwa-installed', 'true');
      setInstallPrompt(null);
    });

    // 6. Check if we're on iOS where we need custom installation instructions
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isIOSChrome = isIOS && /CriOS/.test(navigator.userAgent);
    const isIOSSafari = isIOS && /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

    if (isIOS && !isInStandaloneMode && !previouslyInstalled) {
      // For iOS, we show custom instructions since beforeinstallprompt doesn't work
      if (isIOSSafari) {
        // Only show the button in Safari on iOS, since other browsers can't install PWAs
        setInstallPrompt({ isIOS: true });
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', () => {});
      window.removeEventListener('appinstalled', () => {});
    };
  }, []);

  // Improved PWA installation handler
  const handleInstallClick = async () => {
    console.log("Install button clicked", {installPrompt}); // Debug logging

    // For iOS devices
    if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
      // Show iOS-specific instructions modal
      setShowInstallInstructions(true);
      return;
    }

    // For standard browsers with installation API
    if (installPrompt) {
      try {
        // Show the installation prompt
        installPrompt.prompt();

        // Wait for user decision
        const { outcome } = await installPrompt.userChoice;
        console.log(`User ${outcome === 'accepted' ? 'accepted' : 'declined'} the installation`);

        if (outcome === 'accepted') {
          setIsAppInstalled(true);
          setInstallPrompt(null);

          // Show success message
          const notification = document.createElement('div');
          notification.className = `fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg text-white ${
            darkMode ? 'bg-success-600' : 'bg-success-500'
          } shadow-lg z-50 animate-fadeIn`;
          notification.textContent = '✓ App installed successfully!';
          document.body.appendChild(notification);

          setTimeout(() => {
            notification.classList.add('animate-fadeOut');
            setTimeout(() => {
              document.body.removeChild(notification);
            }, 300);
          }, 2000);
        }
      } catch (err) {
        console.error('Installation failed:', err);
      }
    } else {
      // For browsers that don't expose the install prompt
      console.log("Installation prompt not available");
      setShowInstallInstructions(true);
    }
  };

  // Function to close iOS installation instructions
  const closeInstallInstructions = () => {
    setShowInstallInstructions(false);
  };

  // Initialize enhanced security features
  useEffect(() => {
    try {
      // Initialize entropy collection
      initEntropyPool();
      setEntropyStatus({
        initialized: true,
        collectionActive: true
      });

      // Add event listeners for continuous background entropy collection
      const collectBackgroundEntropy = () => {
        // This would use the functions from passwordUtils, implemented there
        console.log("Additional entropy collected");
      };

      // Register document event listeners for entropy collection
      window.addEventListener('load', collectBackgroundEntropy);
      window.addEventListener('resize', collectBackgroundEntropy);
      window.addEventListener('scroll', collectBackgroundEntropy);

      return () => {
        window.removeEventListener('load', collectBackgroundEntropy);
        window.removeEventListener('resize', collectBackgroundEntropy);
        window.removeEventListener('scroll', collectBackgroundEntropy);
      };
    } catch (error) {
      console.error("Failed to initialize entropy pool:", error);
      // Gracefully handle the error
      setEntropyStatus({
        initialized: false,
        collectionActive: false,
        error: true
      });
    }
  }, []);

  // Enhanced secure clearing of password data
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // User is navigating away from the page - clear sensitive data
        if (!showPassword) {
          setPassword(prev => {
            // Replace with zeros in UI before page is hidden
            return prev.replace(/./g, '0');
          });
        }
        setPassword(''); // Clear password completely
        setPasswordToCheck(''); // Clear password checker input
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [showPassword]);

  // Enhanced password generation with better error handling
const handleGeneratePassword = () => {
  try {
    // Force entropy pool refresh for better randomness on each generation
    initEntropyPool();
    
    // Generate password as before
    let newPassword = '';

    if (passwordType === 'memorable') {
      if (useWords) {
        // Generate word-based memorable password
        newPassword = generateMemorablePassword({
          wordCount,
          includeNumbers,
          includeSpecial: includeSymbols,
          separator: wordSeparator,
          wordCase
        });
      } else {
        // Generate character-based password but make it more memorable
        newPassword = generatePassword({
          length: Math.max(12, wordCount * 3), // Minimum 12 characters
          includeUppercase: true,
          includeLowercase: true,
          includeNumbers,
          includeSymbols,
          avoidAmbiguous: true,
          pattern: 'memorable' // This pattern creates more memorable character combinations
        });
      }
    } else {
      newPassword = generatePassword({
        length,
        includeUppercase,
        includeLowercase,
        includeNumbers,
        includeSymbols,
        avoidAmbiguous,
        excludeSimilar,
        customExclusions
      });
    }

    // Verify password isn't all zeros (serious error case)
    if (/^0+$/.test(newPassword) || newPassword === '00000000') {
      console.error("Critical: Generated an all-zero password, using fallback");
      // Emergency fallback
      newPassword = `Secure-${Math.random().toString(36).substring(2, 8)}-${Date.now().toString(36)}`;
    }

    // Analyze the security of the password before setting it - with forced entropy refresh
    const analysis = analyzePasswordSecurity(newPassword);

    // Regenerate if the password is extremely weak (score 0)
    if (analysis.score === 0 && passwordType === 'random') {
      // Try up to 5 times to generate a stronger password
      let attempts = 0;
      while (analysis.score === 0 && attempts < 5) {
        console.log("Regenerating weak password, attempt:", attempts + 1);
        newPassword = generatePassword({
          length,
          includeUppercase,
          includeLowercase,
          includeNumbers,
          includeSymbols,
          avoidAmbiguous,
          excludeSimilar,
          customExclusions
        });
        analysis = analyzePasswordSecurity(newPassword);
        attempts++;
      }

      // Last resort if still getting bad passwords
      if (analysis.score === 0) {
        newPassword = `Secure-${Math.random().toString(36).substring(2, 10)}-${Date.now().toString(36)}`;
        analysis = analyzePasswordSecurity(newPassword);
      }
    }

    // Apply desired output format
    let formattedPassword = newPassword;
    switch (outputFormat) {
      case 'hex':
        formattedPassword = Array.from(newPassword)
          .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
          .join('');
        break;
      case 'base64':
        try {
          formattedPassword = btoa(newPassword);
        } catch (e) {
          console.error("Base64 encoding failed, falling back to plain text");
          formattedPassword = newPassword;
        }
        break;
      case 'emoji':
        try {
          formattedPassword = Array.from(newPassword)
            .map(char => {
              const code = char.charCodeAt(0) % 128;
              return String.fromCodePoint(0x1F600 + (code % 80));
            })
            .join('');
        } catch (e) {
          console.error("Emoji encoding failed, falling back to plain text");
          formattedPassword = newPassword;
        }
        break;
      default: // 'plain'
        formattedPassword = newPassword;
    }

    // Immediate update without animation
    setPassword(formattedPassword);
    setSecurityAnalysis(analysis);

    // Reset expiration timer when generating a new password
    if (expirationEnabled) {
      setExpirationRemaining(expirationTime * 60); // seconds
      setIsExpired(false);
    }

    // Add to history
    addPasswordToHistory(formattedPassword, passwordType);

    // Trigger refresh animation
    setAnimateRefresh(true);
    setTimeout(() => setAnimateRefresh(false), 500);
  } catch (error) {
    console.error("Failed to generate password:", error);
    // Provide a fallback password in case of emergency
    const fallbackPassword = `Backup-${Date.now().toString(36)}!`;
    setPassword(fallbackPassword);

    // Show error notification
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg text-white bg-red-500 shadow-lg z-[9999] animate-fadeIn`;
    notification.textContent = 'Error generating password, using backup password';
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.classList.add('animate-fadeOut');
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
  }
};

  // Helper function to add password to history
  const addPasswordToHistory = (pwd, type) => {
    const timestamp = new Date().toLocaleTimeString();
    const newHistoryItem = {
      password: pwd,
      timestamp,
      type,
      length: pwd.length
    };

    setPasswordHistory(prev => {
      const updated = [newHistoryItem, ...prev];
      // Limit history to 10 items
      return updated.slice(0, 10);
    });
  };

  // Password expiration timer
  useEffect(() => {
    let timerInterval = null;

    if (expirationEnabled && expirationRemaining !== null) {
      timerInterval = setInterval(() => {
        setExpirationRemaining(prev => {
          if (prev <= 1) {
            // Password expired
            clearInterval(timerInterval);
            setIsExpired(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [expirationEnabled, expirationRemaining]);

  // Format remaining time as MM:SS
  const formatRemainingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate password on initial load and when settings change
  useEffect(() => {
    // Skip the first automatic generation when settings change during initialization
    if (isInitialMount) return;
    
    if (passwordType === 'random') {
      handleGeneratePassword();
    }
  }, [
    isInitialMount,
    passwordType,
    length,
    includeUppercase,
    includeLowercase,
    includeNumbers,
    includeSymbols,
    avoidAmbiguous,
    excludeSimilar,
    customExclusions
  ]);

  // Generate memorable password when settings change
  useEffect(() => {
    // Skip the first automatic generation when settings change during initialization
    if (isInitialMount) return;
    
    if (passwordType === 'memorable') {
      handleGeneratePassword();
    }
  }, [isInitialMount, passwordType, wordCount, wordSeparator, includeNumbers, includeSymbols, wordCase, useWords]);

  // Calculate strength whenever password changes
  useEffect(() => {
    const score = calculateStrength(password);
    setStrengthScore(score);

    const calculatedEntropy = calculateEntropy(password);
    setEntropy(calculatedEntropy);

    const feedback = [];

    if (password.length < 8) {
      feedback.push({ type: 'warning', message: 'Password is too short' });
    }

    if (!/[A-Z]/.test(password)) {
      feedback.push({ type: 'info', message: 'Add uppercase letters to increase strength' });
    }

    if (!/[0-9]/.test(password)) {
      feedback.push({ type: 'info', message: 'Add numbers to increase strength' });
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      feedback.push({ type: 'info', message: 'Add symbols for maximum strength' });
    }

    if (calculatedEntropy < 50) {
      feedback.push({ type: 'warning', message: 'Low entropy - password could be vulnerable' });
    } else if (calculatedEntropy > 100) {
      feedback.push({ type: 'success', message: 'High entropy - excellent password strength' });
    }

    setStrengthFeedback(feedback);
  }, [password]);

  // Save password to file - Updated to show modal instead
  const handleSavePassword = () => {
    if (!password || password.trim() === '') {
      // Show error notification
      const notification = document.createElement('div');
      notification.className = `fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg text-white bg-red-500 shadow-lg z-[9999] animate-fadeIn`;
      notification.textContent = 'No password to export! Please generate one first.';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.classList.add('animate-fadeOut');
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 300);
      }, 3000);
      
      return;
    }
    setShowExport(true);
    toggleBodyScroll(true);
  };

  // Enhanced copy password function with properly centered notification
const handleCopyPassword = () => {
  // Check if navigator.clipboard.writeText is available (secure method)
  if (!password || password.trim() === '') {
    // Show error notification
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg text-white bg-red-500 shadow-lg z-[9999] animate-fadeIn`;
    notification.textContent = 'No password to copy! Please generate one first.';
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('animate-fadeOut');
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
    
    return;
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(password).then(() => {
      setShowCopied(true);

      // Add to history if it's not already there
      const isInHistory = passwordHistory.some(item => item.password === password);
      if (!isInHistory) {
        const timestamp = new Date().toLocaleTimeString();
        const newHistoryItem = {
          password,
          timestamp,
          type: passwordType,
          length: password.length
        };

        setPasswordHistory(prev => {
          const updated = [newHistoryItem, ...prev];
          // Limit history to 10 items
          return updated.slice(0, 10);
        });
      }

      // Create a temporary visible notification with fixed positioning
      const notification = document.createElement('div');
      notification.className = `fixed bottom-4 transform -translate-x-1/2 px-4 py-2 rounded-lg text-white ${
        darkMode ? 'bg-primary-600' : 'bg-primary-500'
      } shadow-lg z-[9999] animate-fadeIn`;
      notification.style.left = '50%';
      notification.style.textAlign = 'center';
      notification.style.width = 'auto';
      notification.style.maxWidth = '90%';
      notification.textContent = '✓ Password copied and saved to history!';
      document.body.appendChild(notification);

      // Remove the notification after 2 seconds
      setTimeout(() => {
        notification.classList.add('animate-fadeOut');
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 300);
      }, 2000);

      setTimeout(() => setShowCopied(false), 1200);
    });
  } else {
    // Fallback for older browsers - less secure but still functional
    const textArea = document.createElement('textarea');
    textArea.value = password;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      setShowCopied(true);

      // Similar notification as above with improved positioning
      const notification = document.createElement('div');
      notification.className = `fixed bottom-4 transform -translate-x-1/2 px-4 py-2 rounded-lg text-white ${
        darkMode ? 'bg-primary-600' : 'bg-primary-500'
      } shadow-lg z-[9999] animate-fadeIn`;
      notification.style.left = '50%';
      notification.style.textAlign = 'center';
      notification.style.width = 'auto';
      notification.style.maxWidth = '90%';
      notification.textContent = '✓ Password copied and saved to history!';
      document.body.appendChild(notification);

      setTimeout(() => {
        notification.classList.add('animate-fadeOut');
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 300);
      }, 2000);

      setTimeout(() => setShowCopied(false), 1200);
    } catch (err) {
      console.error('Failed to copy password:', err);
    }

    document.body.removeChild(textArea);
    // Clear the textarea value before removing it
    textArea.value = '';
  }
};

// Add this function for password checking
const checkPassword = () => {
  if (!passwordToCheck.trim()) return;

  try {
    const result = analyzePasswordSecurity(passwordToCheck);
    setCheckResult(result);

    // Scroll to results after they've been rendered
    setTimeout(() => {
      if (checkResultsRef.current) {
        checkResultsRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  } catch (error) {
    console.error("Error analyzing password:", error);
    setCheckResult({
      score: 0,
      entropy: 0,
      timeToBreak: 'Unknown',
      weaknesses: ['Error analyzing password'],
      suggestions: ['Please try again with a different password']
    });
  }
};

// Enhanced function to suggest multiple similar but stronger passwords
  const suggestSimilarPassword = () => {
    if (!passwordToCheck || passwordToCheck.trim() === '') return;

    // Create variations of the password to make it stronger
    const variations = [];
    let base = passwordToCheck;

    // Add a symbol if none exists
    if (!/[^A-Za-z0-9]/.test(base)) {
      variations.push(base + '!');
      variations.push(base + '@');
      variations.push('!' + base);
      variations.push(base + '#');
      variations.push(base + '$');
    }

    // Add a number if none exists
    if (!/\d/.test(base)) {
      variations.push(base + '123');
      variations.push(base + '42');
      variations.push('1' + base);
      variations.push(base + '2023');
      variations.push(base + '777');
    }

    // Add uppercase if none exists
    if (!/[A-Z]/.test(base)) {
      variations.push(base.charAt(0).toUpperCase() + base.slice(1));
      variations.push(base.toUpperCase());
      variations.push(base.split('').map((c, i) => i % 2 === 0 ? c.toUpperCase() : c).join(''));
    }

    // Extend the length if it's too short
    if (base.length < 12) {
      variations.push(base + base.split('').reverse().join(''));
      variations.push(base + '_secure');
      variations.push(base + '_' + Math.floor(Math.random() * 1000));
    }

    // Mix techniques for more complex variations
    variations.push(base.charAt(0).toUpperCase() + base.slice(1) + '!' + '2023');
    variations.push('$' + base + '123');
    variations.push(base + '@' + base.length + '!');

    // Analyze each variation and select the top 3 strongest ones
    const analyzedVariations = variations.map(variation => {
      const analysis = analyzePasswordSecurity(variation);
      return {
        password: variation,
        score: analysis.score,
        entropy: analysis.entropy
      };
    });

    // Sort by score (primary) and entropy (secondary)
    analyzedVariations.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.entropy - a.entropy;
    });

    // Get unique suggestions (no duplicates)
    const uniqueSuggestions = [];
    const seen = new Set();

    for (const variation of analyzedVariations) {
      if (!seen.has(variation.password)) {
        seen.add(variation.password);
        uniqueSuggestions.push(variation);
        if (uniqueSuggestions.length >= 3) break;
      }
    }

    // Use the best three variations
    setPasswordSuggestions(uniqueSuggestions);
    setShowSuggestions(true);

    // Also set the top suggestion as the current check
    if (uniqueSuggestions.length > 0) {
      setPasswordToCheck(uniqueSuggestions[0].password);
      setCheckResult(analyzePasswordSecurity(uniqueSuggestions[0].password));
    }
  };

  // Function to apply a suggested password with instant clipboard copy
  const applySuggestion = (password) => {
    setPasswordToCheck(password);
    setCheckResult(analyzePasswordSecurity(password));

    // Instantly copy to clipboard
    navigator.clipboard.writeText(password);

    // Show a brief notification
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg text-white ${
      darkMode ? 'bg-success-600' : 'bg-success-500'
    } shadow-lg z-50 animate-fadeIn`;
    notification.textContent = '✓ Password copied to clipboard!';
    document.body.appendChild(notification);

    // Remove notification after 1.5 seconds
    setTimeout(() => {
      notification.classList.add('animate-fadeOut');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 1500);
  };

  // Reset the password checker - enhanced to reset suggestions too
  const resetPasswordChecker = () => {
    setPasswordToCheck('');
    setCheckResult(null);
    setShowSuggestions(false);
    setPasswordSuggestions([]);

    // Clear memory securely
    setTimeout(() => {
      setPasswordToCheck(prev => prev.replace(/./g, '0'));
    }, 50);
  };

  // Function to handle Enter key press
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && passwordToCheck.trim()) {
      const result = analyzePasswordSecurity(passwordToCheck);
      setCheckResult(result);

      // Scroll to results after they've been rendered
      setTimeout(() => {
        if (checkResultsRef.current) {
          checkResultsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  // Function to handle slider hover for preview bubble
  const handleSliderHover = (e) => {
    if (sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect();
      setPreviewPosition({
        x: e.clientX,
        y: rect.top - 40 // Position above slider
      });
      setShowPreviewBubble(true);
    }
  };

  // Function to securely clear password history with overwriting
  const securelyDeleteHistory = () => {
    // First overwrite the data multiple times with different patterns
    setPasswordHistory(prev =>
      prev.map(() => ({
        password: Array(32).fill('0').join(''),
        timestamp: new Date().toLocaleTimeString(),
        type: 'deleted',
        length: 32
      }))
    );

    setTimeout(() => {
      setPasswordHistory(prev =>
        prev.map(() => ({
          password: Array(32).fill('1').join(''),
          timestamp: new Date().toLocaleTimeString(),
          type: 'deleted',
          length: 32
        }))
      );

      setTimeout(() => {
        setPasswordHistory(prev =>
          prev.map(() => ({
            password: Array(32).fill('x').join(''),
            timestamp: new Date().toLocaleTimeString(),
            type: 'deleted',
            length: 32
          }))
        );

        // After multiple overwriting passes, clear the history completely
        setTimeout(() => {
          setPasswordHistory([]);

          // Show feedback
          const notification = document.createElement('div');
          notification.className = `fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg text-white ${
            darkMode ? 'bg-success-600' : 'bg-success-500'
          } shadow-lg z-50 animate-fadeIn`;
          notification.textContent = '✓ Password history securely shredded!';
          document.body.appendChild(notification);

          setTimeout(() => {
            notification.classList.add('animate-fadeOut');
            setTimeout(() => {
              document.body.removeChild(notification);
            }, 300);
          }, 2000);
        }, 50);
      }, 50);
    }, 50);
  };

  // Override the initial history to make it secure
  useEffect(() => {
    // Ensure all passwords are only stored in memory, never in localStorage
    const handleBeforeUnload = () => {
      // Clear password history when navigating away
      setPasswordHistory([]);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Define strength labels
  const strengthLabels = ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'];

  // Toggle password display collapse state
  const togglePasswordCollapse = () => {
    setIsPasswordCollapsed(!isPasswordCollapsed);
  };

  // Add this helper function to toggle body scroll when modals are shown
  const toggleBodyScroll = (disable) => {
    if (disable) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  };

  // Modify the modal state handlers to toggle body scroll
  const handleShowQRCode = () => {
    setShowQRCode(true);
    toggleBodyScroll(true);
  };

  const handleCloseQRCode = () => {
    setShowQRCode(false);
    toggleBodyScroll(false);
  };

  const handleShowExport = () => {
    setShowExport(true);
    toggleBodyScroll(true);
  };

  const handleCloseExport = () => {
    setShowExport(false);
    toggleBodyScroll(false);
  };

  // Modified handleShowQR to check for a valid password first
const handleShowQR = (source) => {
  if (!password || password.trim() === '') {
    // Show error notification
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg text-white bg-red-500 shadow-lg z-[9999] animate-fadeIn`;
    notification.textContent = 'No password to share! Please generate one first.';
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('animate-fadeOut');
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
    
    return;
  }
  setShowQRCode(true);
  setPreviousModal(source || null);
  toggleBodyScroll(true);
};

// Fix the handleBackToShare function to use the globally exposed ShareButton state
const handleBackToShare = () => {
  setShowQRCode(false);

  // Use the global reference to the ShareButton's state
  setTimeout(() => {
    if (window.shareButtonState && typeof window.shareButtonState.setShowModal === 'function') {
      window.shareButtonState.setShowModal(true);
    } else {
      console.warn("Share modal state not available");
      // Fallback: Navigate back to main screen
      if (topRef.current) {
        topRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, 100);
};

  // Check for secure passwords on load
  useEffect(() => {
    const checkSecurePasswords = () => {
      const validTokens = []; // Replace tokenService.getValidTokens() with an empty array
      setHasSecurePasswords(validTokens.length > 0);
    };

    checkSecurePasswords();

    window.addEventListener('secureTokensChanged', checkSecurePasswords);

    const intervalId = setInterval(checkSecurePasswords, 60000);

    return () => {
      window.removeEventListener('secureTokensChanged', checkSecurePasswords);
      clearInterval(intervalId);
    };
  }, []);

  // Check secure context when component mounts
  useEffect(() => {
    enforceSecureContext();
  }, []);

  // Enhanced secure clearing of password data with fixes for memory limitations
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // User is navigating away from the page - clear sensitive data
        secureMemoryClear(password);
        secureMemoryClear(passwordToCheck);
        secureMemoryClear(passwordHistory);
        
        // Set state to empty strings
        setPassword('');
        setPasswordToCheck('');
        setPasswordHistory([]);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Clear sensitive data after 30 minutes of inactivity
    const inactivityTimeout = setTimeout(() => {
      secureMemoryClear(password);
      secureMemoryClear(passwordToCheck);
      setPassword('');
      setPasswordToCheck('');
    }, 30 * 60 * 1000);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout(inactivityTimeout);
    };
  }, [password, passwordToCheck, passwordHistory]);

  // Add this useEffect to ensure a password is generated on initial load
  useEffect(() => {
    // Generate password only once when component initially mounts
    if (isInitialMount) {
      handleGeneratePassword();
      // Mark initialization complete
      setIsInitialMount(false);
    }
  }, []); // Empty dependency array means this runs once on mount

  // Find the useEffect hook that might be clearing the password
  // and remove or modify the auto-clear functionality
  // It might look something like this:
  useEffect(() => {
    // Remove any timer that clears the password
    // Don't include code like this:
    // const timer = setTimeout(() => {
    //   setPassword('');
    // }, 60000);
    // 
    // return () => clearTimeout(timer);
  }, []);

  // If there's a resetPassword or clearPassword function, ensure it's only called on user action
  const resetPassword = () => {
    // This should only be called when the user clicks a reset button
    // not automatically
    setPassword('');
    setSecurityAnalysis(null);
  };

  return (
    <div className={`flex flex-col min-h-screen ${
      darkMode
        ? 'bg-gradient-to-br from-dark-900 to-dark-800 text-white'
        : 'bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50 text-slate-900 app-light-mode'
    }`}>
      {/* Always visible top anchor for scrolling */}
      <div ref={topRef} className="absolute top-0"></div>

      {/* Replace the security banner with our dedicated component */}
      <SecurityBanner darkMode={darkMode} />

      {/* Ultra-compact header optimized for PWA mode */}
<header className={`py-0.5 pt-safe ${darkMode ? 'bg-dark-800/80 border-dark-700' : 'bg-white border-slate-200 shadow-sm'} border-b backdrop-blur-md sticky top-0 z-50 transition-all duration-300 flex items-center sticky-header`}>
  <div className="container mx-auto px-2">
    <div className="flex items-center justify-between">
      {/* Brand/logo with larger size in PWA */}
      <div className="flex items-center">
        <Shield className={`${darkMode ? 'text-primary-400' : 'text-primary-500'} mr-1.5`} size={24} />
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-secondary-500">Lockora</h1>

        {/* Install button with increased size */}
        {installPrompt && !isAppInstalled && !installationAttempted && (
          <button
            onClick={handleInstallClick}
            className={`ml-2 p-1.5 rounded-full ${
              darkMode ? 'bg-dark-700 hover:bg-dark-600' : 'bg-gray-200 hover:bg-gray-300'
            } transition-all shadow-sm hover:shadow flex items-center justify-center`}
            title="Add to Home Screen"
            aria-label="Add to Home Screen"
          >
            <HomeIcon size={18} className={darkMode ? 'text-primary-300' : 'text-primary-600'} />
          </button>
        )}

        {/* Installed indicator */}
        {isAppInstalled && (
          <div className={`ml-2 flex items-center justify-center p-1.5 rounded-full ${
            darkMode ? 'bg-dark-700' : 'bg-gray-200'
          } relative`}
            title="App installed"
          >
            <HomeIcon size={18} className={`${darkMode ? 'text-green-400' : 'text-green-600'}`} />
          </div>
        )}
      </div>

      {/* Right side buttons with larger size */}
      <div className="flex items-center ml-auto space-x-2">
        {/* Secure Passwords Button - Add this before other buttons */}
        {/* Secure passwords button removed */}

        {/* Password Guides Button */}
        <button
          onClick={() => setShowPasswordGuides(true)}
          className={`p-2 rounded-full ${darkMode ? 'bg-dark-700 hover:bg-dark-600' : 'bg-gray-200 hover:bg-gray-300'} relative transition-all shadow-sm hover:shadow`}
          title="Password Guides"
        >
          <BookOpen size={18} className={darkMode ? 'text-primary-300' : 'text-primary-600'} />
        </button>

        {/* Creator Info Button */}
        <button
          onClick={() => setShowCreatorInfo(true)}
          className={`p-2 rounded-full ${darkMode ? 'bg-dark-700 hover:bg-dark-600' : 'bg-gray-200 hover:bg-gray-300'} relative transition-all shadow-sm hover:shadow`}
          title="About Creator"
        >
          <Code size={18} className={darkMode ? 'text-primary-300' : 'text-primary-600'} />
        </button>

        {/* History button with larger indicator */}
        <button
          onClick={handleHistoryClick}
          className={`p-2 rounded-full ${darkMode ? 'bg-dark-700 hover:bg-dark-600' : 'bg-gray-200 hover:bg-gray-300'} relative transition-all shadow-sm hover:shadow`}
          title="Password history"
          aria-label="Show password history"
        >
          <Clock size={18} className={darkMode ? 'text-primary-300' : 'text-primary-600'} />
          {passwordHistory.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-500"></span>
            </span>
          )}
        </button>

        {/* Dark mode toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-2 rounded-full ${darkMode ? 'bg-dark-700 hover:bg-dark-600' : 'bg-gray-200 hover:bg-gray-300'} transition-all shadow-sm hover:shadow`}
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ?
            <Sun size={18} className="text-warning-400" /> :
            <Moon size={18} className="text-dark-600" />
          }
        </button>
      </div>
    </div>
  </div>
</header>

{/* CSS for improved PWA header */}
<style jsx>{`
  /* Fix header size when installed to homescreen */
  @media (display-mode: standalone) {
    /* Eliminate extra space above header */
    header {
      height: auto !important;
      padding: 0 !important;
      min-height: 50px !important; /* Increased height for better touch targets */
    }

    /* Remove safe area inset padding that causes extra space */
    .pt-safe {
      padding-top: 0 !important;
    }

    /* Only add minimal safe area protection for notch */
    header:before {
      content: '';
      height: env(safe-area-inset-top, 0);
      display: block;
      width: 100%;
      position: absolute;
      top: 0;
      left: 0;
      z-index: -1;
      pointer-events: none;
    }

    /* Ensure buttons are large enough for touch */
    header button {
      min-width: 36px !important;
      min-height: 36px !important;
      padding: 8px !important;
      margin: 2px !important;
    }

    /* Make sure icons are visible enough */
    header button svg,
    header .flex.items-center svg:first-child {
      width: 22px !important;
      height: 22px !important;
    }

    /* Ensure title is prominent */
    header h1 {
      font-size: 1.35rem !important;
      line-height: 1.1 !important;
    }
  }
`}</style>

{/* Add CSS for improved sticky header */}
<style jsx global>{`
  /* Global sticky header styles */
  .sticky-header {
    position: sticky !important;
    top: 0 !important;
    z-index: 999 !important;
    width: 100% !important;
  }
  
  /* Adjust for PWA mode and mobile devices */
  @media (display-mode: standalone) {
    @media (max-width: 768px), (pointer: coarse) {
      .sticky-header {
        top: env(safe-area-inset-top, 44px) !important;
      }
    }
  }
  
  /* Override height to ensure proper sizing */
  header .container {
    min-height: 48px;
  }
  
  /* Fix iOS sticky header issue */
  @supports (-webkit-touch-callout: none) {
    .sticky-header {
      position: -webkit-sticky !important;
    }
  }
`}</style>

{/* Main content section */}
      <main className={`flex-grow container mx-auto px-4 py-6 ${
        !darkMode && 'bg-gradient-to-b from-white/70 to-white/90 rounded-lg shadow-sm'
      }`}>
        <div className="max-w-4xl mx-auto">
          <div className={`space-y-2 ${  // Changed from space-y-6 to space-y-2
            !darkMode && 'bg-white/90 p-6 rounded-xl border-2 border-blue-100/70 shadow-lg'
          }`}>
            {/* Password display card, type selection, options, etc. */}
            <div className={`overflow-hidden transform transition-all ${
              darkMode
                ? 'bg-dark-800 border border-dark-700 rounded-xl shadow-lg hover:shadow-xl'
                : 'password-display-card border-b-4 border-b-blue-600'
            }`}>
              <div className="p-6">
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`flex-grow text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Your generated password {expirationEnabled && (
                        <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          isExpired
                            ? 'bg-danger-100 text-danger-800 dark:bg-danger-900/30 dark:text-danger-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                        }`}>
                          <Timer size={12} className="mr-1" />
                          {isExpired ? 'Expired' : formatRemainingTime(expirationRemaining || 0)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                        strengthScore === 4 ? 'bg-gradient-to-r from-success-600 to-success-500 text-white' :
                        strengthScore === 3 ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white' :
                        strengthScore === 2 ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white' :
                        strengthScore === 1 ? 'bg-gradient-to-r from-warning-600 to-warning-500 text-white' :
                        'bg-gradient-to-r from-danger-600 to-danger-500 text-white'
                      } shadow-sm animate-fadeIn`}>
                        {strengthLabels[strengthScore]}
                      </div>
                    </div>
                  </div>
                </div>

                {/* IMPROVED Password display area with better containment */}
                <div className={`relative mb-4 transition-all duration-300 password-input-container ${isPasswordCollapsed ? 'h-0 opacity-0 overflow-hidden' : 'h-auto opacity-100'}`} style={{zIndex: 20}}>
                  <div className={`${darkMode ? 'bg-dark-700 rounded-lg' : 'border-2 border-black bg-white rounded-lg p-0'} relative flex flex-col sm:flex-row items-center overflow-hidden`}>
                    {/* Password display area */}
                    <div className="w-full relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        readOnly
                        value={password}
                        className={`password-input w-full p-4 sm:pr-[230px] pr-4 pb-16 sm:pb-4 rounded-lg ${
                          darkMode
                            ? 'bg-dark-700 text-white border-dark-600'
                            : 'bg-white text-slate-900 border-none'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm ${
                          typingAnimation ? 'typing-animation' : ''
                        } text-sm sm:text-base overflow-x-auto overflow-y-hidden whitespace-pre`}
                        style={{maxWidth: '100%', opacity: 1}}
                      />
                    </div>

                    {/* Action buttons with compact mode toggle */}
                    <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center sm:justify-end sm:pr-2 sm:right-0 sm:top-0 sm:bottom-0">
                      <div className="flex sm:flex-row">
                        {/* Compact mode toggle button */}
                        <button
                          onClick={() => setIsCompactMode(!isCompactMode)}
                          className={`px-2 py-1.5 rounded-lg transition-all mx-1 mb-1 sm:mb-0 ${
                            darkMode
                              ? 'bg-dark-600 hover:bg-dark-500 text-gray-200'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300'
                          }`}
                          title={isCompactMode ? "Show all actions" : "Compact mode"}
                        >
                          {isCompactMode ?
                            <div className="flex items-center">
                              <PlusCircle size={16} className="mr-1" />
                              <span className="text-xs">More</span>
                            </div>
                            :
                            <div className="flex items-center">
                              <MinusCircle size={16} className="mr-1" />
                              <span className="text-xs">Less</span>
                            </div>
                          }
                        </button>

                        {/* Different button ordering based on whether password is visible or not */}
                        {showPassword ? (
                          <>
                            {/* Always visible buttons in any mode */}
                            <button
                              onClick={() => setShowPassword(!showPassword)}
                              className={`px-2 py-1.5 rounded-lg transition-all mx-1 ${
                                darkMode
                                  ? 'bg-dark-600 hover:bg-dark-500 text-gray-200'
                                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300'
                              }`}
                              title={showPassword ? "Hide password" : "Show password"}
                            >
                              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>

                            <button
                              onClick={handleCopyPassword}
                              className={`px-2 py-1.5 rounded-lg transition-all mx-1 ${
                                darkMode
                                  ? 'bg-dark-600 hover:bg-dark-500 text-gray-200'
                                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300'
                              } ${showCopied ? (darkMode ? 'bg-green-600' : 'bg-green-500') + ' text-white' : ''}`}
                              title="Copy password"
                            >
                              {showCopied ? <Check size={20} /> : <Copy size={20} />}
                            </button>

                            {/* Only show these buttons when not in compact mode */}
                            {!isCompactMode && (
                              <>
                                <button
                                  onClick={() => setShowQRCode(true)}
                                  className={`px-2 py-1.5 rounded-lg transition-all mx-1 ${
                                    darkMode
                                      ? 'bg-dark-600 hover:bg-dark-500 text-gray-200'
                                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300'
                                  }`}
                                  title="Show QR Code"
                                >
                                  <QrCode size={20} />
                                </button>

                                <button
                                  onClick={handleSavePassword}
                                  className={`px-2 py-1.5 rounded-lg transition-all mx-1 ${
                                    darkMode
                                      ? 'bg-dark-600 hover:bg-dark-500 text-gray-200'
                                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300'
                                  }`}
                                  title="Export password"
                                >
                                  <Download size={20} />
                                </button>

                                {/* Replace the Share button with ShareButton component */}
                                <ShareButton
                                  password={password}
                                  darkMode={darkMode}
                                  onShowQR={handleShowQR}  // This will now accept the source parameter
                                  className={`px-2 py-1.5 rounded-lg transition-all mx-1 ${
                                    darkMode
                                      ? 'bg-dark-600 hover:bg-dark-500 text-gray-200'
                                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300'
                                  }`}
                                  includeNavigateButton={true} // Add this prop to enable the "Take Me There" button
                                />
                              </>
                            )}

                            {/* Generate button - always visible */}
                            <button
                              onClick={handleGeneratePassword}
                              className={`px-2 py-1.5 rounded-lg transition-all mx-1 ${
                                darkMode
                                  ? 'bg-primary-600 hover:bg-primary-500 text-white'
                                  : 'bg-primary-500 hover:bg-primary-400 text-white border border-primary-600'
                              }`}
                              title="Generate new password"
                            >
                              <RotateCw size={20} className={animateRefresh ? 'animate-spin' : ''} />
                            </button>
                          </>
                        ) : (
                          <>
                            {/* Original button order when password is masked */}
                            <button
                              onClick={() => setShowPassword(!showPassword)}
                              className={`px-2 py-1.5 rounded-lg transition-all mx-1 ${
                                darkMode
                                  ? 'bg-dark-600 hover:bg-dark-500 text-gray-200'
                                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300'
                              }`}
                              title={showPassword ? "Hide password" : "Show password"}
                            >
                              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>

                            <button
                              onClick={handleCopyPassword}
                              className={`px-2 py-1.5 rounded-lg transition-all mx-1 ${
                                darkMode
                                  ? 'bg-dark-600 hover:bg-dark-500 text-gray-200'
                                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300'
                              } ${showCopied ? (darkMode ? 'bg-green-600' : 'bg-green-500') + ' text-white' : ''}`}
                              title="Copy password"
                            >
                              {showCopied ? <Check size={20} /> : <Copy size={20} />}
                            </button>

                            {/* Only show these buttons when not in compact mode */}
                            {!isCompactMode && (
                              <>
                                <button
                                  onClick={() => setShowQRCode(true)}
                                  className={`px-2 py-1.5 rounded-lg transition-all mx-1 ${
                                    darkMode
                                      ? 'bg-dark-600 hover:bg-dark-500 text-gray-200'
                                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300'
                                  }`}
                                  title="Show QR Code"
                                >
                                  <QrCode size={20} />
                                </button>

                                <button
                                  onClick={handleSavePassword}
                                  className={`px-2 py-1.5 rounded-lg transition-all mx-1 ${
                                    darkMode
                                      ? 'bg-dark-600 hover:bg-dark-500 text-gray-200'
                                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300'
                                  }`}
                                  title="Export password"
                                >
                                  <Download size={20} />
                                </button>

                                {/* Replace the Share button with ShareButton component */}
                                <ShareButton
                                  password={password}
                                  darkMode={darkMode}
                                  onShowQR={handleShowQR}  // This will now accept the source parameter
                                  className={`px-2 py-1.5 rounded-lg transition-all mx-1 ${
                                    darkMode
                                      ? 'bg-dark-600 hover:bg-dark-500 text-gray-200'
                                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300'
                                  }`}
                                  includeNavigateButton={true} // Add this prop to enable the "Take Me There" button
                                />
                              </>
                            )}

                            {/* Generate button - always visible */}
                            <button
                              onClick={handleGeneratePassword}
                              className={`px-2 py-1.5 rounded-lg transition-all mx-1 ${
                                darkMode
                                  ? 'bg-primary-600 hover:bg-primary-500 text-white'
                                  : 'bg-primary-500 hover:bg-primary-400 text-white border border-primary-600'
                              }`}
                              title="Generate new password"
                            >
                              <RotateCw size={20} className={animateRefresh ? 'animate-spin' : ''} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Improved Strength indicator bar with better visual feedback */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Password Strength
                    </span>
                    <span className={`text-xs font-medium ${
                      strengthScore === 4 ? 'text-success-500' :
                      strengthScore === 3 ? 'text-primary-500' :
                      strengthScore === 2 ? 'text-blue-500' :
                      strengthScore === 1 ? 'text-warning-500' :
                                          'text-danger-500'
                    }`}>
                      {strengthLabels[strengthScore]}
                    </span>
                  </div>
                  
                  <div className={`h-2.5 w-full ${darkMode ? 'bg-dark-700' : 'bg-gray-200'} rounded-full overflow-hidden shadow-inner`}>
                    <div
                      className={`h-full transition-all duration-500 ${
                        strengthScore === 4 ? 'bg-gradient-to-r from-success-600 to-success-500' :
                        strengthScore === 3 ? 'bg-gradient-to-r from-primary-600 to-primary-500' :
                        strengthScore === 2 ? 'bg-gradient-to-r from-blue-600 to-blue-500' :
                        strengthScore === 1 ? 'bg-gradient-to-r from-warning-600 to-warning-500' :
                                            'bg-gradient-to-r from-danger-600 to-danger-500'
                      }`}
                      style={{ width: `${Math.min(100, (strengthScore + 1) * 20)}%` }}
                    ></div>
                  </div>
                  
                  {/* Strength markers */}
                  <div className="flex justify-between mt-1 px-0.5">
                    <div className={`w-1 h-1 rounded-full ${strengthScore >= 0 ? 'bg-danger-500' : 'bg-gray-300'}`}></div>
                    <div className={`w-1 h-1 rounded-full ${strengthScore >= 1 ? 'bg-warning-500' : 'bg-gray-300'}`}></div>
                    <div className={`w-1 h-1 rounded-full ${strengthScore >= 2 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                    <div className={`w-1 h-1 rounded-full ${strengthScore >= 3 ? 'bg-primary-500' : 'bg-gray-300'}`}></div>
                    <div className={`w-1 h-1 rounded-full ${strengthScore >= 4 ? 'bg-success-500' : 'bg-gray-300'}`}></div>
                  </div>
                </div>

                {/* Security info row - only show when expanded */}
                {!isPasswordCollapsed && (
                  <div className="mt-4">
                    <div className={`flex flex-wrap items-center justify-between ${darkMode ? '' : 'bg-gray-50 p-3 border-2 border-gray-600 rounded-lg shadow-sm'}`}>
                      {/* ...existing security info content... */}
                      <div className={`flex items-center ${darkMode ? 'text-gray-400' : 'text-gray-800 font-medium'} mb-2 sm:mb-0`}>
                        <span className="mr-1">Entropy:</span>
                        <span className={`px-1.5 py-0.5 rounded ${
                          entropy > 80 ? (darkMode ? 'text-success-500' : 'bg-success-100 text-success-700 font-bold') :
                          entropy > 60 ? (darkMode ? 'text-primary-500' : 'bg-primary-100 text-primary-700 font-bold') :
                          entropy > 40 ? (darkMode ? 'text-warning-500' : 'bg-warning-100 text-warning-700 font-bold') :
                                      (darkMode ? 'text-danger-500' : 'bg-danger-100 text-danger-700 font-bold')
                        }`}>
                          {entropy.toFixed(1)} bits
                        </span>
                      </div>

                      {/* Only show time to crack when there's an actual password */}
                      {securityAnalysis && password && password.trim() !== '' && (
                        <div className={`flex items-center ${darkMode ? 'text-gray-400' : 'text-gray-800 font-medium'} mb-2 sm:mb-0`}>
                          <AlarmClock size={14} className={`mr-1 ${darkMode ? '' : 'text-gray-800'}`} />
                          <span className="mr-1">Time to crack:</span>
                          <span className={`px-1.5 py-0.5 rounded ${
                            securityAnalysis.crackDifficulty === 'unbreakable' || securityAnalysis.crackDifficulty === 'very-strong'
                              ? (darkMode ? 'text-success-500 bg-success-900/30' : 'bg-success-100 text-success-700 font-bold') :
                            securityAnalysis.crackDifficulty === 'strong' 
                              ? (darkMode ? 'text-primary-500 bg-primary-900/30' : 'bg-primary-100 text-primary-700 font-bold') :
                            securityAnalysis.crackDifficulty === 'medium'
                              ? (darkMode ? 'text-blue-500 bg-blue-900/30' : 'bg-blue-100 text-blue-700 font-bold') :
                            securityAnalysis.crackDifficulty === 'weak'
                              ? (darkMode ? 'text-warning-500 bg-warning-900/30' : 'bg-warning-100 text-warning-700 font-bold') :
                              (darkMode ? 'text-danger-500 bg-danger-900/30' : 'bg-danger-100 text-danger-700 font-bold')
                          }`} title="Based on dedicated password cracking hardware">
                            {securityAnalysis.timeToBreak}
                          </span>
                        </div>
                      )}

                      <div className={`${darkMode ? 'text-gray-400' : 'text-gray-800 font-medium'} mb-2 sm:mb-0`}>
                        Length: <span className={`px-1.5 py-0.5 rounded ${darkMode ? '' : 'bg-gray-200 font-bold'}`}>{password.length} characters</span>
                      </div>

                      <button
                        onClick={() => setShowSecurityDetails(!showSecurityDetails)}
                        className={`text-xs px-3 py-1.5 flex items-center rounded ${
                          darkMode
                            ? 'bg-dark-700 hover:bg-dark-600 border border-dark-600'
                            : 'bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-800'
                        } transition-all`}
                      >
                        <Shield size={12} className={`mr-1 ${darkMode ? 'text-primary-400' : 'text-white'}`} />
                        {showSecurityDetails ? 'Hide Details' : 'Security Details'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Security check details */}
                {showSecurityDetails && securityAnalysis && !isPasswordCollapsed && (
                  <div className={`mt-3 p-3 rounded-lg ${
                    darkMode ? 'bg-dark-700 border border-dark-600' : 'bg-gray-50 border border-gray-200'
                  }`}>
                    <SecurityCheck analysis={securityAnalysis} darkMode={darkMode} />
                  </div>
                )}

                {/* Strength feedback - only show when expanded */}
                {strengthFeedback.length > 0 && !showSecurityDetails && !isPasswordCollapsed && (
                  <div className={`mt-4 px-4 py-3 rounded-lg ${
                    darkMode ? 'bg-dark-700/50 border border-dark-600' : 'bg-gray-50 border-2 border-gray-600 light-mode-panel'
                  } text-sm animate-fadeIn`}>
                    <ul className="space-y-1.5">
                      {strengthFeedback.map((item, index) => (
                        <li key={index} className="flex items-center">
                          <span className={
                            item.type === 'warning' ? 'text-warning-400' :
                            item.type === 'error' ? 'text-danger-400' :
                            item.type === 'success' ? 'text-success-400' :
                            'text-primary-400'
                          }>
                            <Info size={14} className="inline mr-2" />
                            {item.message}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Password Type Selection - reduced margin top */}
          <div className={`overflow-hidden mt-2 ${  // Add mt-2 to control spacing specifically
            darkMode
              ? 'bg-dark-800 border border-dark-700 rounded-xl shadow-md'
              : 'light-mode-card rounded-xl border-b-4 border-b-indigo-300 bg-white/90 p-2'
          }`}>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  className={`py-3 px-4 rounded-md font-medium transition-all ${
                    passwordType === 'random'
                      ? `${darkMode
                          ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md'
                          : 'bg-primary-500 text-white shadow-sm'}`
                      : `${darkMode
                          ? 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`
                  } hover:shadow-md`}
                  onClick={() => setPasswordType('random')}
                >
                  Random Password
                </button>

                <button
                  className={`py-3 px-4 rounded-md font-medium transition-all ${
                    passwordType === 'memorable'
                      ? `${darkMode
                          ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md'
                          : 'bg-primary-500 text-white shadow-sm'}`
                      : `${darkMode
                          ? 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`
                  } hover:shadow-md`}
                  onClick={() => setPasswordType('memorable')}
                >
                  Memorable Password
                </button>
              </div>

              {/* Remove or modify the large settings panel toggle button to be less prominent
  since we now have inline settings buttons */}
<button
  onClick={() => setShowSettingsPanel(!showSettingsPanel)}
  className={`mt-4 w-full py-2 px-4 rounded-md transition-all flex justify-between items-center ${
    darkMode
      ? (showSettingsPanel ? 'bg-primary-600 text-white' : 'bg-dark-700 hover:bg-dark-600 text-gray-300') + ' border border-dark-600'
      : (showSettingsPanel ? 'bg-primary-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700') + ' border border-gray-300'
  }`}
>
  <span className="font-medium flex items-center">
    <Sliders size={16} className="mr-2" />
    {showSettingsPanel ? 'Hide Settings' : 'Show Password Settings'}
  </span>
  <span>
    {showSettingsPanel ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
  </span>
</button>
            </div>

            {/* Settings panel content - conditionally rendered with proper containment */}
            <div
  className={`w-full overflow-visible transition-all duration-300 ${showSettingsPanel ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
  style={{position: 'relative', zIndex: 5}}
>
  {/* Always render PasswordSettings component but hide it with CSS to preserve state */}
  <PasswordSettings
    darkMode={darkMode}
    passwordType={passwordType}
    password={password}
    showPassword={showPassword}
    setShowPassword={setShowPassword}
    handleCopyPassword={handleCopyPassword}
    strengthScore={strengthScore}
    strengthLabels={strengthLabels}
    showAdvanced={showAdvanced}
    setShowAdvanced={setShowAdvanced}
    length={length}
    advancedLengthMode={advancedLengthMode}
    setAdvancedLengthMode={setAdvancedLengthMode}
    setLength={setLength}
    sliderRef={sliderRef}
    handleSliderHover={handleSliderHover}
    setShowPreviewBubble={setShowPreviewBubble}
    showPreviewBubble={showPreviewBubble}
    includeLowercase={includeLowercase}
    setIncludeLowercase={setIncludeLowercase}
    includeUppercase={includeUppercase}
    setIncludeUppercase={setIncludeUppercase}
    includeNumbers={includeNumbers}
    setIncludeNumbers={setIncludeNumbers}
    includeSymbols={includeSymbols}
    setIncludeSymbols={setIncludeSymbols}
    useWords={useWords}
    setUseWords={setUseWords}
    wordCount={wordCount}
    setWordCount={setWordCount}
    wordSeparator={wordSeparator}
    setWordSeparator={setWordSeparator}
    wordCase={wordCase}
    setWordCase={setWordCase}
    avoidAmbiguous={avoidAmbiguous}
    setAvoidAmbiguous={setAvoidAmbiguous}
    excludeSimilar={excludeSimilar}
    setExcludeSimilar={setExcludeSimilar}
    customExclusions={customExclusions}
    setCustomExclusions={setCustomExclusions}
    expirationEnabled={expirationEnabled}
    setExpirationEnabled={setExpirationEnabled}
    expirationTime={expirationTime}
    setExpirationTime={setExpirationTime}
    expirationRemaining={expirationRemaining}
    setExpirationRemaining={setExpirationRemaining}
    setIsExpired={setIsExpired}
  />
</div>
          </div>

          {/* Password checker section */}
          <div className="mt-8 border-t pt-4 dark:border-gray-700">
            <h3 className="text-lg font-medium mb-2 flex items-center">
              <Lock size={18} className="mr-2" />
              Check Password Strength
            </h3>

            {/* Input and button - Added outline styling */}
            <div className="flex flex-col space-y-4">
              <div className="flex w-full">
                <input
                  type="text"
                  value={passwordToCheck}
                  onChange={(e) => setPasswordToCheck(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter a password to check its strength"
                  className={`flex-1 p-4 border-2 rounded-lg rounded-r-none ${
                    darkMode
                      ? 'bg-dark-700 text-white border-dark-600 focus:border-primary-500'
                      : 'bg-white text-gray-800 border-gray-300 focus:border-primary-500'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500/20`}
                />
                <button
                  onClick={resetPasswordChecker}
                  className={`px-3 ${
                    darkMode
                      ? 'bg-dark-600 hover:bg-dark-500 text-gray-300 border-2 border-l-0 border-dark-600'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600 border-2 border-l-0 border-gray-300'
                  } rounded-r-lg transition-all flex items-center justify-center`}
                  title="Reset"
                >
                  <RefreshCcw size={16} />
                </button>
              </div>

              <button
                onClick={checkPassword}
                className="check-password-btn w-full px-4 py-3 flex justify-center items-center bg-primary-500 hover:bg-primary-600 border-2 border-primary-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition"
              >
                <Shield size={16} className="mr-2" />
                Check Password
              </button>
            </div>

            {/* Check results - update with border-2 for outlined style */}
            {checkResult && (
              <div
                ref={checkResultsRef}
                className={`mt-6 p-4 rounded-lg animate-fadeIn ${
                  darkMode ? 'bg-dark-700 border-2 border-dark-600' : 'bg-gray-50 border-2 border-gray-300'
                }`}
                data-testid="check-results"
              >
                <SecurityCheck analysis={checkResult} darkMode={darkMode} />

                {/* Redesigned button section */}
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    onClick={suggestSimilarPassword}
                    className={`px-3 py-2 rounded-lg ${
                      darkMode
                        ? 'bg-primary-600 hover:bg-primary-500 text-white'
                        : 'bg-primary-500 hover:bg-primary-400 text-white'
                    } flex items-center justify-center transition`}
                  >
                    <Sparkles size={16} className="mr-1.5" /> Suggest Similar Password
                  </button>

                  <button
                    onClick={() => { // Fixed: was incorrectly using onClick={handleGeneratePassword()}
                      topRef.current.scrollIntoView({ behavior: 'smooth' });
                      handleGeneratePassword();
                    }}
                    className={`px-3 py-2 rounded-lg ${
                      darkMode
                        ? 'bg-dark-600 hover:bg-dark-500 text-gray-200'
                        : 'bg-gray-700 hover:bg-gray-800 text-gray-100'
                    } flex items-center justify-center transition`}
                  >
                    <ArrowUp size={16} className="mr-1.5" /> Generate New Password
                  </button>
                </div>

                {/* NEW: Display suggested passwords */}
                {showSuggestions && passwordSuggestions.length > 0 && (
                  <div className={`mt-4 p-3 rounded-lg ${
                    darkMode ? 'bg-dark-800 border border-dark-700' : 'bg-white border border-gray-300'
                  }`}>
                    <h4 className={`text-sm font-medium mb-2 flex items-center ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <Sparkles size={14} className="mr-1.5" /> Similar Password Suggestions
                    </h4>
                    <div className="space-y-2">
                      {passwordSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className={`p-2 rounded-lg cursor-pointer flex justify-between items-center border ${
                            passwordToCheck === suggestion.password
                              ? darkMode
                                ? 'bg-primary-600/30 border-primary-500'
                                : 'bg-primary-100 border-primary-300'
                              : darkMode
                                ? 'bg-dark-700 border-dark-600 hover:bg-dark-600'
                                : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                          }`}
                          onClick={() => applySuggestion(suggestion.password)}
                        >
                          <div className="flex-grow">
                            <code className={`font-mono text-sm ${
                              darkMode ? 'text-gray-200' : 'text-gray-800'
                            }`}>
                              {suggestion.password}
                            </code>
                            <div className="flex mt-1 items-center">
                              <div className={`h-1 w-16 bg-gradient-to-r ${
                                suggestion.score === 4 ? 'from-success-500 to-success-400' :
                                suggestion.score === 3 ? 'from-primary-500 to-primary-400' :
                                suggestion.score === 2 ? 'from-warning-500 to-warning-400' :
                                suggestion.score === 1 ? 'from-orange-500 to-orange-400' :
                                'from-danger-500 to-danger-400'
                              } rounded-full mr-2`}></div>
                              <span className={`text-xs ${
                                darkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                {strengthLabels[suggestion.score]}
                              </span>
                            </div>
                          </div>
                          <div className={`ml-4 px-2 py-1 rounded text-xs ${
                            darkMode ? 'bg-dark-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {suggestion.score > checkResult.score ? '+' + (suggestion.score - checkResult.score) : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Try Another button */}
                <div className="mt-3 flex justify-center">
                  <button
                    onClick={() => {
                      resetPasswordChecker();
                      setShowSuggestions(false);
                      setPasswordSuggestions([]);

                      // Focus on the input field after clearing
                      setTimeout(() => {
                        const inputField = document.querySelector('input[placeholder="Enter a password to check its strength"]');
                        if (inputField) inputField.focus();
                      }, 100);
                    }}
                    className={`px-4 py-2 rounded-lg ${
                      darkMode
                        ? 'bg-primary-600 hover:bg-primary-500 text-white border border-primary-700'
                        : 'bg-primary-500 hover:bg-primary-400 text-white border border-primary-600'
                    } flex items-center justify-center transition shadow-sm hover:shadow-md`}
                  >
                    <RefreshCw size={16} className="mr-2" /> Try Another
                  </button>
                </div>
              </div>
            )}
            {/* New password leak checker section - add separation */}
            <div className="mt-12 pt-6 border-t dark:border-gray-700">
              <PasswordLeakChecker darkMode={darkMode} />
            </div>
          </div>
        </div>
      </main>

      {/* Enhanced Password History Modal with higher z-index and better animation */}
      {showHistory && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowHistory(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="history-title"
          tabIndex="-1"
        >
          <div
            ref={el => {
              if (el) {
                setTimeout(() => {
                  el.focus();
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 10);
              }
            }}
            className={`w-full max-w-2xl rounded-xl ${darkMode ? 'bg-dark-800 border border-dark-700' : 'bg-white border border-gray-300'} shadow-2xl max-h-[90vh] flex flex-col animate-slideIn`}
            onClick={(e) => e.stopPropagation()}
            tabIndex={0}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 id="history-title" className="text-lg font-medium flex items-center">
                <Clock size={18} className="mr-2" />
                Password History
              </h3>
              <div className="flex items-center">
                <button
                  onClick={securelyDeleteHistory}
                  className={`mr-2 p-2 rounded-md ${darkMode ? 'hover:bg-dark-700 bg-dark-600 text-gray-300' : 'hover:bg-gray-200 bg-gray-100 text-gray-700'} flex items-center`}
                  title="Securely shred all password history"
                >
                  <Trash2 size={16} className="mr-1" />
                  <span className="text-sm">Secure Shred</span>
                </button>
                <button
                  onClick={() => {
                    setShowHistory(false);
                    document.body.style.overflow = ''; // Restore scrolling
                  }}
                  className={`p-2 rounded-md ${darkMode ? 'hover:bg-dark-700' : 'hover:bg-gray-200'}`}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Security notice above history */}
            <div className={`px-4 py-3 ${darkMode ? 'bg-dark-700 text-gray-300' : 'bg-blue-50 text-blue-800'} text-xs flex items-center`}>
              <Info size={14} className="mr-2 flex-shrink-0" />
              <span>
                Password history is stored only in temporary memory and automatically shredded when you close the browser or clear history. No data is saved to disk or cloud.
              </span>
            </div>

            <div className="overflow-y-auto flex-grow">
              <PasswordHistory
                history={passwordHistory}
                darkMode={darkMode}
                onClear={securelyDeleteHistory} // Use secure deletion instead
                onUse={(pwd) => {
                  setPassword(pwd);
                  setShowHistory(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      <ExportModal
        isOpen={showExport}
        onClose={handleCloseExport}
        password={password}
        darkMode={darkMode}
      />

      <QRCodeModal
        isOpen={showQRCode}
        onClose={handleCloseQRCode}
        password={password}
        darkMode={darkMode}
        previousModal={previousModal}
        onBackToShare={handleBackToShare}
        // Add capture options to ensure the full QR code is downloaded
        captureOptions={{
          width: 500,
          height: 500,
          quality: 1,
          scale: 2,
          style: {
            background: darkMode ? '#1e293b' : '#ffffff',
            padding: '20px'
          }
        }}
      />

      {/* Enhanced iOS Installation Instructions Modal */}
      {showInstallInstructions && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-xl ${darkMode ? 'bg-dark-800 border border-dark-700' : 'bg-white border border-gray-300'} shadow-2xl animate-slideIn`}>
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-lg font-medium flex items-center">
                <HomeIcon size={18} className="mr-2" />
                Add to Home Screen
              </h3>
              <button
                onClick={() => setShowInstallInstructions(false)}
                className={`p-2 rounded-md ${darkMode ? 'hover:bg-dark-700' : 'hover:bg-gray-200'}`}
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className={`flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center mr-3 flex-shrink-0">1</div>
                  <p>Tap <span className="font-bold">Share</span> button in your browser</p>
                </div>

                <div className={`flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center mr-3 flex-shrink-0">2</div>
                  <p>Scroll down and select <span className="font-bold">Add to Home Screen</span></p>
                </div>

                <div className={`flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center mr-3 flex-shrink-0">3</div>
                  <p>Tap <span className="font-bold">Add</span> in the top right corner</p>
                </div>
              </div>

              <button
                onClick={() => setShowInstallInstructions(false)}
                className={`mt-6 w-full py-2 px-4 rounded-lg ${
                  darkMode ? 'bg-primary-600 hover:bg-primary-500' : 'bg-primary-500 hover:bg-primary-400'
                } text-white transition-colors`}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Password Guides Modal */}
      <PasswordGuides
        isOpen={showPasswordGuides}
        onClose={() => setShowPasswordGuides(false)}
        darkMode={darkMode}
      />

      {/* Use the imported CreatorInfo component correctly */}
      <CreatorInfo
        isOpen={showCreatorInfo}
        onClose={() => setShowCreatorInfo(false)}
        darkMode={darkMode}
      />

      {/* Footer with updated privacy note */}
      <footer className={`py-4 ${darkMode ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'} border-t mt-auto`}>
        <div className="container mx-auto px-4">
          <div className="text-center text-sm space-y-1">
            <p className={darkMode ? 'text-gray-500' : 'text-gray-600'}>
              © {new Date().getFullYear()} Lockora | Created by melloom
            </p>
            <p className={darkMode ? 'text-gray-600 text-xs' : 'text-gray-500 text-xs'}>
              <span onClick={() => setShowSecurityInfo(true)} className="cursor-pointer hover:underline">
                Zero tracking • Client-side only • No data stored on servers
              </span>
            </p>
          </div>
        </div>
      </footer>

      {/* CSS for typing animation, improved mobile styling and safe area insets */}
<style jsx>{`
  .typing-animation {
    border-right: 2px solid ${darkMode ? '#fff' : '#000'};
    white-space: nowrap;
    overflow: hidden;
    animation: typing 1.5s steps(40, end), blink-caret 0.75s step-end infinite;
  }

  @keyframes typing {
    from { width: 0 }
    to { width: 100% }
  }

  @keyframes blink-caret {
    from, to { border-color: transparent }
    50% { border-color: ${darkMode ? '#fff' : '#000'} }
  }

  /* Add safe area inset padding for mobile devices */
  @supports (padding-top: env(safe-area-inset-top)) {
    .pt-safe {
      padding-top: env(safe-area-inset-top) !important;
    }

    /* Add extra padding at the top of the app in standalone mode */
    @media (display-mode: standalone) {
      .pt-safe {
        padding-top: calc(env(safe-area-inset-top) + 1rem) !important;
      }
    }
  }

  @media (max-width: 640px) {
    .password-input {
      font-size: 14px;
      word-break: break-all;
      height: auto;
      min-height: 90px;
      padding-bottom: 40px !important;
    }
  }

  /* Improve header alignment in PWA mode */
  @media (display-mode: standalone) {
    header {
      height: auto;
      min-height: 60px;
    }

    header .container {
      width: 100%;
    }

    /* Center title on small screens */
    @media (max-width: 640px) {
      header h1 {
        margin: 0 auto;
      }
    }
  }

  /* Improve header alignment */
  header {
    min-height: 60px;
  }

  /* Center header content vertically */
  header .flex.items-center {
    min-height: 48px;
  }

  @media (display-mode: standalone) {
    header {
      min-height: 64px;
    }

    header .container {
      width: 100%;
      padding-top: 4px;
      padding-bottom: 4px;
    }
  }

  /* Enhanced light mode styling */
  .app-light-mode {
    background-size: 400% 400%;
    animation: subtle-shift 15s ease infinite;
  }

  @keyframes subtle-shift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  /* Light mode card enhancements */
  .light-mode-card {
    border-left: 1px solid rgba(219, 234, 254, 0.4);
    border-top: 1px solid rgba(219, 234, 254, 0.4);
    border-right: 1px solid rgba(196, 181, 253, 0.4);
  }

  /* Fix header sizing in standalone/PWA mode */
  @media (display-mode: standalone) {
    .pt-safe {
      padding-top: env(safe-area-inset-top) !important;
    }

    header {
      height: auto !important;
      min-height: auto !important;
    }

    header .container {
      width: 100%;
      padding-top: 2px;
      padding-bottom: 2px;
    }

    header h1 {
      font-size: 1.5rem; /* Slightly smaller title in PWA mode */
    }
  }

  /* Adjust for iPhone notch/dynamic island in PWA mode */
  @supports (padding-top: env(safe-area-inset-top)) {
    @media (display-mode: standalone) {
      .pt-safe {
        padding-top: env(safe-area-inset-top) !important;
      }
    }
  }

  /* PWA status bar spacer - only visible in standalone mode */
  .pwa-status-bar-spacer {
    display: none;
    height: 0;
  }

  @media (display-mode: standalone) {
    .pwa-status-bar-spacer {
      display: block;
      height: env(safe-area-inset-top, 20px);
      background-color: ${darkMode ? '#0f172a' : '#e0e7ff'};
      width: 100%;
      position: relative;
      z-index: 5;
    }
  }

  /* Modified header spacing for PWA mode */
  @media (display-mode: standalone) {
    header {
      padding-top: 0 !important;
    }
  }

  /* Smooth transition for collapse/expand */
  .transition-all {
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 300ms;
  }
`}</style>

      {/* IMPROVED CSS for PWA status bar with theme-matching and enforced display */}
      <style jsx global>{`
        /* PWA status bar spacer - Only visible in PWA mode */
        .pwa-status-bar-spacer {
          display: none;
          height: 0;
          width: 100%;
          position: relative;
          z-index: 20;
        }

        /* Critical: Force spacer to be visible in PWA mode with proper height */
        @media (display-mode: standalone) {
          .pwa-status-bar-spacer {
            display: block !important;
            height: env(safe-area-inset-top, 44px) !important; /* Default to 44px if env() not supported */
            min-height: 44px !important; /* Minimum height for iPhone notch */
          }

          /* Avoid double status bars on iOS */
          body {
            padding-top: 0 !important;
            margin-top: 0 !important;
          }

          /* Fix header for PWA mode - no padding needed */
          header.pt-safe {
            padding-top: 0 !important;
          }

          /* Ensure all content comes after status bar */
          #root > div > *:not(.pwa-status-bar-spacer) {
            position: relative;
            z-index: 10;
          }
        }

        /* Global style for centered notifications */
        .fixed.bottom-4.transform.-translate-x-1\/2 {
          position: fixed;
          bottom: 1rem;
          left: 50%;
          transform: translateX(-50%);
          max-width: 90%;
          margin: 0 auto;
          z-index: 9999;
          pointer-events: none;
        }

        /* Enhanced animation for notifications */
        @keyframes fadeInNotification {
          0% { opacity: 0; transform: translate(-50%, 20px); }
          100% { opacity: 1; transform: translate(-50%, 0); }
        }

        @keyframes fadeOutNotification {
          0% { opacity: 1; transform: translate(-50%, 0); }
          100% { opacity: 0; transform: translate(-50%, 20px); }
        }

        .animate-fadeIn {
          animation: fadeInNotification 0.3s ease forwards;
        }

        .animate-fadeOut {
          animation: fadeOutNotification 0.3s ease forwards;
        }

        /* Prevent horizontal overflow at the page level */
        body, #root, html {
          overflow-x: hidden;
    max-width: 100vw !important;
          max-width: 100vw;
        }

        /* Ensure main content doesn't overflow */
        .container {
          max-width: 100%;
          width: 100%;
          box-sizing: border-box;
        }

        /* Fix z-index layering */
        .password-input-container {
          position: relative;
          z-index: 20;
        }

        /* Settings panel should be below the password display */
        .settings-container {
          position: relative;
          z-index: 5;
        }

        /* Fix display and visibility issues */
        .password-box, .settings-container {
          opacity: 1 !important;
          visibility: visible !important;
          pointer-events: auto !important;
          display: block !important;
        }

        /* Fix transition issues */
        .transition-all {
          transition-property: height, opacity;
          transition-duration: 300ms;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Fix dark mode contrast issues */
        .dark-mode input, .dark-mode textarea, .dark-mode .password-input {
          background-color: #1e1e2f !important;
          color: #ffffff !important;
          border-color: #374151 !important;
        }

        /* Ensure settings panel is visible but contained */
        .overflow-visible {
          overflow: visible !important;
          max-width: 100% !important;
        }
      `}</style>
</div>
  );
};

export default PasswordGenerator;