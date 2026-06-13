import { create } from 'zustand';

const useSettingStore = create(function createSettingStore(set) {
  return {
    etfTracking: [],
    updateEtfTracking: function updateEtfTracking(list) {
      set({
        etfTracking: Array.isArray(list) ? list : [],
      });
    },
  };
});

export default useSettingStore;
