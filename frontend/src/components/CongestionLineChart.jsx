import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { fetchSectorCongestion } from '@/services';
import BaseChart from './BaseChart';

const DEFAULT_CONGESTION_THEMES = [
  { key: 'chip', label: '芯片', color: '#1b365d' },
  { key: 'communication', label: '通信', color: '#8a5d25' },
  // { key: 'semiconductorEquipment', label: '半导体设备', color: '#2f8a52' },
];

function buildQueryKey(themes, days) {
  return [
    'sectorCongestion',
    days,
    themes
      .map(function mapTheme(theme) {
        return theme.key;
      })
      .join('|'),
  ];
}

function formatDateLabel(value) {
  if (typeof value !== 'string') {
    return '--';
  }

  const parts = value.split('-');
  if (parts.length === 3) {
    return `${parts[1]}-${parts[2]}`;
  }

  return value;
}

function formatPercent(value) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return '--';
  }

  return `${numberValue.toFixed(2)}%`;
}

function formatAmount(value, unit) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return '--';
  }

  return `${numberValue.toFixed(2)} ${unit || ''}`.trim();
}

function resolveFiniteValue(value) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return null;
  }

  return numberValue;
}

function getLatestRow(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return null;
  }

  return rows[rows.length - 1];
}

function buildChartRows(rows, themes) {
  return rows.map(function mapRow(row) {
    const chartRow = {
      date: row?.date ?? '',
    };

    themes.forEach(function mapTheme(theme) {
      const cell = row?.[theme.key];
      chartRow[theme.key] = {
        value: resolveFiniteValue(cell?.ratio),
        amount: cell?.amount,
        unit: row?.unit,
      };
    });

    return chartRow;
  });
}

export default function CongestionLineChart({
  title = '拥挤度',
  description = '近 90 日成交额占比变化。',
  days = 90,
  themes = DEFAULT_CONGESTION_THEMES,
  height = 260,
}) {
  const themeList = Array.isArray(themes) && themes.length > 0 ? themes : DEFAULT_CONGESTION_THEMES;
  const themeKeys = themeList.map(function mapTheme(theme) {
    return theme.key;
  });

  const query = useQuery({
    queryKey: buildQueryKey(themeList, days),
    queryFn: function fetchCongestion() {
      return fetchSectorCongestion({
        themeKeys: themeKeys.join(','),
        days,
      });
    },
  });

  const chartRows = useMemo(
    function makeChartRows() {
      return buildChartRows(Array.isArray(query.data) ? query.data : [], themeList);
    },
    [query.data, themeList],
  );

  const latestRow = getLatestRow(Array.isArray(query.data) ? query.data : []);

  const option = useMemo(
    function makeOption() {
      return {
        animation: false,
        backgroundColor: 'transparent',
        color: themeList.map(function mapTheme(theme) {
          return theme.color;
        }),
        tooltip: {
          trigger: 'axis',
          confine: true,
          borderWidth: 1,
          borderColor: '#e8e6dc',
          backgroundColor: '#faf9f5',
          textStyle: {
            color: '#141413',
            fontFamily: 'TsangerJinKai02, serif',
          },
          formatter: function formatTooltip(params) {
            const items = Array.isArray(params) ? params : [params];

            if (items.length === 0) {
              return '';
            }

            const firstItem = items[0];
            const lines = [`日期：${formatDateLabel(firstItem.axisValue)}`];

            items.forEach(function mapItem(item) {
              const theme = themeList[item.seriesIndex];
              const value = item.data?.value;
              const amount = item.data?.amount;
              const unit = item.data?.unit;

              if (!theme) {
                return;
              }

              lines.push(`${theme.label}：${formatPercent(value)} · ${formatAmount(amount, unit)}`);
            });

            return lines.join('<br/>');
          },
        },
        legend: {
          top: 2,
          left: 0,
          itemWidth: 12,
          itemHeight: 8,
          textStyle: {
            color: '#6b6a64',
            fontSize: 11,
          },
        },
        grid: {
          left: 4,
          right: 6,
          top: 34,
          bottom: 8,
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: chartRows.map(function mapRow(row) {
            return row.date;
          }),
          axisLine: {
            lineStyle: {
              color: '#d9d3c3',
            },
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            color: '#6b6a64',
            formatter: function formatXAxis(value) {
              return formatDateLabel(value);
            },
          },
          splitLine: {
            show: false,
          },
        },
        yAxis: {
          type: 'value',
          scale: true,
          axisLine: {
            lineStyle: {
              color: '#d9d3c3',
            },
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            color: '#6b6a64',
            formatter: function formatYAxis(value) {
              return `${Number(value).toFixed(0)}%`;
            },
          },
          splitLine: {
            lineStyle: {
              color: '#ece8d9',
            },
          },
        },
        series: themeList.map(function mapTheme(theme) {
          return {
            name: theme.label,
            type: 'line',
            data: chartRows.map(function mapRow(row) {
              return row[theme.key];
            }),
            smooth: true,
            showSymbol: false,
            connectNulls: true,
            lineStyle: {
              width: 2.2,
              color: theme.color,
            },
            itemStyle: {
              color: theme.color,
            },
            emphasis: {
              disabled: true,
            },
          };
        }),
      };
    },
    [chartRows, themeList],
  );

  const latestDate = latestRow?.date ? formatDateLabel(latestRow.date) : '--';
  const totalAmount = formatAmount(latestRow?.total_amount, latestRow?.unit);

  return (
    <section className='break-inside-avoid rounded-[4pt] bg-[#faf9f5] p-[10pt]'>
      <div className='flex flex-wrap items-end justify-between gap-[8pt]'>
        <div>
          <div className='text-[10pt] font-medium text-[#3d3d3a]'>{title}</div>
          <div className='mt-[3pt] text-[9pt] leading-[1.45] text-[#504e49]'>{description}</div>
        </div>
        <div className='text-right text-[8.5pt] leading-[1.45] text-[#6b6a64]'>
          <div>最近日期 {latestDate}</div>
          <div>总成交额 {totalAmount}</div>
        </div>
      </div>

      <div className='mt-[8pt] grid grid-cols-3 gap-[8pt] max-[820px]:grid-cols-1'>
        {themeList.map(function mapTheme(theme) {
          const latestTheme = latestRow?.[theme.key];

          return (
            <div className='rounded-[3pt] bg-[#f3efe2] px-[9pt] py-[7pt]' key={theme.key}>
              <div className='text-[9pt] font-medium text-[#3d3d3a]'>{theme.label}</div>
              <div className='mt-[3pt] text-[13pt] leading-none font-medium text-[#1b365d] tabular-nums'>{formatPercent(latestTheme?.ratio)}</div>
              <div className='mt-[3pt] text-[8.5pt] text-[#6b6a64] tabular-nums'>{formatAmount(latestTheme?.amount, latestRow?.unit)}</div>
            </div>
          );
        })}
      </div>

      <div className='mt-[8pt]'>
        {query.isLoading ? <p className='text-[9pt] text-[#6b6a64]'>拥挤度加载中...</p> : null}
        {query.isError ? <p className='text-[9pt] text-[#8a4b3b]'>{query.error?.message || '拥挤度加载失败'}</p> : null}
        {!query.isLoading && !query.isError ? <BaseChart option={option} height={height} /> : null}
      </div>
    </section>
  );
}
