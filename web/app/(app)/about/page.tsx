'use client';

import { AboutTab } from '../../components/dashboard-ui';
import { AppLayoutHeader } from '../../components/app-layout-header';

export default function AboutPage() {
  return (
    <>
      <AppLayoutHeader title="About" />
      <div className="p-6 stagger-children">
        <AboutTab />
      </div>
    </>
  );
}
