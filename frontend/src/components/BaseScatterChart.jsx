import BaseChart from '@/components/BaseChart.jsx';

function buildSymmetricExtent(values, fallback) {
  const maxAbs = values.reduce(function reduceMax(current, value) {
    const numericValue = Math.abs(Number(value) || 0);
    return numericValue > current ? numericValue : current;
  }, 0);
  const extent = Math.max(fallback, maxAbs * 1.15 || fallback);
  return [-extent, extent];
}

function buildScatterOption(data, options = {}) {
  const points = data.map(function mapPoint(item) {
    return {
      value: [Number(item.changeRate), Number(item.mainNetInflow), item.name],
      name: item.name,
    };
  });
  const inflowValues = points.map(function mapInflow(point) {
    return Number(point.value[1] ?? 0);
  });
  const xMin = -10;
  const xMax = 10;
  const [yMin, yMax] = buildSymmetricExtent(inflowValues, options.yFallback ?? 5);

  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.96)',
      borderColor: '#e1d6ba',
      borderWidth: 1,
      textStyle: {
        color: '#29261f',
      },
      formatter: function formatTooltip(params) {
        const value = params.data?.value || params.value || [];
        const name = params.data?.name || params.name || '';
        const changeRate = Number(value[0] ?? 0);
        const mainNetInflow = Number(value[1] ?? 0);
        return [
          `<div style="font-size:12px;font-weight:600;margin-bottom:4px;">${name}</div>`,
          `<div>涨跌幅：${changeRate >= 0 ? '+' : ''}${changeRate.toFixed(2)}%</div>`,
          `<div>主力净流入：${mainNetInflow.toFixed(2)} 亿</div>`,
        ].join('');
      },
    },
    grid: {
      left: options.gridLeft ?? 30,
      right: options.gridRight ?? 30,
      top: options.gridTop ?? 18,
      bottom: options.gridBottom ?? 30,
    },
    xAxis: {
      min: xMin,
      max: xMax,
      scale: true,
      axisLine: {
        lineStyle: {
          color: '#a9a59a',
        },
      },
      axisLabel: {
        color: '#6b6a64',
        formatter: function formatXAxis(value) {
          return `${Number(value).toFixed(0)}%`;
        },
      },
      splitLine: {
        show: false,
      },
    },
    yAxis: {
      min: yMin,
      max: yMax,
      scale: true,
      axisLine: {
        lineStyle: {
          color: '#a9a59a',
        },
      },
      axisLabel: {
        color: '#6b6a64',
        formatter: function formatYAxis(value) {
          return `${Number(value).toFixed(0)} 亿`;
        },
      },
      splitLine: {
        show: false,
      },
    },
    series: [
      {
        type: 'custom',
        data: points,
        clip: false,
        renderItem: function renderItem(params, api) {
          const changeRate = Number(api.value(0) ?? 0);
          const inflow = Number(api.value(1) ?? 0);
          const name = String(api.value(2) ?? '');
          const point = api.coord([changeRate, inflow]);
          const radius = Math.max(4, Math.min(10, 3.5 + Math.abs(changeRate) * 0.45));
          const lineOffsetX = changeRate >= 0 ? 58 : -58;
          const lineOffsetY = inflow >= 0 ? -26 : 26;
          const labelX = point[0] + lineOffsetX;
          const labelY = point[1] + lineOffsetY;
          const textAlign = changeRate >= 0 ? 'left' : 'right';
          const lineEndX = labelX + (changeRate >= 0 ? -6 : 6);
          const lineEndY = labelY + (inflow >= 0 ? 8 : -8);
          const pctColor = changeRate >= 0 ? '#d84b4b' : '#2f8a52';

          return {
            type: 'group',
            children: [
              {
                type: 'line',
                shape: {
                  x1: point[0],
                  y1: point[1],
                  x2: lineEndX,
                  y2: lineEndY,
                },
                style: {
                  stroke: '#8c8477',
                  lineWidth: 1,
                },
              },
              {
                type: 'circle',
                shape: {
                  cx: point[0],
                  cy: point[1],
                  r: radius,
                },
                style: {
                  fill: changeRate >= 0 ? '#d84b4b' : '#2f8a52',
                  stroke: '#ffffff',
                  lineWidth: 1,
                },
              },
              {
                type: 'text',
                  style: {
                    x: labelX,
                    y: labelY,
                    text: `{name|${name}}{pct|「${changeRate >= 0 ? '+' : ''}${changeRate.toFixed(2)}%」}`,
                    fill: '#3d3d3a',
                  font: '10px sans-serif',
                  textAlign,
                  textVerticalAlign: 'bottom',
                  rich: {
                    name: {
                      fontSize: 10,
                      fontWeight: 600,
                      fill: '#3d3d3a',
                    },
                    pct: {
                      fontSize: 10,
                      fontWeight: 600,
                      fill: pctColor,
                    },
                  },
                },
              },
            ],
          };
        },
      },
    ],
  };
}

export default function BaseScatterChart({ data = [], height = 320, className, xAxisName, yAxisName }) {
  return <BaseChart option={buildScatterOption(data)} height={height} className={className} />;
}
