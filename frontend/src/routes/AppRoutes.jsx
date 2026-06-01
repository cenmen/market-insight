import { Navigate, Route, Routes } from 'react-router-dom'
import EtfReportPage from '@/pages/EtfReport'
import AfterClosePage from '@/pages/AfterClose'
import HomePage from '@/pages/Home'
import HtmlEffectivenessPage from '@/pages/HtmlEffectiveness'

const afterCloseData = {
  mainIndexes: [
    { name: '上证指数', indexValue: '3128.64', changeRate: 0.76 },
    { name: '创业板指', indexValue: '1915.24', changeRate: -1.18 },
    { name: '科创50', indexValue: '742.56', changeRate: -2.04 },
  ],
  techSectors: [
    {
      name: '半导体',
      indexValue: '6821.33',
      changeRate: -2.35,
      turnover: 1563.4,
      netInflowIn: 88.61,
      netInflowOut: 139.82,
    },
    {
      name: 'AI硬件',
      indexValue: '5210.27',
      changeRate: -1.67,
      turnover: 1096.75,
      netInflowIn: 65.74,
      netInflowOut: 101.33,
    },
  ],
  hotSectors: [
    {
      name: '电力',
      indexValue: '2950.66',
      changeRate: 1.84,
      turnover: 682.1,
      netInflowIn: 72.2,
      netInflowOut: 45.18,
    },
    {
      name: '白酒',
      indexValue: '4988.41',
      changeRate: 1.22,
      turnover: 512.33,
      netInflowIn: 48.66,
      netInflowOut: 33.11,
    },
  ],
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/article/html-effectiveness" element={<HtmlEffectivenessPage />} />
      <Route path="/etf/515880" element={<EtfReportPage />} />
      <Route path="/after-close" element={<AfterClosePage data={afterCloseData} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
