import { Navigate, Route, Routes } from 'react-router-dom';
import EtfReportPage from '@/pages/EtfReport';
import AfterClosePage from '@/pages/AfterClose';
import Static from '@/pages/Static';
import EventTimelinePage from '@/pages/EventTimeline';
import HomePage from '@/pages/Home';
import PreOpenPage from '@/pages/PreOpen';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path='/' element={<HomePage />} />
      <Route path='/article/event-timeline' element={<EventTimelinePage />} />
      <Route path='/etf/:code' element={<EtfReportPage />} />
      <Route path='/after-close' element={<AfterClosePage />} />
      <Route path='/static' element={<Static />} />
      <Route path='/pre-open' element={<PreOpenPage />} />
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  );
}
