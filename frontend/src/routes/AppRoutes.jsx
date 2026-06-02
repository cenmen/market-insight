import { Navigate, Route, Routes } from 'react-router-dom'
import EtfReportPage from '@/pages/EtfReport'
import AfterClosePage from '@/pages/AfterClose'
import HomePage from '@/pages/Home'
import HtmlEffectivenessPage from '@/pages/HtmlEffectiveness'
import PreOpenPage from '@/pages/PreOpen'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/article/html-effectiveness" element={<HtmlEffectivenessPage />} />
      <Route path="/etf/:code" element={<EtfReportPage />} />
      <Route path="/after-close" element={<AfterClosePage />} />
      <Route path="/pre-open" element={<PreOpenPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
