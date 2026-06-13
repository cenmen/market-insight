import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';

import { router } from '@/router';
import { fetchEtfTrackingSetting } from '@/services';
import useSettingStore from '@/stores/setting';

export default function App() {
  const updateEtfTracking = useSettingStore((state) => state.updateEtfTracking);
  const loadEtfTracking = async () => {
    try {
      const payload = await fetchEtfTrackingSetting();
      updateEtfTracking(Array.isArray(payload) ? payload : []);
    } catch (error) {
      updateEtfTracking([]);
    }
  };

  useEffect(() => {
    loadEtfTracking();
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position='top-right' richColors />
    </>
  );
}
