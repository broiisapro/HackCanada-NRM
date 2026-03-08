'use client';

import { useAppContext } from '../../context/app-context';
import { LogsTab } from '../../components/dashboard-ui';
import { AppLayoutHeader } from '../../components/app-layout-header';

export default function LogsPage() {
  const { data } = useAppContext();

  return (
    <>
      <AppLayoutHeader title="Event Log" />
      <div className="p-6 stagger-children">
        <LogsTab data={data} />
      </div>
    </>
  );
}
