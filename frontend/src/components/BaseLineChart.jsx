import { useMemo } from 'react';
import BaseChart from './BaseChart';

function formatNumber(value, digits = 2) {
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return '--';
  }
  return num.toFixed(digits);
}

function resolveSeriesValue(item, key) {
  if (!item || typeof item !== 'object') {
    return null;
  }

  const value = Number(item[key]);
  if (!Number.isFinite(value)) {
    return null;
  }

  return value;
}

function buildLineSeriesData(data, seriesDefs) {
  const categories = [];
  const seriesValues = seriesDefs.map(function mapSeries() {
    return [];
  });

  data.forEach(function eachItem(item) {
    categories.push(item?.date ?? '');
    seriesDefs.forEach(function eachSeries(definition, index) {
      seriesValues[index].push(resolveSeriesValue(item, definition.key));
    });
  });

  return { categories, seriesValues };
}

function formatTooltipValue(definition, value) {
  if (!Number.isFinite(Number(value))) {
    return '--';
  }

  if (typeof definition.formatValue === 'function') {
    return definition.formatValue(value);
  }

  return formatNumber(value);
}

export default function BaseLineChart({ data = [], series = [], height = 160, className, showArea = true }) {
  const option = useMemo(
    function makeOption() {
      const definitions = Array.isArray(series) ? series : [];
      const { categories, seriesValues } = buildLineSeriesData(Array.isArray(data) ? data : [], definitions);

      return {
        animation: false,
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          confine: true,
          borderWidth: 1,
          borderColor: '#e8e6dc',
          backgroundColor: '#faf9f5',
          textStyle: { color: '#141413', fontFamily: 'TsangerJinKai02, serif' },
          formatter(params) {
            const items = Array.isArray(params) ? params : [params];
            if (items.length === 0) {
              return '';
            }

            const firstItem = items[0];
            const lines = [`日期：${firstItem.axisValue ?? '--'}`];

            items.forEach(function eachTooltipItem(item) {
              const definition = definitions[item.seriesIndex];
              if (!definition) {
                return;
              }

              lines.push(`${definition.name || definition.key}：${formatTooltipValue(definition, item.data)}`);
            });

            return lines.join('<br/>');
          },
        },
        grid: {
          left: 2,
          right: 2,
          top: 12,
          bottom: 6,
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          boundaryGap: true,
          data: categories,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { show: false },
          splitLine: { show: false },
        },
        yAxis: {
          type: 'value',
          scale: true,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { show: false },
          splitLine: { show: false },
        },
        series: definitions.map(function mapDefinition(definition, index) {
          const color = definition.color || '#1b365d';
          return {
            name: definition.name || definition.key,
            type: 'line',
            data: seriesValues[index],
            smooth: definition.smooth !== false,
            showSymbol: true,
            symbol: 'circle',
            symbolSize: definition.symbolSize || 4,
            connectNulls: true,
            lineStyle: {
              color,
              width: definition.lineWidth || 2.4,
            },
            itemStyle: {
              color,
            },
            label: {
              show: true,
              position: 'top',
              color: '#141413',
              fontSize: definition.labelFontSize || 8,
              fontFamily: 'TsangerJinKai02, serif',
              formatter(params) {
                return formatTooltipValue(definition, params.value);
              },
            },
            areaStyle: showArea
              ? {
                  color: definition.areaColor || 'rgba(27, 54, 93, 0.14)',
                }
              : undefined,
            emphasis: {
              disabled: true,
            },
          };
        }),
      };
    },
    [data, series, showArea],
  );

  return <BaseChart option={option} height={height} className={className} />;
}
