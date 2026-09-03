import React, { useState, useEffect } from 'react';
import NewReturn from './pages/NewReturn';
import ReturnConfirmation from './pages/ReturnConfirmation';
import Module2Dashboard from './pages/Module2Dashboard';
import CustomerProfile from './pages/CustomerProfile';
import EvidenceAnalysis from './pages/EvidenceAnalysis';
import TriageDashboard from './pages/TriageDashboard';
import TriageCaseDetail from './pages/TriageCaseDetail';
import ReviewQueue from './pages/ReviewQueue';
import ReviewCaseDetail from './pages/ReviewCaseDetail';
import PickupDashboard from './pages/PickupDashboard';
import PickupCaseDetail from './pages/PickupCaseDetail';
import PickupBatches from './pages/PickupBatches';
import MetricsDashboard from './pages/MetricsDashboard';
import ExperimentRunner from './pages/ExperimentRunner';
import EvaluationCases from './pages/EvaluationCases';
import ValidationSurvey from './pages/ValidationSurvey';
import SystemLimitations from './pages/SystemLimitations';
import EvaluationReport from './pages/EvaluationReport';
import ApiDocs from './pages/ApiDocs';
import ApiStatus from './pages/ApiStatus';
import ApiTestPanel from './pages/ApiTestPanel';
import TestingDashboard from './pages/TestingDashboard';
import EndToEndTestView from './pages/EndToEndTestView';
import EdgeCasesView from './pages/EdgeCasesView';
import DataQualityView from './pages/DataQualityView';
import ConsistencyView from './pages/ConsistencyView';
import PermissionsTestView from './pages/PermissionsTestView';
import RegressionTestView from './pages/RegressionTestView';
import TestReportView from './pages/TestReportView';
import ErrorBoundary from './components/common/ErrorBoundary';
import SecurityDashboard from './pages/SecurityDashboard';
import AccessControlView from './pages/AccessControlView';
import PrivacyDashboardView from './pages/PrivacyDashboardView';
import AuditIntegrityView from './pages/AuditIntegrityView';
import ReliabilityView from './pages/ReliabilityView';
import SecurityConfigView from './pages/SecurityConfigView';
import RecoveryView from './pages/RecoveryView';
import SecurityReportView from './pages/SecurityReportView';
import PortalLanding from './pages/PortalLanding';
import AdminLogin from './admin/AdminLogin';
import CustomerPortalLayout from './customer/CustomerPortalLayout';
import CustomerLogin from './customer/CustomerLogin';
import CustomerDashboard from './customer/CustomerDashboard';
import CustomerReturnsList from './customer/CustomerReturnsList';
import CustomerNewReturn from './customer/CustomerNewReturn';
import CustomerReturnStatus from './customer/CustomerReturnStatus';
import CustomerReturnEvidence from './customer/CustomerReturnEvidence';
import CustomerSelfProfile from './customer/CustomerProfile';
import CustomerNotifications from './customer/CustomerNotifications';
import CustomerSupport from './customer/CustomerSupport';
import AdminSupportQueue from './admin/AdminSupportQueue';
import { DEMO_CUSTOMERS, getCustomerNotifications } from './services/customerPortalService';
import { initializeStorage } from './utils/storage';
import { 
  Package, 
  Truck, 
  ShieldCheck, 
  Database, 
  Sparkles, 
  UserCheck, 
  Users, 
  FileText, 
  Layers, 
  History,
  Eye,
  Camera,
  ShieldAlert,
  Compass,
  BarChart2,
  Code2,
  FlaskConical,
  Terminal,
  Table,
  Activity,
  Lock,
  Home,
  HelpCircle
} from 'lucide-react';

