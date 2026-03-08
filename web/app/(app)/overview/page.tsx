'use client';

import { useState } from 'react';
import { useAppContext } from '../../context/app-context';
import { OverviewTab } from '../../components/dashboard-ui';
import { AppLayoutHeader } from '../../components/app-layout-header';
import { CallConfirmModal } from '../../components/call-confirm-modal';

export default function OverviewPage() {
  const { data, chartData, callStatus, callError, handleEmergencyCall, resetCallStatus } = useAppContext();
  const [showCallModal, setShowCallModal] = useState(false);

  return (
    <>
      <AppLayoutHeader title="Overview" />
      <div className="p-6 stagger-children">
        <OverviewTab data={data} chartData={chartData} onCallEmergency={() => setShowCallModal(true)} />
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
