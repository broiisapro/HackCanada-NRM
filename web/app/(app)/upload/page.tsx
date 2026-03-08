'use client';

import { useState } from 'react';
import { useAppContext } from '../../context/app-context';
import { UploadTab } from '../../components/dashboard-ui';
import { AppLayoutHeader } from '../../components/app-layout-header';
import { CallConfirmModal } from '../../components/call-confirm-modal';

export default function UploadPage() {
  const {
    uploadFile,
    setUploadFile,
    analyzing,
    uploadResult,
    handleAnalyze,
    hasAnalyzed,
    callStatus,
    callError,
    handleEmergencyCall,
    resetCallStatus,
  } = useAppContext();
  const [showCallModal, setShowCallModal] = useState(false);

  const handleFileChange = (file: File | null) => {
    setUploadFile(file);
  };

  return (
    <>
      <AppLayoutHeader title="Upload & Analyze" />
      <div className="p-6">
        <UploadTab
          selectedFile={uploadFile}
          analyzing={analyzing}
          result={uploadResult}
          onFileChange={handleFileChange}
          onAnalyze={handleAnalyze}
          hasAnalyzed={hasAnalyzed}
          onCallEmergency={() => setShowCallModal(true)}
        />
      </div>
      <CallConfirmModal
        open={showCallModal}
        onClose={() => { setShowCallModal(false); resetCallStatus(); }}
        onConfirm={handleEmergencyCall}
        calling={callStatus === 'calling'}
        callResult={callStatus === 'success' ? { success: true } : callStatus === 'error' ? { success: false, error: callError ?? undefined } : null}
      />
    </>
  );
}
