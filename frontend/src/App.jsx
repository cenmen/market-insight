import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';

import { router } from '@/router';
import { fetchEtfTrackingSetting } from '@/services';
import useSettingStore from '@/stores/setting';

export default function App() {
  const updateEtfTracking = useSettingStore(function selectUpdateEtfTracking(state) {
    return state.updateEtfTracking;
  });

  useEffect(
    function loadSettingsOnMount() {
      async function loadEtfTracking() {
        try {
          const payload = await fetchEtfTrackingSetting();
          updateEtfTracking(payload?.etfTracking);
        } catch (error) {
          updateEtfTracking([]);
        }
      }

      loadEtfTracking();
    },
    [updateEtfTracking],
  );

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position='top-right' richColors />
    </>
  );
}
