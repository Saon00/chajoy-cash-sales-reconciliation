import React, { useState, useEffect, useMemo } from 'react';
import { 
  StoreBranch, 
  ReconciliationFormState, 
  ClosingRecord, 
  DynamicPaymentField 
} from './types/reconciliation';
import { calculateReconciliation, formatCurrency } from './utils/calculator';
import { Header } from './components/Header';
import { SalesSection } from './components/SalesSection';
import { DenominationCounter } from './components/DenominationCounter';
import { AdjustmentsSection } from './components/AdjustmentsSection';
import { ReconciliationSummaryCard } from './components/ReconciliationSummaryCard';
import { HistoryDrawer } from './components/HistoryDrawer';
import { FirebaseConfigModal } from './components/FirebaseConfigModal';
import { VoucherPreviewModal } from './components/VoucherPreviewModal';
import { 
  saveDailyClosing, 
  fetchAllClosings, 
  deleteClosingRecord 
} from './utils/storageService';
import { downloadClosingPDF } from './utils/pdfGenerator';
import { getFirebaseInstance } from './utils/firebase';
import { 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  HelpCircle
} from 'lucide-react';

const getTodayDateStr = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function App() {
  // Store branches: Badda - 1 is first by default, then Aftabnagar - 11
  const [storeBranch, setStoreBranch] = useState<StoreBranch>('Cha Joy - Badda - 1');
  const [closingDate, setClosingDate] = useState<string>(getTodayDateStr());
  const [managerName, setManagerName] = useState<string>('');
  const [shift, setShift] = useState<'Morning' | 'Evening' | 'Full Day'>('Full Day');

  // All amounts and quantities default to 0 (No demo data)
  const [displaySales, setDisplaySales] = useState<number>(0);
  const [posMachine, setPosMachine] = useState<number>(0);
  const [mfsTotal, setMfsTotal] = useState<number>(0);
  const [dynamicFields, setDynamicFields] = useState<DynamicPaymentField[]>([]);

  const [denominations, setDenominations] = useState({
    1000: 0,
    500: 0,
    200: 0,
    100: 0,
    50: 0,
    20: 0,
    10: 0,
    5: 0,
    coins: 0,
  });

  const [openingPettyCash, setOpeningPettyCash] = useState<number>(0);
  const [dailyExpenses, setDailyExpenses] = useState<number>(0);
  const [expenseDetails, setExpenseDetails] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Extra Info: Cash withdrawal and Next day petty cash float
  const [cashWithdrawal, setCashWithdrawal] = useState<number>(0);
  const [nextDayPettyCash, setNextDayPettyCash] = useState<number>(0);

  // UI Modals & Drawers
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewRecord, setPreviewRecord] = useState<ClosingRecord | null>(null);

  // Storage and Sync States
  const [historyRecords, setHistoryRecords] = useState<ClosingRecord[]>([]);
  const [storageSource, setStorageSource] = useState<'firestore' | 'local'>('local');
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  // Check Firebase connection
  const [isFirebaseActive, setIsFirebaseActive] = useState(false);

  // Load history records on mount
  const refreshRecords = async () => {
    const { isReady } = getFirebaseInstance();
    setIsFirebaseActive(isReady);
    const { records, source } = await fetchAllClosings();
    setHistoryRecords(records);
    setStorageSource(source);
  };

  useEffect(() => {
    refreshRecords();
  }, []);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Compile full form state
  const formState: ReconciliationFormState = useMemo(() => ({
    storeBranch,
    closingDate,
    managerName,
    shift,
    displaySales,
    posMachine,
    mfsTotal,
    dynamicFields,
    denominations,
    openingPettyCash,
    dailyExpenses,
    expenseDetails,
    cashWithdrawal,
    nextDayPettyCash,
    notes,
  }), [
    storeBranch,
    closingDate,
    managerName,
    shift,
    displaySales,
    posMachine,
    mfsTotal,
    dynamicFields,
    denominations,
    openingPettyCash,
    dailyExpenses,
    expenseDetails,
    cashWithdrawal,
    nextDayPettyCash,
    notes,
  ]);

  // Compute live calculations
  const totals = useMemo(() => {
    return calculateReconciliation(formState);
  }, [formState]);

  // Build current closing record object
  const currentRecord: ClosingRecord = useMemo(() => {
    const branchCode = storeBranch.includes('Badda') ? 'BAD01' : 'AFT11';
    const cleanDate = closingDate.replace(/-/g, '');
    const id = `CJ-${cleanDate}-${branchCode}`;

    return {
      id,
      createdAt: new Date().toISOString(),
      storeBranch,
      closingDate,
      managerName,
      shift,
      displaySales,
      posMachine,
      mfsTotal,
      dynamicFields,
      denominations,
      openingPettyCash,
      dailyExpenses,
      expenseDetails,
      cashWithdrawal,
      nextDayPettyCash,
      notes,
      totals,
    };
  }, [formState, totals, cashWithdrawal, nextDayPettyCash]);

  // Handle Save Daily Closing
  const handleSaveDailyClosing = async () => {
    if (displaySales <= 0 && totals.totalCalculatedSales <= 0) {
      if (!confirm('Both Display Sales and Calculated Sales are ৳ 0. Do you want to save this closing?')) {
        return;
      }
    }

    setIsSaving(true);
    try {
      const result = await saveDailyClosing(currentRecord);
      await refreshRecords();
      showToast(result.message, 'success');
    } catch (e: any) {
      console.error('Save failed:', e);
      showToast('Error saving record: ' + (e?.message || 'Unknown error'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Export PDF
  const handleExportPDF = () => {
    downloadClosingPDF(currentRecord);
    showToast(`PDF closing slip downloaded for ${storeBranch} (${closingDate}).`, 'info');
  };

  // Handle Preview
  const handleOpenPreview = () => {
    setPreviewRecord(currentRecord);
    setIsPreviewModalOpen(true);
  };

  // Reset form to 0
  const handleResetForm = () => {
    if (confirm('Reset all values to 0?')) {
      setDisplaySales(0);
      setPosMachine(0);
      setMfsTotal(0);
      setDynamicFields([]);
      setDenominations({
        1000: 0,
        500: 0,
        200: 0,
        100: 0,
        50: 0,
        20: 0,
        10: 0,
        5: 0,
        coins: 0,
      });
      setOpeningPettyCash(0);
      setDailyExpenses(0);
      setExpenseDetails('');
      setCashWithdrawal(0);
      setNextDayPettyCash(0);
      setNotes('');
      setManagerName('');
      showToast('All fields reset to 0.', 'info');
    }
  };

  // Load a historic record back into active form for editing
  const handleLoadRecordToForm = (record: ClosingRecord) => {
    setStoreBranch(record.storeBranch);
    setClosingDate(record.closingDate);
    setManagerName(record.managerName || '');
    setShift((record.shift as any) || 'Full Day');
    setDisplaySales(record.displaySales || 0);
    setPosMachine(record.posMachine || 0);
    setMfsTotal(record.mfsTotal || 0);
    setDynamicFields(record.dynamicFields || []);
    setDenominations(record.denominations || {
      1000: 0, 500: 0, 200: 0, 100: 0, 50: 0, 20: 0, 10: 0, 5: 0, coins: 0
    });
    setOpeningPettyCash(record.openingPettyCash || 0);
    setDailyExpenses(record.dailyExpenses || 0);
    setExpenseDetails(record.expenseDetails || '');
    setCashWithdrawal(record.cashWithdrawal || 0);
    setNextDayPettyCash(record.nextDayPettyCash || 0);
    setNotes(record.notes || '');

    setIsHistoryOpen(false);
    showToast(`Loaded closing record ${record.id} into editor.`, 'info');
  };

  // Delete Record
  const handleDeleteRecord = async (id: string) => {
    await deleteClosingRecord(id);
    await refreshRecords();
    showToast(`Record ${id} removed.`, 'info');
  };

  // View specific historic record in preview modal
  const handleViewHistoricRecord = (record: ClosingRecord) => {
    setPreviewRecord(record);
    setIsPreviewModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFCFA] text-[#1A281F]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md bg-white border border-[#CBDAD0] rounded-xl shadow-xl p-3 flex items-start gap-2.5 animate-in slide-in-from-bottom-2">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : toastMessage.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-5 h-5 text-[#2E6B42] shrink-0 mt-0.5" />
          )}
          <div className="text-xs font-medium text-[#1A281F]">
            {toastMessage.text}
          </div>
        </div>
      )}

      {/* Main Top Header */}
      <Header
        storeBranch={storeBranch}
        onStoreBranchChange={setStoreBranch}
        closingDate={closingDate}
        onClosingDateChange={setClosingDate}
        managerName={managerName}
        onManagerNameChange={setManagerName}
        shift={shift}
        onShiftChange={setShift}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenFirebaseConfig={() => setIsFirebaseModalOpen(true)}
        onResetForm={handleResetForm}
        historyCount={historyRecords.length}
        isFirebaseActive={isFirebaseActive}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Real-time Reconciliation Summary Card & Structured Audit */}
        <ReconciliationSummaryCard
          form={formState}
          totals={totals}
          onSaveClosing={handleSaveDailyClosing}
          onExportPDF={handleExportPDF}
          onPreviewVoucher={handleOpenPreview}
          isSaving={isSaving}
        />

        {/* 2-Column Responsive Form Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Sales & Digital Collections + Adjustments (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-6">
            <SalesSection
              displaySales={displaySales}
              onDisplaySalesChange={setDisplaySales}
              posMachine={posMachine}
              onPosMachineChange={setPosMachine}
              mfsTotal={mfsTotal}
              onMfsTotalChange={setMfsTotal}
              dynamicFields={dynamicFields}
              onDynamicFieldsChange={setDynamicFields}
              totalNonCash={totals.totalNonCash}
            />

            <AdjustmentsSection
              openingPettyCash={openingPettyCash}
              onOpeningPettyCashChange={setOpeningPettyCash}
              dailyExpenses={dailyExpenses}
              onDailyExpensesChange={setDailyExpenses}
              expenseDetails={expenseDetails}
              onExpenseDetailsChange={setExpenseDetails}
              notes={notes}
              onNotesChange={setNotes}
              totalPhysicalCash={totals.totalPhysicalCash}
              cashWithdrawal={cashWithdrawal}
              onCashWithdrawalChange={setCashWithdrawal}
              nextDayPettyCash={nextDayPettyCash}
              onNextDayPettyCashChange={setNextDayPettyCash}
            />
          </div>

          {/* Right Column: Physical Cash Denomination Counter (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-6">
            <DenominationCounter
              denominations={denominations}
              onDenominationsChange={setDenominations}
              totalPhysicalCash={totals.totalPhysicalCash}
            />

            {/* Quick Closing Checklist */}
            <div className="bg-[#F7FAF8] border border-[#E2EBE4] rounded-xl p-4 text-xs text-[#5F7364] space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-[#2E6B42]">
                <HelpCircle className="w-4 h-4" />
                <span>Daily Closing Checklist</span>
              </div>
              <ul className="space-y-1 list-disc list-inside text-[11px] leading-relaxed">
                <li>Input <strong>Display Sales</strong> from register display.</li>
                <li>Enter <strong>POS Card Machine</strong> & <strong>MFS (bKash/Nagad)</strong> collections.</li>
                <li>Tally note quantities (1000, 500, 200, 100, 50, 20, 10, 5) & coins.</li>
                <li>Enter <strong>Opening Float</strong> and <strong>Daily Bazar</strong> expenses.</li>
                <li>Specify <strong>Cash Withdrawal</strong> & <strong>Next Day Petty Cash</strong> float.</li>
                <li>Click <strong>Save Daily Closing</strong> and <strong>Export PDF Slip</strong> for signature.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E2EBE4] py-4 text-xs text-[#5F7364]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <img 
              src="/assets/aistudio/14742841266_e8d19bff.png" 
              alt="Cha Joy" 
              className="w-5 h-5 object-contain rounded-full"
            />
            <span className="font-bold text-[#1A281F]">Cha Joy</span>
            <span>·</span>
            <span>Ice Cream and Tea</span>
            <span>·</span>
            <span>Badda - 1 & Aftabnagar - 11 Branches</span>
          </div>
          <div>
            Daily Closing & Cash Reconciliation · {new Date().getFullYear()}
          </div>
        </div>
      </footer>

      {/* Drawers and Modals */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        records={historyRecords}
        onDeleteRecord={handleDeleteRecord}
        onViewRecord={handleViewHistoricRecord}
        onLoadRecordToForm={handleLoadRecordToForm}
        activeSource={storageSource}
      />

      <FirebaseConfigModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
        onConfigSaved={refreshRecords}
      />

      <VoucherPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        record={previewRecord}
      />
    </div>
  );
}
