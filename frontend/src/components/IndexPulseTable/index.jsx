function formatSignedPercent(value) {
  const numeric = Number(value);
  const sign = numeric > 0 ? '+' : '';
  return `${sign}${numeric.toFixed(2)}%`;
}

function renderTrendBlocks(trend) {
  return (
    <div className='flex flex-wrap gap-[3px]'>
      {trend.map(function mapTrend(item, index) {
        const isRise = Number(item) >= 0;
        return (
          <span
            key={`${index}-${item}`}
            className={`h-[8px] w-[8px] rounded-[1px] ${isRise ? 'bg-[#cf3f42]' : 'bg-[#2e8b57]'}`}
            title={formatSignedPercent(item)}
          />
        );
      })}
    </div>
  );
}

export default function IndexPulseTable(props) {
  const rows = props?.rows ?? [];

  return (
    <div className='overflow-x-hidden'>
      <table className='financial striped w-full table-fixed border-collapse text-[8.5pt] text-[#2f2e2b]'>
        <colgroup>
          <col className='w-[88px]' />
          <col />
          <col />
          <col />
          <col />
          <col className='w-[90px]' />
        </colgroup>
        <thead className='text-[#3d3d3a]'>
          <tr>
            <th className='bg-transparent px-[5pt] py-[4pt] text-left font-medium border-x-0 border-b border-[#e8e6dc]'>名称</th>
            <th className='bg-transparent px-[5pt] py-[4pt] text-right font-medium border-x-0 border-b border-[#e8e6dc]'>涨跌幅</th>
            <th className='bg-transparent px-[5pt] py-[4pt] text-right font-medium border-x-0 border-b border-[#e8e6dc]'>最大回撤</th>
            <th className='bg-transparent px-[5pt] py-[4pt] text-right font-medium border-x-0 border-b border-[#e8e6dc]'>换手率</th>
            <th className='bg-transparent px-[5pt] py-[4pt] text-right font-medium border-x-0 border-b border-[#e8e6dc]'>主力净流入</th>
            <th className='bg-transparent px-[5pt] py-[4pt] text-left font-medium border-x-0 border-b border-[#e8e6dc]'>最近涨跌</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(function mapRow(row, index) {
            const changeRate = Number(row.changeRate);
            return (
              <tr key={row.code} className={index % 2 === 1 ? 'bg-[#faf9f5]' : ''}>
                <td className='px-[5pt] py-[3pt] border-x-0 border-b border-[0.3px] border-[#ece9df] align-top'>
                  <div className='font-medium text-[#141413]'>{row.alias}</div>
                </td>
                <td className={`px-[5pt] py-[3pt] border-x-0 border-b border-[0.3px] border-[#ece9df] align-top text-right tabular-nums font-medium ${changeRate >= 0 ? 'text-rise' : 'text-fall'}`}>{formatSignedPercent(changeRate)}</td>
                <td className='px-[5pt] py-[3pt] border-x-0 border-b border-[0.3px] border-[#ece9df] align-top text-right tabular-nums text-fall'>{formatSignedPercent(row.maxDrawdown)}</td>
                <td className='px-[5pt] py-[3pt] border-x-0 border-b border-[0.3px] border-[#ece9df] align-top text-right tabular-nums'>{formatSignedPercent(row.turnoverRate)}</td>
                <td className={`px-[5pt] py-[3pt] border-x-0 border-b border-[0.3px] border-[#ece9df] align-top text-right tabular-nums ${Number(row.mainNetInflow) >= 0 ? 'text-rise' : 'text-fall'}`}>
                  {`${Number(row.mainNetInflow) >= 0 ? '+' : ''}${Number(row.mainNetInflow).toFixed(2)}亿`}
                </td>
                <td className='px-[5pt] py-[3pt] border-x-0 border-b border-[0.3px] border-[#ece9df] align-top'>{renderTrendBlocks(row.recentTrend)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
