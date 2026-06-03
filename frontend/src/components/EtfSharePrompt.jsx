import { QrCode, Search } from 'lucide-react';
import douyinIcon from '@/assets/douyin.svg';
import avatar from '@/assets/zhuxianzhentan.png';
import xianyuQrcode from '@/assets/xianyu_qrcode.png';
import xiaohongshuIcon from '@/assets/xiaohongshu.svg';

function Pill({ icon, children }) {
  return (
    <span className='inline-flex items-center rounded-[3pt] border border-[#e1d6ba] bg-[#f8f1e1] px-[6pt] py-[2pt] text-[8.5pt] font-medium text-[#6b5727]'>
      {icon && <img alt='' aria-hidden='true' className='mr-[4pt] h-[10pt] w-[10pt] shrink-0 object-contain' src={icon} />}
      {children}
    </span>
  );
}

export default function EtfSharePrompt() {
  return (
    <section className='my-[14pt] break-inside-avoid border border-[#e3d7b7] bg-[#f8f3e8] px-[12pt] py-[10pt] text-[#29261f] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]'>
      <div className='mb-[8pt] flex items-start gap-[10pt]'>
        <img alt='ETF 主线侦探' className='h-[42pt] w-[42pt] shrink-0 rounded-[4pt] border border-[#d8caa7] bg-[#fffaf0] object-cover' src={avatar} />
        <div className='min-w-0 flex-1'>
          <div className='mb-[3pt] text-[8.5pt] tracking-[1pt] text-[#7d6d3f] uppercase'>SHARE GUIDE</div>
          <h2 className='text-[15pt] leading-[1.15] font-medium text-[#29261f]'>ETF 主线侦探</h2>
          <p className='mt-[4pt] text-[9pt] leading-[1.45] text-[#5f5a50]'>还需要其他ETF研究报告的朋友，可以扫码或直接搜索来闲鱼找我。</p>
        </div>
      </div>

      <div className='grid grid-cols-[1.2fr_0.8fr] gap-[10pt] max-[820px]:grid-cols-1'>
        <div className='rounded-[4pt] border border-[#e1d6ba] bg-[#fbf7ee] px-[10pt] py-[9pt]'>
          <div className='mb-[6pt] flex items-center gap-[6pt] text-[9pt] font-medium text-[#7d6d3f]'>
            <QrCode className='h-[13px] w-[13px]' />
            扫码或搜索
          </div>
          <div className='grid grid-cols-[auto_1fr] gap-[10pt]'>
            <div className='flex h-[84pt] w-[84pt] items-center justify-center overflow-hidden rounded-[4pt] border border-dashed border-[#d0c2a1] bg-[#f8f3e8]'>
              <img alt='闲鱼二维码' className='h-full w-full object-contain' src={xianyuQrcode} />
            </div>
            <div className='flex flex-col justify-between'>
              <div className='text-[9pt] leading-[1.5] text-[#5f5a50]'>
                打开闲鱼扫一扫二维码，或者直接在闲鱼搜索 <strong>ETF 主线侦探</strong>，就能找到店铺了。店里有更多 ETF 相关的研究报告，欢迎来看看。
              </div>
              <div className='mt-[8pt] flex flex-wrap gap-[6pt]'>
                <Pill>ETF 复盘</Pill>
                <Pill>主线跟踪</Pill>
                <Pill>持仓观察</Pill>
              </div>
            </div>
          </div>
        </div>

        <div className='flex h-full flex-col rounded-[4pt] border border-[#e1d6ba] bg-[#fbf7ee] px-[10pt] py-[9pt]'>
          <div className='mb-[6pt] flex items-center gap-[6pt] text-[9pt] font-medium text-[#7d6d3f]'>
            <Search className='h-[13px] w-[13px]' />
            关注我们
          </div>
          <p className='text-[9pt] leading-[1.55] text-[#5f5a50]'>持续更新盘前判断、盘后复盘和市场热点，适合想跟着主线节奏看 ETF 的朋友。</p>
          <div className='mt-auto flex flex-wrap gap-[6pt] pt-[8pt]'>
            <Pill icon={xiaohongshuIcon}>韭菜练习生</Pill>
            <Pill icon={douyinIcon}>ETF 主线侦探</Pill>
          </div>
        </div>
      </div>
    </section>
  );
}
