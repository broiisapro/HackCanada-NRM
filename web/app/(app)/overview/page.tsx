'use client';

import { useEffect, useState } from 'react';
import { useAppContext } from '../../context/app-context';
import { OverviewTab } from '../../components/dashboard-ui';
import { AppLayoutHeader } from '../../components/app-layout-header';
import { CallConfirmModal } from '../../components/call-confirm-modal';

export default function OverviewPage() {
  const { data, chartData, callStatus, callError, handleEmergencyCall, resetCallStatus } = useAppContext();
  const [showCallModal, setShowCallModal] = useState(false);
  const [liveWeather, setLiveWeather] = useState<typeof data.weather>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  useEffect(() => {
    if (data?.weather != null) {
      setLiveWeather(null);
      setWeatherError(null);
      return;
    }
    const fetchWeather = async () => {
      setWeatherLoading(true);
      setWeatherError(null);
      try {
        const res = await fetch('/api/weather');
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          setWeatherError((j as { error?: string }).error ?? 'Failed to load weather');
          setLiveWeather(null);
          return;
        }
        const w = (await res.json()) as typeof data.weather;
        setLiveWeather(w);
      } catch {
        setWeatherError('Network error');
        setLiveWeather(null);
      } finally {
        setWeatherLoading(false);
      }
    };
    fetchWeather();
  }, [data?.weather]);

  const displayWeather = data?.weather ?? liveWeather;

  return (
    <>
      <AppLayoutHeader title="Overview" />
      <div className="p-6 stagger-children">
        <OverviewTab
          data={data}
          chartData={chartData}
          onCallEmergency={() => setShowCallModal(true)}
          weather={displayWeather}
          weatherLoading={weatherLoading}
          weatherError={weatherError}
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
