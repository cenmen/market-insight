import PageShell from '../components/PageShell';

export default function HtmlEffectivenessPage() {
  return (
    <PageShell>
      <article className='font-momo mx-auto w-full max-w-[760px] px-1 text-[#2f2c26]'>
        <p className='mb-4 text-xs tracking-[0.25em] text-[#8d8b83] uppercase md:text-[15px]'>VANTASTACK RESEARCH 盘面解读</p>
        <header className='border-t border-[#e4dfd3] pt-4 md:pt-5'>
          <h1 className='text-[30px] leading-[1.1] font-semibold tracking-[0.01em] text-[#1f1e1a] md:text-[72px]'>HTML 不合常理地有效</h1>
          <p className='font-momoLatin mt-4 text-[16px] leading-tight text-[#6f6b61] italic md:mt-5 md:text-[48px]'>The unreasonable effectiveness of HTML</p>
        </header>

        <section className='mt-6 space-y-2 text-[14px] leading-[1.78] font-normal tracking-[0.01em] md:mt-11 md:text-[14px]'>
          <p>
            过去几个月，我们 Claude Code 团队几乎所有日常工作的交付物都已经从 Markdown 换成了
            HTML。规划文档、代码审查、设计原型、研究报告、定制编辑界面，全部以单文件 HTML 完成。
          </p>
          <p>这件事听起来有点违和：HTML 是一项九十年代的网页技术，为什么会成为和 AI 协作最顺手的格式？</p>
          <p>下面五个原因和五个用例，是我们这段时间反复印证下来的结论。它改变的不是某一个具体工具，而是「人与 AI 怎么共同处理一份资料」这件事的形态。</p>
          <p className='mt-8 md:mt-11'>
            作者 / <span className='font-momoLatin'>小红书</span> · 韭菜练习生
          </p>
        </section>
      </article>
    </PageShell>
  );
}
