import { create } from 'zustand';

const useSettingStore = create((set) => ({
  etfTracking: [],
  updateEtfTracking: (list) => {
    set({
      etfTracking: Array.isArray(list) ? list : [],
    });
  },
}));

export default useSettingStore;
