import React, { useState, useEffect } from 'react';
import { JarvisProvider, useJarvis } from './engine/context';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { HomeScreen } from './features/home/HomeScreen';
import { CommandCenter } from './features/command-center/CommandCenter';
import { IncidentWorkspace } from './features/incident-workspace/IncidentWorkspace';
import { TopologyScreen } from './features/topology/TopologyScreen';
import { InvestigationScreen } from './features/investigation/InvestigationScreen';
import { CounterfactualLab } from './features/counterfactual/CounterfactualLab';
import { ScenarioSimulator } from './features/scenarios/ScenarioSimulator';
import { EvaluationScreen } from './features/evaluation/EvaluationScreen';
import { ReportsScreen } from './features/reports/ReportsScreen';
import { JsonIngestModal } from './components/JsonIngestModal';
import { CommandPalette } from './components/CommandPalette';
import { JarvisCopilot } from './components/JarvisCopilot';
import { EvidenceModal } from './components/EvidenceModal';
import { Bot } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeScreen, setActiveScreen, evidenceList, events } = useJarvis();
  const [showIngestModal, setShowIngestModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showCopilot, setShowCopilot] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [inspectedEvidenceId, setInspectedEvidenceId] = useState<string | null>(null);

  const isHomePage = activeScreen === 'home';

  const handleLaunch = (targetScreen: string = 'incident-workspace') => {
    setIsSidebarOpen(true);
    setActiveScreen(targetScreen);
  };

  // Keyboard shortcut Ctrl+K / Cmd+K for Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const selectedEvidence = evidenceList.find(e => e.evidence_id === inspectedEvidenceId) || null;
  const sourceEvent = selectedEvidence ? events.find(e => e.event_id === selectedEvidence.source_id) || null : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 relative">
      <Header 
        onOpenIngest={() => setShowIngestModal(true)}
        onOpenCommandPalette={() => setShowCommandPalette(true)}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        showSidebarToggle={!isHomePage}
        onLaunchPlatform={() => handleLaunch('incident-workspace')}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar: Only visible when NOT on Home page and when sidebar is open */}
        {!isHomePage && isSidebarOpen && (
          <Sidebar onClose={() => setIsSidebarOpen(false)} />
        )}

        <main className={`flex-1 overflow-y-auto ${isHomePage ? 'p-6 lg:p-12' : 'p-6 lg:p-8'}`}>
          {activeScreen === 'home' && (
            <HomeScreen 
              onLaunch={(screen) => handleLaunch(screen)}
            />
          )}
          {activeScreen === 'command-center' && <CommandCenter />}
          {activeScreen === 'incident-workspace' && <IncidentWorkspace />}
          {activeScreen === 'topology' && <TopologyScreen />}
          {activeScreen === 'investigation' && <InvestigationScreen />}
          {activeScreen === 'counterfactual-lab' && <CounterfactualLab />}
          {activeScreen === 'scenario-simulator' && <ScenarioSimulator />}
          {activeScreen === 'evaluation' && <EvaluationScreen />}
          {activeScreen === 'reports' && <ReportsScreen />}
        </main>
      </div>

      {/* Floating Bottom-Right J.A.R.V.I.S. Copilot Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setShowCopilot(prev => !prev)}
          className="flex items-center space-x-2.5 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xl shadow-slate-900/25 transition transform hover:scale-105 select-none border border-slate-700/60 cursor-pointer"
          title="Toggle J.A.R.V.I.S. Causal Copilot"
        >
          <div className="w-5 h-5 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 text-white" />
          </div>
          <span>J.A.R.V.I.S. Copilot</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      </div>

      {/* JSON Ingestion Modal */}
      {showIngestModal && (
        <JsonIngestModal onClose={() => setShowIngestModal(false)} />
      )}

      {/* Command Palette */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onOpenIngest={() => {
          setShowCommandPalette(false);
          setShowIngestModal(true);
        }}
      />

      {/* J.A.R.V.I.S. Causal Copilot Assistant */}
      <JarvisCopilot
        isOpen={showCopilot}
        onClose={() => setShowCopilot(false)}
        onSelectEvidence={(eid) => setInspectedEvidenceId(eid)}
      />

      {/* Global Evidence Modal */}
      {inspectedEvidenceId && (
        <EvidenceModal
          evidence={selectedEvidence}
          sourceEvent={sourceEvent}
          onClose={() => setInspectedEvidenceId(null)}
        />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <JarvisProvider>
      <MainLayout />
    </JarvisProvider>
  );
};

export default App;
