export default function HiddenStoryLine({ value }) {
  if (typeof value !== 'string' || value.trim() === '') {
    return null;
  }

  return (
    <section className='my-[10pt] break-inside-avoid border-l-[2pt] border-[#1b365d] bg-[#faf9f5] px-[12pt] py-[9pt]'>
      <div className='mb-[4pt] text-[8.5pt] tracking-[1pt] text-[#7d6d3f] uppercase'>隐藏故事线</div>
      <p className='text-[9pt] leading-[1.55] text-[#3d3d3a]'>{value}</p>
    </section>
  );
}
