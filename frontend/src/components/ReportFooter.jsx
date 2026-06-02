export default function ReportFooter({
  disclaimer = '仅供参考，不构成任何投资建议。',
  source = '抖音 · ETF主线侦探',
  date,
}) {
  const sourceText = date ? `${source} · ${date}` : source;

  return (
    <footer className='mt-4 flex justify-between gap-4 border-t border-solid border-[#e8e6dc] pt-2 text-[12px] text-[#6b6a64]'>
      <span>{disclaimer}</span>
      <span>{sourceText}</span>
    </footer>
  );
}