export default function App() {
  // Navigation states
  const [portalMode, setPortalMode] = useState('landing'); // 'landing' | 'customer' | 'admin'
  const [adminLoggedIn, setAdminLoggedIn] = useState(false); // show admin login before dashboard
  const [activeCustomer, setActiveCustomer] = useState(null);
  const [customerView, setCustomerView] = useState('dashboard'); // 'dashboard' | 'returns' | 'new' | 'status' | 'evidence' | 'profile' | 'notifications' | 'support' | 'login'
  const [selectedCustomerReturnId, setSelectedCustomerReturnId] = useState('RET-2024-001021');

  const [activeModule, setActiveModule] = useState('module4'); // 'module4' | 'module5' | 'module6' | 'module2' | 'module3' | 'module7' | 'module8' | 'module9' | 'module10' | 'support'
  const [currentPage, setCurrentPage] = useState('new'); // 'new' | 'success' (for module1)
  const [selectedCustomerId, setSelectedCustomerId] = useState(null); // (for module2 customer profile)
  const [selectedReturnId, setSelectedReturnId] = useState(null); // (for module3 evidence analysis)
  const [selectedTriageCaseId, setSelectedTriageCaseId] = useState(null); // (for module4 triage case detail)
  const [selectedReviewCaseId, setSelectedReviewCaseId] = useState(null); // (for module5 human review)
  const [selectedPickupCaseId, setSelectedPickupCaseId] = useState(null); // (for module6 pickup operations)
  const [pickupSubView, setPickupSubView] = useState('dashboard'); // 'dashboard' | 'detail' | 'batches'
  const [metricsSubView, setMetricsSubView] = useState('dashboard'); // 'dashboard' | 'experiment' | 'cases' | 'validation' | 'limitations' | 'report'
  const [apiSubView, setApiSubView] = useState('docs'); // 'docs' | 'status' | 'test'
  const [testSubView, setTestSubView] = useState('dashboard'); // 'dashboard' | 'end-to-end' | 'edge-cases' | 'data-quality' | 'consistency' | 'permissions' | 'regression' | 'report'
  const [securitySubView, setSecuritySubView] = useState('dashboard'); // 'dashboard' | 'access' | 'privacy' | 'audit' | 'reliability' | 'config' | 'recovery' | 'report'
  const [currentReturnContext, setCurrentReturnContext] = useState(null);
  
  const [submittedReturn, setSubmittedReturn] = useState(null);
  const [storedCount, setStoredCount] = useState(0);

  // Initialize storage with seed data and observe navbar height
  useEffect(() => {
    initializeStorage();
    updateStoredCount();

    const navbarEl = document.querySelector('.navbar');
    const updateNavbarHeight = () => {
      if (navbarEl) {
        document.documentElement.style.setProperty('--navbar-height', `${navbarEl.offsetHeight}px`);
      }
    };
    updateNavbarHeight();

    let ro;
    if (navbarEl && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(updateNavbarHeight);
      ro.observe(navbarEl);
    }
    window.addEventListener('resize', updateNavbarHeight);

    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', updateNavbarHeight);
    };
  }, []);

  // Dynamic time-based greeting matching user screenshot
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Morning, Surya';
    if (hour >= 12 && hour < 17) return 'Afternoon, Surya';
    return 'Evening, Surya';
  };

  const updateStoredCount = () => {
    try {
      const stored = localStorage.getItem('return_requests');
      if (stored) {
        const arr = JSON.parse(stored);
        setStoredCount(Array.isArray(arr) ? arr.length : 0);
      }
    } catch {
      setStoredCount(0);
    }
  };

  const handleSuccess = (returnRecord) => {
    setSubmittedReturn(returnRecord);
    setSelectedReturnId(returnRecord.return_id);
    setSelectedTriageCaseId(returnRecord.return_id);
    setCurrentPage('success');
    updateStoredCount();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateAnother = () => {
    setSubmittedReturn(null);
    setCurrentPage('new');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cross-Module Navigation Handlers
  const handleViewCustomerHistory = (customerId, returnRecord) => {
    setSelectedCustomerId(customerId);
    setCurrentReturnContext(returnRecord || submittedReturn);
    setActiveModule('module2');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnalyzeEvidence = (returnId) => {
    setSelectedReturnId(returnId);
    setActiveModule('module3');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTriageCase = (returnId) => {
    setSelectedTriageCaseId(returnId);
    setActiveModule('module4');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenReviewCase = (returnId) => {
    setSelectedReviewCaseId(returnId);
    setActiveModule('module5');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCustomer = (customerId) => {
    setSelectedCustomerId(customerId);
    setActiveModule('module2');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToDashboard = () => {
    setSelectedCustomerId(null);
    setCurrentReturnContext(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToTriageQueue = () => {
    setSelectedTriageCaseId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToReviewQueue = () => {
    setSelectedReviewCaseId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPickupCase = (returnId) => {
    setSelectedPickupCaseId(returnId);
    setPickupSubView('detail');
    setActiveModule('module6');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToPickupDashboard = () => {
    setSelectedPickupCaseId(null);
    setPickupSubView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPickupBatches = () => {
    setPickupSubView('batches');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSwitchModule = (moduleKey) => {
    setActiveModule(moduleKey);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. Landing Page Portal Selector
  if (portalMode === 'landing') {
    return (
      <PortalLanding
        onEnterCustomerPortal={() => {
          setPortalMode('customer');
          setActiveCustomer(null);
          setCustomerView('login');
        }}
        onEnterAdminPortal={() => {
          setPortalMode('admin');
          setAdminLoggedIn(false);
        }}
      />
    );
  }

  // 2. Customer Portal Experience (Isolated from Internal Risk / Fraud Logic)
  if (portalMode === 'customer') {
    if (!activeCustomer || customerView === 'login') {
      return (
        <CustomerLogin
          onLogin={(cust) => {
            setActiveCustomer(cust);
            setCustomerView('dashboard');
          }}
          onSwitchToAdmin={() => setPortalMode('admin')}
        />
      );
    }

    const unreadCount = getCustomerNotifications(activeCustomer.id).filter(n => !n.read).length;

    return (
      <CustomerPortalLayout
        activeCustomer={activeCustomer}
        currentView={customerView}
        onNavigate={setCustomerView}
        onLogout={() => {
          setActiveCustomer(null);
          setCustomerView('login');
        }}
        onSwitchToAdmin={() => setPortalMode('admin')}
        unreadCount={unreadCount}
      >
        {customerView === 'dashboard' && (
          <CustomerDashboard
            activeCustomer={activeCustomer}
            onNavigate={setCustomerView}
            onSelectReturn={(id) => {
              setSelectedCustomerReturnId(id);
            }}
          />
        )}
        {customerView === 'returns' && (
          <CustomerReturnsList
            activeCustomer={activeCustomer}
            onNavigate={setCustomerView}
            onSelectReturn={(id) => {
              setSelectedCustomerReturnId(id);
            }}
          />
        )}
        {customerView === 'new' && (
          <CustomerNewReturn
            activeCustomer={activeCustomer}
            onNavigate={setCustomerView}
            onReturnCreated={(id) => {
              setSelectedCustomerReturnId(id);
              updateStoredCount();
            }}
          />
        )}
        {customerView === 'status' && (
          <CustomerReturnStatus
            activeCustomer={activeCustomer}
            returnId={selectedCustomerReturnId}
            onNavigate={setCustomerView}
            onNavigateSupport={(retId) => {
              setSelectedCustomerReturnId(retId);
              setCustomerView('support');
            }}
          />
        )}
        {customerView === 'evidence' && (
          <CustomerReturnEvidence
            activeCustomer={activeCustomer}
            returnId={selectedCustomerReturnId}
            onNavigate={setCustomerView}
          />
        )}
        {customerView === 'profile' && (
          <CustomerSelfProfile
            activeCustomer={activeCustomer}
          />
        )}
        {customerView === 'notifications' && (
          <CustomerNotifications
            activeCustomer={activeCustomer}
            onNavigate={setCustomerView}
          />
        )}
        {customerView === 'support' && (
          <CustomerSupport
            activeCustomer={activeCustomer}
            initialReturnId={selectedCustomerReturnId}
          />
        )}
      </CustomerPortalLayout>
    );
  }

  // 3. Admin & Operations Portal (Consolidating Modules 1 through 10)
  // Show admin login gate first
  if (!adminLoggedIn) {
    return (
      <AdminLogin
        onLogin={() => setAdminLoggedIn(true)}
        onSwitchToCustomer={() => {
          setPortalMode('customer');
          setActiveCustomer(null);
          setCustomerView('login');
        }}
        onBackToLanding={() => setPortalMode('landing')}
      />
    );
  }

  return (
    <div className="app-layout">
      {/* Enterprise Admin Top Navigation (Tier 1: Brand & User Controls, Tier 2: Module Switcher) */}
      <header className="admin-header">
        {/* Tier 1: Main Header Bar */}
        <div className="admin-header-top">
          <div className="admin-header-container">
            {/* Brand Logo & Name */}
            <div 
              className="admin-brand" 
              onClick={() => handleSwitchModule('module4')}
              role="button"
              tabIndex={0}
            >
              <div className="admin-brand-icon">
                <Package size={20} />
              </div>
              <div className="admin-brand-text">
                <div className="admin-brand-name">
                  FurniLogistics <span className="admin-badge-ops">Operations</span>
                </div>
                <span className="admin-brand-sub">Reverse Logistics &amp; Return Fraud Triage Platform</span>
              </div>
            </div>

            {/* Right Action Controls */}
            <div className="admin-header-actions">
              <button
                type="button"
                className="admin-btn-cust-portal"
                onClick={() => {
                  setPortalMode('customer');
                  setCustomerView('dashboard');
                }}
                title="Switch to Customer Care Portal"
              >
                <Package size={14} />
                <span>Customer Portal</span>
              </button>

              <div className="admin-status-pill" title="System operational status">
                <span className="admin-status-dot" />
                <span>M1–M10 Online</span>
              </div>

              <div className="admin-user-card" title="Active Admin Session">
                <div className="admin-user-avatar">SP</div>
                <div className="admin-user-meta">
                  <span className="admin-user-name">Surya Prakash</span>
                  <span className="admin-user-role">Operations Manager</span>
                </div>
              </div>

              <button
                type="button"
                className="admin-btn-logout"
                onClick={() => {
                  setAdminLoggedIn(false);
                  setPortalMode('landing');
                }}
                title="Sign out of Operations Portal"
              >
                <Home size={14} />
                <span>Exit</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tier 2: Module Pills Navigation Bar */}
        <div className="admin-nav-bar">
          <div className="admin-nav-container">
            <nav className="admin-modules-scroll" aria-label="System Modules">
              {[
                { id: 'module4', num: 'M4', label: 'Fraud Risk Engine', icon: ShieldAlert, onSelect: () => setSelectedTriageCaseId(null) },
                { id: 'module5', num: 'M5', label: 'Human Review', icon: UserCheck, onSelect: () => setSelectedReviewCaseId(null) },
                { id: 'module6', num: 'M6', label: 'Pickup Logistics', icon: Truck, onSelect: () => { setSelectedPickupCaseId(null); setPickupSubView('dashboard'); } },
                { id: 'module2', num: 'M2', label: 'Customer History', icon: History, onSelect: () => setSelectedCustomerId(null) },
                { id: 'module3', num: 'M3', label: 'Evidence Analysis', icon: Camera },
                { id: 'module7', num: 'M7', label: 'Metrics & Eval', icon: BarChart2, onSelect: () => setMetricsSubView('dashboard') },
                { id: 'module8', num: 'M8', label: 'REST API Docs', icon: Code2, onSelect: () => setApiSubView('docs') },
                { id: 'module9', num: 'M9', label: 'Testing Suite', icon: Activity, onSelect: () => setTestSubView('dashboard') },
                { id: 'module10', num: 'M10', label: 'Security & Audit', icon: ShieldCheck, onSelect: () => setSecuritySubView('dashboard') },
                { id: 'support', num: 'Care', label: 'Support Queue', icon: HelpCircle }
              ].map(m => {
                const IconComponent = m.icon;
                const isActive = activeModule === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    className={`admin-mod-pill ${isActive ? 'admin-mod-pill-active' : ''}`}
                    onClick={() => {
                      m.onSelect?.();
                      handleSwitchModule(m.id);
                    }}
                  >
                    <span className="admin-mod-num">{m.num}</span>
                    <IconComponent size={14} className="admin-mod-icon" />
                    <span className="admin-mod-label">{m.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Page View with Error Boundary Isolation */}
      <ErrorBoundary onNavigateHome={() => handleSwitchModule('module4')}>
        <main className="main-content">
        {/* Customer Support Queue (Module 11 Operational View) */}
        {activeModule === 'support' && (
          <AdminSupportQueue />
        )}

        {/* Module 1: Return Intake */}
        {activeModule === 'module1' && (
          currentPage === 'success' ? (
            <ReturnConfirmation
              returnData={submittedReturn}
              onReset={handleCreateAnother}
              onViewCustomerHistory={handleViewCustomerHistory}
              onAnalyzeEvidence={handleAnalyzeEvidence}
              onTriageCase={handleTriageCase}
            />
          ) : (
            <NewReturn 
              onSuccess={handleSuccess} 
              greeting={getGreeting()} 
            />
          )
        )}

        {/* Module 2: Customer History */}
        {activeModule === 'module2' && (
          selectedCustomerId ? (
            <CustomerProfile
              customerId={selectedCustomerId}
              currentReturnContext={currentReturnContext}
              onBack={handleBackToDashboard}
            />
          ) : (
            <Module2Dashboard
              onSelectCustomer={handleSelectCustomer}
              onAnalyzeEvidence={handleAnalyzeEvidence}
              onTriageCase={handleTriageCase}
              greeting={getGreeting()}
            />
          )
        )}

        {/* Module 3: Evidence Analysis */}
        {activeModule === 'module3' && (
          <EvidenceAnalysis
            returnId={selectedReturnId}
            onBack={() => {
              if (selectedTriageCaseId) {
                setActiveModule('module4');
              } else if (selectedCustomerId) {
                setActiveModule('module2');
              } else {
                setActiveModule('module2');
              }
            }}
            onViewCustomerHistory={handleViewCustomerHistory}
            onTriageCase={handleTriageCase}
            onSelectReturn={(id) => setSelectedReturnId(id)}
          />
        )}

        {/* Module 4: Fraud Risk & Priority Engine */}
        {activeModule === 'module4' && (
          selectedTriageCaseId ? (
            <TriageCaseDetail
              returnId={selectedTriageCaseId}
              onBack={handleBackToTriageQueue}
              onViewCustomer={handleViewCustomerHistory}
              onViewEvidence={handleAnalyzeEvidence}
              onViewReview={handleOpenReviewCase}
              onSelectReturn={(id) => setSelectedTriageCaseId(id)}
            />
          ) : (
            <TriageDashboard
              onSelectCase={handleTriageCase}
              onViewEvidence={handleAnalyzeEvidence}
              onViewCustomer={handleViewCustomerHistory}
              greeting={getGreeting()}
            />
          )
        )}

        {/* Module 5: Human Review & Manual Intervention */}
        {activeModule === 'module5' && (
          selectedReviewCaseId ? (
            <ReviewCaseDetail
              returnId={selectedReviewCaseId}
              onBack={handleBackToReviewQueue}
              onViewCustomer={handleViewCustomerHistory}
              onViewEvidence={handleAnalyzeEvidence}
              onViewTriage={handleTriageCase}
              onViewPickup={handleOpenPickupCase}
              onSelectReturn={(id) => setSelectedReviewCaseId(id)}
            />
          ) : (
            <ReviewQueue
              onSelectCase={handleOpenReviewCase}
              greeting={getGreeting()}
            />
          )
        )}

        {/* Module 6: Pickup Prioritisation & Operations Engine */}
        {activeModule === 'module6' && (
          pickupSubView === 'detail' && selectedPickupCaseId ? (
            <PickupCaseDetail
              returnId={selectedPickupCaseId}
              onBack={handleBackToPickupDashboard}
              onViewCustomer={handleViewCustomerHistory}
              onViewEvidence={handleAnalyzeEvidence}
              onViewTriage={handleTriageCase}
              onViewReview={handleOpenReviewCase}
              onSelectReturn={(id) => setSelectedPickupCaseId(id)}
            />
          ) : pickupSubView === 'batches' ? (
            <PickupBatches
              onBack={handleBackToPickupDashboard}
              onViewCase={handleOpenPickupCase}
            />
          ) : (
            <PickupDashboard
              onSelectCase={handleOpenPickupCase}
              onOpenBatches={handleOpenPickupBatches}
              greeting={getGreeting()}
            />
          )
        )}

        {/* Module 7: Metrics, Experiment & Validation Layer */}
        {activeModule === 'module7' && (
          metricsSubView === 'experiment' ? (
            <ExperimentRunner
              onBackToDashboard={() => setMetricsSubView('dashboard')}
              onNavigateDashboard={() => setMetricsSubView('dashboard')}
              onNavigateCases={() => setMetricsSubView('cases')}
              onNavigateValidation={() => setMetricsSubView('validation')}
              onNavigateLimitations={() => setMetricsSubView('limitations')}
              onNavigateReport={() => setMetricsSubView('report')}
            />
          ) : metricsSubView === 'cases' ? (
            <EvaluationCases
              onNavigateDashboard={() => setMetricsSubView('dashboard')}
              onNavigateExperiment={() => setMetricsSubView('experiment')}
              onNavigateValidation={() => setMetricsSubView('validation')}
              onNavigateLimitations={() => setMetricsSubView('limitations')}
              onNavigateReport={() => setMetricsSubView('report')}
              onTraceCase={(returnId) => handleOpenPickupCase(returnId)}
            />
          ) : metricsSubView === 'validation' ? (
            <ValidationSurvey
              onNavigateDashboard={() => setMetricsSubView('dashboard')}
              onNavigateExperiment={() => setMetricsSubView('experiment')}
              onNavigateCases={() => setMetricsSubView('cases')}
              onNavigateLimitations={() => setMetricsSubView('limitations')}
              onNavigateReport={() => setMetricsSubView('report')}
            />
          ) : metricsSubView === 'limitations' ? (
            <SystemLimitations
              onNavigateDashboard={() => setMetricsSubView('dashboard')}
              onNavigateExperiment={() => setMetricsSubView('experiment')}
              onNavigateCases={() => setMetricsSubView('cases')}
              onNavigateValidation={() => setMetricsSubView('validation')}
              onNavigateReport={() => setMetricsSubView('report')}
            />
          ) : metricsSubView === 'report' ? (
            <EvaluationReport
              onNavigateDashboard={() => setMetricsSubView('dashboard')}
              onNavigateExperiment={() => setMetricsSubView('experiment')}
              onNavigateCases={() => setMetricsSubView('cases')}
              onNavigateValidation={() => setMetricsSubView('validation')}
              onNavigateLimitations={() => setMetricsSubView('limitations')}
            />
          ) : (
            <MetricsDashboard
              onNavigateExperiment={() => setMetricsSubView('experiment')}
              onNavigateCases={() => setMetricsSubView('cases')}
              onNavigateValidation={() => setMetricsSubView('validation')}
              onNavigateLimitations={() => setMetricsSubView('limitations')}
              onNavigateReport={() => setMetricsSubView('report')}
              onSelectCase={(returnId) => handleOpenPickupCase(returnId)}
            />
          )
        )}

        {/* Module 8: API, Backend Stub & System Integration Layer */}
        {activeModule === 'module8' && (
          apiSubView === 'status' ? (
            <ApiStatus
              onNavigateDocs={() => setApiSubView('docs')}
              onNavigateTest={() => setApiSubView('test')}
            />
          ) : apiSubView === 'test' ? (
            <ApiTestPanel
              onNavigateDocs={() => setApiSubView('docs')}
              onNavigateStatus={() => setApiSubView('status')}
            />
          ) : (
            <ApiDocs
              onNavigateStatus={() => setApiSubView('status')}
              onNavigateTest={() => setApiSubView('test')}
            />
          )
        )}

        {/* Module 9: Final Testing, Edge Cases & End-to-End Validation */}
        {activeModule === 'module9' && (
          testSubView === 'end-to-end' ? (
            <EndToEndTestView
              onNavigateDashboard={() => setTestSubView('dashboard')}
              onNavigateEdgeCases={() => setTestSubView('edge-cases')}
              onNavigateDataQuality={() => setTestSubView('data-quality')}
              onNavigateConsistency={() => setTestSubView('consistency')}
              onNavigateReport={() => setTestSubView('report')}
            />
          ) : testSubView === 'edge-cases' ? (
            <EdgeCasesView
              onNavigateDashboard={() => setTestSubView('dashboard')}
              onNavigateEndToEnd={() => setTestSubView('end-to-end')}
              onNavigateDataQuality={() => setTestSubView('data-quality')}
              onNavigateConsistency={() => setTestSubView('consistency')}
              onNavigateReport={() => setTestSubView('report')}
            />
          ) : testSubView === 'data-quality' ? (
            <DataQualityView
              onNavigateDashboard={() => setTestSubView('dashboard')}
              onNavigateEndToEnd={() => setTestSubView('end-to-end')}
              onNavigateEdgeCases={() => setTestSubView('edge-cases')}
              onNavigateConsistency={() => setTestSubView('consistency')}
              onNavigateReport={() => setTestSubView('report')}
            />
          ) : testSubView === 'consistency' ? (
            <ConsistencyView
              onNavigateDashboard={() => setTestSubView('dashboard')}
              onNavigateEndToEnd={() => setTestSubView('end-to-end')}
              onNavigateEdgeCases={() => setTestSubView('edge-cases')}
              onNavigateDataQuality={() => setTestSubView('data-quality')}
              onNavigateReport={() => setTestSubView('report')}
            />
          ) : testSubView === 'permissions' ? (
            <PermissionsTestView
              onNavigateDashboard={() => setTestSubView('dashboard')}
              onNavigateEndToEnd={() => setTestSubView('end-to-end')}
              onNavigateEdgeCases={() => setTestSubView('edge-cases')}
              onNavigateDataQuality={() => setTestSubView('data-quality')}
              onNavigateConsistency={() => setTestSubView('consistency')}
              onNavigateReport={() => setTestSubView('report')}
            />
          ) : testSubView === 'regression' ? (
            <RegressionTestView
              onNavigateDashboard={() => setTestSubView('dashboard')}
              onNavigateEndToEnd={() => setTestSubView('end-to-end')}
              onNavigateEdgeCases={() => setTestSubView('edge-cases')}
              onNavigateDataQuality={() => setTestSubView('data-quality')}
              onNavigateConsistency={() => setTestSubView('consistency')}
              onNavigatePermissions={() => setTestSubView('permissions')}
              onNavigateReport={() => setTestSubView('report')}
            />
          ) : testSubView === 'report' ? (
            <TestReportView
              onNavigateDashboard={() => setTestSubView('dashboard')}
              onNavigateEndToEnd={() => setTestSubView('end-to-end')}
              onNavigateEdgeCases={() => setTestSubView('edge-cases')}
              onNavigateDataQuality={() => setTestSubView('data-quality')}
              onNavigateConsistency={() => setTestSubView('consistency')}
              onNavigatePermissions={() => setTestSubView('permissions')}
              onNavigateRegression={() => setTestSubView('regression')}
            />
          ) : (
            <TestingDashboard
              onNavigateEndToEnd={() => setTestSubView('end-to-end')}
              onNavigateEdgeCases={() => setTestSubView('edge-cases')}
              onNavigateDataQuality={() => setTestSubView('data-quality')}
              onNavigateConsistency={() => setTestSubView('consistency')}
              onNavigatePermissions={() => setTestSubView('permissions')}
              onNavigateRegression={() => setTestSubView('regression')}
              onNavigateReport={() => setTestSubView('report')}
            />
          )
        )}

        {/* Module 10: Security, Privacy & Reliability */}
        {activeModule === 'module10' && (
          securitySubView === 'access' ? (
            <AccessControlView
              onNavigateDashboard={() => setSecuritySubView('dashboard')}
              onNavigatePrivacy={() => setSecuritySubView('privacy')}
              onNavigateAudit={() => setSecuritySubView('audit')}
              onNavigateReliability={() => setSecuritySubView('reliability')}
              onNavigateConfig={() => setSecuritySubView('config')}
              onNavigateRecovery={() => setSecuritySubView('recovery')}
              onNavigateReport={() => setSecuritySubView('report')}
            />
          ) : securitySubView === 'privacy' ? (
            <PrivacyDashboardView
              onNavigateDashboard={() => setSecuritySubView('dashboard')}
              onNavigateAccess={() => setSecuritySubView('access')}
              onNavigateAudit={() => setSecuritySubView('audit')}
              onNavigateReliability={() => setSecuritySubView('reliability')}
              onNavigateConfig={() => setSecuritySubView('config')}
              onNavigateRecovery={() => setSecuritySubView('recovery')}
              onNavigateReport={() => setSecuritySubView('report')}
            />
          ) : securitySubView === 'audit' ? (
            <AuditIntegrityView
              onNavigateDashboard={() => setSecuritySubView('dashboard')}
              onNavigateAccess={() => setSecuritySubView('access')}
              onNavigatePrivacy={() => setSecuritySubView('privacy')}
              onNavigateReliability={() => setSecuritySubView('reliability')}
              onNavigateConfig={() => setSecuritySubView('config')}
              onNavigateRecovery={() => setSecuritySubView('recovery')}
              onNavigateReport={() => setSecuritySubView('report')}
            />
          ) : securitySubView === 'reliability' ? (
            <ReliabilityView
              onNavigateDashboard={() => setSecuritySubView('dashboard')}
              onNavigateAccess={() => setSecuritySubView('access')}
              onNavigatePrivacy={() => setSecuritySubView('privacy')}
              onNavigateAudit={() => setSecuritySubView('audit')}
              onNavigateConfig={() => setSecuritySubView('config')}
              onNavigateRecovery={() => setSecuritySubView('recovery')}
              onNavigateReport={() => setSecuritySubView('report')}
            />
          ) : securitySubView === 'config' ? (
            <SecurityConfigView
              onNavigateDashboard={() => setSecuritySubView('dashboard')}
              onNavigateAccess={() => setSecuritySubView('access')}
              onNavigatePrivacy={() => setSecuritySubView('privacy')}
              onNavigateAudit={() => setSecuritySubView('audit')}
              onNavigateReliability={() => setSecuritySubView('reliability')}
              onNavigateRecovery={() => setSecuritySubView('recovery')}
              onNavigateReport={() => setSecuritySubView('report')}
            />
          ) : securitySubView === 'recovery' ? (
            <RecoveryView
              onNavigateDashboard={() => setSecuritySubView('dashboard')}
              onNavigateAccess={() => setSecuritySubView('access')}
              onNavigatePrivacy={() => setSecuritySubView('privacy')}
              onNavigateAudit={() => setSecuritySubView('audit')}
              onNavigateReliability={() => setSecuritySubView('reliability')}
              onNavigateConfig={() => setSecuritySubView('config')}
              onNavigateReport={() => setSecuritySubView('report')}
            />
          ) : securitySubView === 'report' ? (
            <SecurityReportView
              onNavigateDashboard={() => setSecuritySubView('dashboard')}
              onNavigateAccess={() => setSecuritySubView('access')}
              onNavigatePrivacy={() => setSecuritySubView('privacy')}
              onNavigateAudit={() => setSecuritySubView('audit')}
              onNavigateReliability={() => setSecuritySubView('reliability')}
              onNavigateConfig={() => setSecuritySubView('config')}
              onNavigateRecovery={() => setSecuritySubView('recovery')}
            />
          ) : (
            <SecurityDashboard
              onNavigateAccess={() => setSecuritySubView('access')}
              onNavigatePrivacy={() => setSecuritySubView('privacy')}
              onNavigateAudit={() => setSecuritySubView('audit')}
              onNavigateReliability={() => setSecuritySubView('reliability')}
              onNavigateConfig={() => setSecuritySubView('config')}
              onNavigateRecovery={() => setSecuritySubView('recovery')}
              onNavigateReport={() => setSecuritySubView('report')}
            />
          )
        )}
      </main>
    </ErrorBoundary>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-container">
          <p className="footer-text">
            &copy; 2026 FurniCraft &amp; FurniLogistics Systems &bull; Unified Dual-Portal Return Management, Fraud Triage &amp; Doorstep Logistics (Modules 1–11)
          </p>
          <div className="footer-links">
            <span className="footer-version">Platform Version: v1.11-PRO &bull; Customer Care Portal &amp; Operations Suite Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
