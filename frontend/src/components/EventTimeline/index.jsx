export default function EventTimeline(props) {
  const { items } = props;

  return (
    <div className='mt-[10pt] border-l-0 pl-0'>
      {items.map(function mapEvent(item) {
        return (
          <article className='relative mb-[8pt] break-inside-avoid pl-[18pt] before:absolute before:left-[5pt] before:top-[15pt] before:h-[calc(100%+8pt)] before:w-[1pt] before:bg-[#e8e6dc] last:before:hidden' key={`${item.title}-${item.date}`}>
            <div className='absolute left-[2.5pt] top-[4.5pt] h-[6pt] w-[6pt] rounded-full bg-[#1b365d]' />
            <div className='rounded-[4pt] border border-[#e8e6dc] bg-[#faf9f5] px-[9pt] py-[7pt]'>
              <div className='flex items-start justify-between gap-[8pt]'>
                <div className='font-medium text-[#3d3d3a]'>{item.title}</div>
                <div className='whitespace-nowrap text-right text-[8.5pt] text-[#6b6a64]'>{item.date}</div>
              </div>
              <div className='mt-[2pt] text-[9pt] text-[#6b6a64]'>{item.source}</div>
              <p className='mt-[5pt] text-[9pt] leading-[1.45] text-[#504e49]'>{item.summary}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
