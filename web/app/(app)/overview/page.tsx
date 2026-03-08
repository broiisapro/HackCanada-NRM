'use client';

import { useAppContext } from '../../context/app-context';
import { OverviewTab } from '../../components/dashboard-ui';
import { AppLayoutHeader } from '../../components/app-layout-header';

export default function OverviewPage() {
  const { data, chartData } = useAppContext();

  return (
    <>
      <AppLayoutHeader title="Overview" />
      <div className="p-6 stagger-children">
        <OverviewTab data={data} chartData={chartData} />
      </div>
    </>
  );
}
