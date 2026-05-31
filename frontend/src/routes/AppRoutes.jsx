import { Navigate, Route, Routes } from 'react-router-dom'
import EtfReportPage from '../pages/EtfReportPage'
import HomePage from '../pages/HomePage'
import HtmlEffectivenessPage from '../pages/HtmlEffectivenessPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/article/html-effectiveness" element={<HtmlEffectivenessPage />} />
      <Route path="/etf/515880" element={<EtfReportPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
