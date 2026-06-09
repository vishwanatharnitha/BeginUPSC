import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PledgeModal from './components/PledgeModal';

// Pages
import Home from './pages/Home';
import Guide from './pages/Guide';
import Eligibility from './pages/Eligibility';
import Roadmaps from './pages/Roadmaps';
import Subjects from './pages/Subjects';
import Pyqs from './pages/Pyqs';
import MockTests from './pages/MockTests';
import CurrentAffairs from './pages/CurrentAffairs';
import Resources from './pages/Resources';
import Motivation from './pages/Motivation';
import Community from './pages/Community';
import AIAssistant from './pages/AIAssistant';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Feedback from './pages/Feedback';

function AppContent() {
  const [currentTab, setCurrentTab] = useState('home');
  const { hasAcceptedPledge, user } = useAuth();

  const renderActiveTab = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard setCurrentTab={setCurrentTab} />;
      case 'guide':
        return <Guide setCurrentTab={setCurrentTab} />;
      case 'eligibility':
        return <Eligibility setCurrentTab={setCurrentTab} />;
      case 'roadmaps':
        return <Roadmaps setCurrentTab={setCurrentTab} />;
      case 'subjects':
        return <Subjects setCurrentTab={setCurrentTab} />;
      case 'pyqs':
        return <Pyqs setCurrentTab={setCurrentTab} />;
      case 'mockTests':
        return <MockTests setCurrentTab={setCurrentTab} />;
      case 'currentAffairs':
        return <CurrentAffairs setCurrentTab={setCurrentTab} />;
      case 'resources':
        return <Resources setCurrentTab={setCurrentTab} />;
      case 'motivation':
        return <Motivation setCurrentTab={setCurrentTab} />;
      case 'community':
        return <Community setCurrentTab={setCurrentTab} />;
      case 'aiAssistant':
        return <AIAssistant setCurrentTab={setCurrentTab} />;
      case 'feedback':
        return <Feedback setCurrentTab={setCurrentTab} />;
      case 'admin':
        return <Admin setCurrentTab={setCurrentTab} />;
      case 'home':
      default:
        return <Home setCurrentTab={setCurrentTab} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Universal Pledge Screen Overlay */}
      {!hasAcceptedPledge && <PledgeModal />}

      {/* Global Navbar */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Page Area */}
      <main className="flex-1 bg-slate-50/50">
        {renderActiveTab()}
      </main>

      {/* Global Footer */}
      <Footer setCurrentTab={setCurrentTab} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}
