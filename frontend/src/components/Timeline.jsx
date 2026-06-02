import clsx from 'clsx';

export default function Timeline(props) {
  const { items } = props;

  return (
    <div className='mt-[10pt] border-l-0 pl-0'>
      {items.map(function mapEvent(item) {
        const statusTag = item.statusTag ?? null;
        const detailTags = item.tags ?? [];

        return (
          <article
            className='relative mb-[10pt] break-inside-avoid pt-[4pt] pl-[18pt] before:absolute before:top-[18pt] before:left-[5pt] before:h-[calc(100%+8pt)] before:w-[1pt] before:bg-[#e8e6dc] last:before:hidden'
            key={`${item.title}-${item.datetime ?? item.date}`}
          >
            <div className='absolute top-[4.5pt] left-[2.5pt] h-[6pt] w-[6pt] rounded-full bg-[#1b365d]' />
            {item.datetime ? <div className='mb-[5pt] pl-[2pt] text-[10pt] leading-none text-[#6b6a64]'>{item.datetime}</div> : null}
            <div className='rounded-[4pt] border border-[#e8e6dc] bg-[#faf9f5] px-[9pt] py-[7pt]'>
              <div className='flex items-start justify-between gap-[8pt]'>
                <div className='font-medium text-[#3d3d3a]'>{item.title}</div>
                {statusTag ? (
                  <span
                    className={clsx(
                      'inline-flex items-center rounded-[3pt] px-[6pt] py-[2pt] text-[8.5pt] leading-none font-medium text-white',
                      statusTag.kind === 'bearish' && 'bg-[#89a56f]',
                      statusTag.kind === 'bullish' && 'bg-[#b84e4e]',
                      statusTag.kind !== 'bearish' && statusTag.kind !== 'bullish' && 'bg-[#d8c79a]',
                    )}
                  >
                    {statusTag.label}
                  </span>
                ) : null}
              </div>
              {item.source ? <div className='mt-[2pt] text-[9pt] text-[#6b6a64]'>{item.source}</div> : null}
              <p className='mt-[5pt] text-[9pt] leading-[1.45] text-[#504e49]'>{item.summary}</p>
              {detailTags.length > 0 ? (
                <div className='mt-[6pt] flex flex-wrap gap-[4pt]'>
                  {detailTags.map(function mapTag(tag) {
                    return (
                      <span className='inline-block rounded-[3pt] bg-[#e4ecf5] px-[6pt] py-[1pt] text-[8.5pt] font-medium text-[#1b365d]' key={tag}>
                        {tag}
                      </span>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
