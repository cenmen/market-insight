function getCellValue(record, dataIndex) {
  if (!dataIndex) {
    return undefined;
  }
  return record?.[dataIndex];
}

export default function KamiTable(props) {
  const dataSource = props?.dataSource ?? [];
  const columns = props?.columns ?? [];
  const rowKey = props?.rowKey ?? 'key';

  return (
    <div className='overflow-x-hidden'>
      <table className='financial striped w-full table-fixed border-collapse text-[8.5pt] text-[#2f2e2b]'>
        <colgroup>
          {columns.map(function mapCol(column) {
            return <col key={column.key ?? column.dataIndex ?? column.title} style={column.width ? { width: column.width } : undefined} />;
          })}
        </colgroup>
        <thead className='text-[#3d3d3a]'>
          <tr>
            {columns.map(function mapHeader(column) {
              const alignClass = column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left';
              return (
                <th key={column.key ?? column.dataIndex ?? column.title} className={`bg-transparent px-[5pt] py-[4pt] font-medium border-x-0 border-b border-[#e8e6dc] ${alignClass}`}>
                  {column.title}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {dataSource.map(function mapRow(record, rowIndex) {
            const keyValue = typeof rowKey === 'function' ? rowKey(record) : record?.[rowKey];
            return (
              <tr key={keyValue ?? rowIndex} className={rowIndex % 2 === 1 ? 'bg-[#faf9f5]' : ''}>
                {columns.map(function mapCell(column) {
                  const value = getCellValue(record, column.dataIndex);
                  const alignClass = column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left';
                  const content = column.render ? column.render(value, record, rowIndex) : value;
                  return (
                    <td key={column.key ?? column.dataIndex ?? column.title} className={`px-[5pt] py-[3pt] border-x-0 border-b border-[0.3px] border-[#ece9df] align-top ${alignClass}`}>
                      {content}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
