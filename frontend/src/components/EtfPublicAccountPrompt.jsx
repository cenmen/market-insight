import { Download, FileText, Image as ImageIcon, QrCode, Sparkles } from 'lucide-react';
import avatar from '@/assets/zhuxianzhentan.png';

function Pill({ icon, children }) {
  return (
    <span className='inline-flex items-center rounded-[3pt] border border-[#d8caa7] bg-[#f8f1e1] px-[6pt] py-[2pt] text-[8.5pt] font-medium text-[#6b5727]'>
      {icon && <span className='mr-[4pt] inline-flex h-[10pt] w-[10pt] shrink-0 items-center justify-center text-[#8a6c2f]'>{icon}</span>}
      {children}
    </span>
  );
}

export default function EtfPublicAccountPrompt() {
  return (
    <div className='rounded-[4pt] border border-[#e1d6ba] bg-[#fbf7ee] px-[10pt] py-[9pt]'>
      <div className='mb-[6pt] flex items-center gap-[6pt] text-[9pt] font-medium text-[#7d6d3f]'>
        <QrCode className='h-[13px] w-[13px]' />
        获取方式
      </div>
      <div className='text-[9pt] leading-[1.6] text-[#5f5a50]'>
        搜索关注公众号「 <strong>ETF主线侦探</strong>」。关注后在菜单项获取当前报告的免费超清原图和 PDF 下载链接。
      </div>
      <div className='mt-[8pt] flex flex-wrap gap-[6pt]'>
        <Pill icon={<ImageIcon className='h-[10pt] w-[10pt]' />}>超清原图</Pill>
        <Pill icon={<FileText className='h-[10pt] w-[10pt]' />}>PDF 下载</Pill>
        <Pill icon={<Download className='h-[10pt] w-[10pt]' />}>免费领取</Pill>
      </div>
    </div>
  );
}
