import React, { useState, useEffect } from 'react';
import { 
  getSavedFirebaseConfig, 
  saveFirebaseConfig, 
  resetFirebaseConnection, 
  getFirebaseInstance, 
  FIRESTORE_COLLECTION_NAME,
  FirebaseCustomConfig
} from '../utils/firebase';
import { 
  X, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  Server, 
  ShieldCheck, 
  RefreshCw,
  Trash2
} from 'lucide-react';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved,
}) => {
  const [config, setConfig] = useState<FirebaseCustomConfig>({
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
  });

  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      const saved = getSavedFirebaseConfig();
      if (saved) {
        setConfig(saved);
      }
      setTestStatus('idle');
      setStatusMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!config.apiKey.trim() || !config.projectId.trim()) {
      alert('Please enter at least API Key and Project ID to connect to Firebase.');
      return;
    }

    saveFirebaseConfig({
      apiKey: config.apiKey.trim(),
      authDomain: config.authDomain.trim() || `${config.projectId.trim()}.firebaseapp.com`,
      projectId: config.projectId.trim(),
      storageBucket: config.storageBucket.trim() || `${config.projectId.trim()}.appspot.com`,
      messagingSenderId: config.messagingSenderId.trim(),
      appId: config.appId.trim(),
    });

    resetFirebaseConnection();
    const inst = getFirebaseInstance();
    if (inst.isReady) {
      setTestStatus('success');
      setStatusMessage('Firebase Firestore initialized successfully! Collection: ' + FIRESTORE_COLLECTION_NAME);
    } else {
      setTestStatus('error');
      setStatusMessage('Firebase config saved, but initialization encountered an issue. Check values.');
    }

    onConfigSaved();
  };

  const handleClear = () => {
    if (confirm('Clear saved Firebase config and use local storage persistence?')) {
      saveFirebaseConfig(null);
      resetFirebaseConnection();
      setConfig({
        apiKey: '',
        authDomain: '',
        projectId: '',
        storageBucket: '',
        messagingSenderId: '',
        appId: '',
      });
      setTestStatus('idle');
      setStatusMessage('Switched to resilient local storage.');
      onConfigSaved();
    }
  };

  const { isReady } = getFirebaseInstance();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-[#E2EBE4] overflow-hidden z-10">
        {/* Header */}
        <div className="px-6 py-4 bg-[#FAFCFA] border-b border-[#E2EBE4] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2E6B42] flex items-center justify-center text-white">
              <Database className="w-4 h-4 text-[#5A9E6F]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1A281F]">
                Firebase Cloud Firestore Settings
              </h3>
              <p className="text-xs text-[#5F7364]">
                Target Collection: <code className="font-mono text-[#2E6B42] font-semibold">{FIRESTORE_COLLECTION_NAME}</code>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#5F7364] hover:text-[#1A281F] rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Status Alert Banner */}
          <div className={`p-3 rounded-lg border flex items-start gap-2.5 text-xs ${
            isReady 
              ? 'bg-[#EBF7EE] border-[#A8C8B1] text-[#2E7D32]'
              : 'bg-[#FFF8F0] border-[#FFD0A8] text-[#9A3412]'
          }`}>
            {isReady ? (
              <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-bold block">
                {isReady ? 'Connected to Firebase Firestore' : 'Running on Local Storage (Firebase Placeholder Active)'}
              </span>
              <span className="mt-0.5 block text-[#5F7364]">
                {isReady
                  ? 'All daily closings are actively persisted and synced to Cloud Firestore collection "cha_joy_daily_closings".'
                  : 'As requested ("firebase or supabase will apply later"), the app seamlessly functions with local persistence and full PDF exports right now. Enter credentials below whenever ready.'}
              </span>
            </div>
          </div>

          {/* Form Inputs */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[#1A281F] mb-1">
                Firebase Project ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. cha-joy-pos"
                value={config.projectId}
                onChange={(e) => setConfig({ ...config, projectId: e.target.value })}
                className="w-full bg-[#FAFCFA] border border-[#CBDAD0] rounded-md px-3 py-2 text-xs font-mono text-[#1A281F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#5A9E6F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A281F] mb-1">
                API Key (Firebase Web API Key) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="AIzaSy..."
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                className="w-full bg-[#FAFCFA] border border-[#CBDAD0] rounded-md px-3 py-2 text-xs font-mono text-[#1A281F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#5A9E6F]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1A281F] mb-1">
                  Auth Domain (Optional)
                </label>
                <input
                  type="text"
                  placeholder="project.firebaseapp.com"
                  value={config.authDomain}
                  onChange={(e) => setConfig({ ...config, authDomain: e.target.value })}
                  className="w-full bg-[#FAFCFA] border border-[#CBDAD0] rounded-md px-3 py-2 text-xs font-mono text-[#1A281F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#5A9E6F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A281F] mb-1">
                  App ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="1:123456789:web:..."
                  value={config.appId}
                  onChange={(e) => setConfig({ ...config, appId: e.target.value })}
                  className="w-full bg-[#FAFCFA] border border-[#CBDAD0] rounded-md px-3 py-2 text-xs font-mono text-[#1A281F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#5A9E6F]"
                />
              </div>
            </div>
          </div>

          {/* Test Status Feedback */}
          {statusMessage && (
            <div className={`p-2.5 rounded text-xs ${
              testStatus === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
            }`}>
              {statusMessage}
            </div>
          )}

          {/* Security Notice */}
          <div className="p-3 bg-[#FAFCFA] rounded-lg border border-[#E2EBE4] text-[11px] text-[#5F7364] flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[#5A9E6F] shrink-0 mt-0.5" />
            <span>
              Credentials can also be provided as Vite environment variables (<code className="text-[#2E6B42]">VITE_FIREBASE_API_KEY</code> & <code className="text-[#2E6B42]">VITE_FIREBASE_PROJECT_ID</code>).
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#FAFCFA] border-t border-[#E2EBE4] flex items-center justify-between">
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear / Revert to Local</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#1A281F] bg-white border border-[#CBDAD0] rounded-lg hover:bg-neutral-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-xs font-bold text-white bg-[#2E6B42] hover:bg-[#245434] rounded-lg shadow-sm transition"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
