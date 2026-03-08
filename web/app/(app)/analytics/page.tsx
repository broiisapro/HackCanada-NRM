'use client';

import { useAppContext } from '../../context/app-context';
import { AnalyticsTab } from '../../components/dashboard-ui';
import { AppLayoutHeader } from '../../components/app-layout-header';

export default function AnalyticsPage() {
  const { chartData, gasBarData } = useAppContext();

  return (
    <>
      <AppLayoutHeader title="Analytics" />
      <div className="p-6 stagger-children">
        <AnalyticsTab chartData={chartData} gasBarData={gasBarData} />
      </div>
    </>
  );
}
