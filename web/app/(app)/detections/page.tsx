'use client';

import { useAppContext } from '../../context/app-context';
import { DetectionsTab } from '../../components/dashboard-ui';
import { AppLayoutHeader } from '../../components/app-layout-header';

export default function DetectionsPage() {
  const { data } = useAppContext();

  return (
    <>
      <AppLayoutHeader title="Detections" />
      <div className="p-6 stagger-children">
        <DetectionsTab data={data} />
      </div>
    </>
  );
}
