import { useMemo } from 'react';
import BaseChart from './BaseChart';

const KLineMarkerTypeEnum = Object.freeze({
  SUPPORT: 'support',
  RESISTANCE: 'resistance',
  KEY_INFO: 'keyInfo',
  CANDLE: 'candle',
});

const KLineMarkerDirectionEnum = Object.freeze({
  UP: '上',
  DOWN: '下',
  UP_LEFT: '上中左',
  DOWN_LEFT: '下中左',
});

const KLineMarkerPriorityEnum = Object.freeze({
  SUPPORT: 1,
  RESISTANCE: 2,
  KEY_INFO: 3,
  CANDLE: 4,
});

function splitKlineData(data) {
  const categoryData = [];
  const values = [];
  const volumes = [];
  let previousItem = null;

  data.forEach(function eachItem(item) {
    categoryData.push(item.date);
    values.push({
      value: [item.open, item.close, item.low, item.high],
      open: item.open,
      close: item.close,
      low: item.low,
      high: item.high,
      volume: item.volume,
      amount: item.amount,
      amplitude: item.amplitude,
      maxDrawdown: item.maxDrawdown,
      changePercent: item.changePercent,
      changeAmount: item.changeAmount,
      turnoverRate: item.turnoverRate,
      date: item.date,
      gapType: resolveGapType(previousItem, item),
      gapHigh: resolveGapHigh(previousItem, item),
      gapLow: resolveGapLow(previousItem, item),
      gapLabel: resolveGapLabel(previousItem, item),
    });
    volumes.push({
      value: item.volume ?? 0,
      itemStyle: {
        color: item.open <= item.close ? 'rgba(239, 68, 68, 0.35)' : 'rgba(34, 197, 94, 0.32)',
      },
    });
    previousItem = item;
  });

  return { categoryData, values, volumes };
}

function resolveGapType(previousItem, currentItem) {
  if (!previousItem || !currentItem) {
    return '';
  }

  const previousHigh = Number(previousItem.high);
  const previousLow = Number(previousItem.low);
  const currentHigh = Number(currentItem.high);
  const currentLow = Number(currentItem.low);
  const previousClose = Number(previousItem.close);

  if (Number.isFinite(previousHigh) && Number.isFinite(currentLow) && currentLow > previousHigh) {
    const gapSize = currentLow - previousHigh;
    const threshold = Number.isFinite(previousClose) && previousClose > 0 ? Math.max(previousClose * 0.004, 0.02) : 0.02;
    return gapSize >= threshold ? 'up' : '';
  }

  if (Number.isFinite(previousLow) && Number.isFinite(currentHigh) && currentHigh < previousLow) {
    const gapSize = previousLow - currentHigh;
    const threshold = Number.isFinite(previousClose) && previousClose > 0 ? Math.max(previousClose * 0.004, 0.02) : 0.02;
    return gapSize >= threshold ? 'down' : '';
  }

  return '';
}

function resolveGapHigh(previousItem, currentItem) {
  const gapType = resolveGapType(previousItem, currentItem);

  if (gapType === 'up') {
    return Number(currentItem.low);
  }

  if (gapType === 'down') {
    return Number(previousItem.low);
  }

  return NaN;
}

function resolveGapLow(previousItem, currentItem) {
  const gapType = resolveGapType(previousItem, currentItem);

  if (gapType === 'up') {
    return Number(previousItem.high);
  }

  if (gapType === 'down') {
    return Number(currentItem.high);
  }

  return NaN;
}

function resolveGapLabel(previousItem, currentItem) {
  const gapType = resolveGapType(previousItem, currentItem);

  if (gapType === 'up') {
    return '向上跳空缺口';
  }

  if (gapType === 'down') {
    return '向下跳空缺口';
  }

  return '';
}

function formatNumber(value, digits = 2) {
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return '--';
  }
  return num.toFixed(digits);
}

function formatAmountToYi(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return '--';
  }
  return `${(num / 100000000).toFixed(2)} 亿`;
}

function formatDateWithoutYear(value) {
  if (typeof value !== 'string') {
    return value;
  }
  const parts = value.split('-');
  if (parts.length === 3) {
    return `${parts[1]}-${parts[2]}`;
  }
  return value;
}

function buildMovingAverageData(data, period) {
  const values = [];
  const closes = [];
  let sum = 0;

  data.forEach(function eachItem(item) {
    const close = Number(item.close);
    closes.push(close);

    if (Number.isFinite(close)) {
      sum += close;
    }

    if (closes.length > period) {
      const removed = closes.shift();

      if (Number.isFinite(removed)) {
        sum -= removed;
      }
    }

    if (
      closes.length < period ||
      closes.some(function hasInvalidValue(value) {
        return !Number.isFinite(value);
      })
    ) {
      values.push(null);
      return;
    }

    values.push(Number((sum / period).toFixed(2)));
  });

  return values;
}

function getLatestFiniteValue(values) {
  if (!Array.isArray(values)) {
    return null;
  }

  for (let index = values.length - 1; index >= 0; index -= 1) {
    const value = Number(values[index]);
    if (Number.isFinite(value)) {
      return value;
    }
  }

  return null;
}

function resolveCandleMarkerIndex(marker, categoryData) {
  if (Number.isInteger(marker.index)) {
    return marker.index;
  }

  if (Number.isInteger(marker.dataIndex)) {
    return marker.dataIndex;
  }

  if (typeof marker.date === 'string') {
    return categoryData.indexOf(marker.date);
  }

  return -1;
}

function resolveMarkerPrice(point, candle) {
  if (!point || typeof point !== 'object') {
    return Number.isFinite(Number(candle?.close)) ? Number(candle.close) : NaN;
  }

  if (Number.isFinite(Number(point.price))) {
    return Number(point.price);
  }

  if (Number.isFinite(Number(point.value))) {
    return Number(point.value);
  }

  if (Number.isFinite(Number(candle?.close))) {
    return Number(candle.close);
  }

  if (Number.isFinite(Number(candle?.open))) {
    return Number(candle.open);
  }

  return NaN;
}

function resolveMarkerIndex(point, categoryData) {
  if (!point || typeof point !== 'object') {
    return -1;
  }

  if (Number.isInteger(point.index)) {
    return point.index;
  }

  if (Number.isInteger(point.dataIndex)) {
    return point.dataIndex;
  }

  if (typeof point.date === 'string') {
    return categoryData.indexOf(point.date);
  }

  return -1;
}

function normalizeMarkerGroups(markers) {
  if (Array.isArray(markers)) {
    return {
      candleMarkers: markers,
      supportMarkers: [],
      resistanceMarkers: [],
      keyInfoMarkers: [],
      polyLines: [],
    };
  }

  if (!markers || typeof markers !== 'object') {
    return {
      candleMarkers: [],
      supportMarkers: [],
      resistanceMarkers: [],
      keyInfoMarkers: [],
      polyLines: [],
    };
  }

  return {
    candleMarkers: Array.isArray(markers.candleMarkers) ? markers.candleMarkers : [],
    supportMarkers: Array.isArray(markers.supportMarkers) ? markers.supportMarkers : [],
    resistanceMarkers: Array.isArray(markers.resistanceMarkers) ? markers.resistanceMarkers : [],
    keyInfoMarkers: Array.isArray(markers.keyInfoMarkers) ? markers.keyInfoMarkers : [],
    polyLines: Array.isArray(markers.polyLines) ? markers.polyLines : [],
  };
}

function resolveDefaultMarkerLabel(type) {
  if (type === KLineMarkerTypeEnum.SUPPORT) {
    return '支撑位';
  }

  if (type === KLineMarkerTypeEnum.RESISTANCE) {
    return '压力位';
  }

  if (type === KLineMarkerTypeEnum.KEY_INFO) {
    return '关键信息位';
  }

  return '锤子线';
}

function resolveMarkerDirection(type, position) {
  if (type === KLineMarkerTypeEnum.SUPPORT) {
    return KLineMarkerDirectionEnum.UP;
  }

  if (type === KLineMarkerTypeEnum.RESISTANCE) {
    return KLineMarkerDirectionEnum.DOWN;
  }

  if (position === 'below') {
    return KLineMarkerDirectionEnum.UP_LEFT;
  }

  return KLineMarkerDirectionEnum.DOWN_LEFT;
}

function buildMarkerData(data, categoryData, markerGroups) {
  const lows = data.map(function mapLow(item) {
    return Number(item.low);
  });
  const highs = data.map(function mapHigh(item) {
    return Number(item.high);
  });
  const minLow = Math.min(...lows.filter(Number.isFinite));
  const maxHigh = Math.max(...highs.filter(Number.isFinite));
  const priceRange = Number.isFinite(maxHigh - minLow) && maxHigh > minLow ? maxHigh - minLow : 1;
  const markerGap = priceRange * 0.1;

  const markerEntries = [];

  markerGroups.forEach(function eachGroup(group) {
    const markers = Array.isArray(group.markers) ? group.markers : [];

    markers.forEach(function eachMarker(marker, markerIndex) {
      const dataIndex = resolveCandleMarkerIndex(marker, categoryData);
      const candle = data[dataIndex];

      if (!candle) {
        return;
      }

      const position = marker.position === 'below' ? 'below' : 'above';
      const candleEdge = position === 'below' ? Number(candle.low) : Number(candle.high);
      const targetPrice = Number.isFinite(Number(marker.price)) ? Number(marker.price) : candleEdge;

      if (!Number.isFinite(targetPrice)) {
        return;
      }

      const type = group.type;
      const priority = Number.isFinite(Number(group.priority)) ? Number(group.priority) : KLineMarkerPriorityEnum.CANDLE;
      const lineLength = Number.isFinite(Number(marker.lineLength)) && Number(marker.lineLength) > 0 ? Number(marker.lineLength) : 1;
      const labelPrice = position === 'below' ? targetPrice - markerGap * lineLength : targetPrice + markerGap * lineLength;
      const label = marker.label || resolveDefaultMarkerLabel(type);
      const lineWidth = Number.isFinite(Number(marker.lineWidth)) && Number(marker.lineWidth) > 0 ? Number(marker.lineWidth) : undefined;
      const fontSize = Number.isFinite(Number(marker.fontSize)) && Number(marker.fontSize) > 0 ? Number(marker.fontSize) : undefined;

      markerEntries.push({
        dataIndex,
        date: candle.date,
        targetPrice,
        labelPrice,
        label,
        position,
        type,
        priority,
        direction: resolveMarkerDirection(type, position),
        lineWidth,
        fontSize,
        order: markerIndex,
      });
    });
  });

  markerEntries.sort(function sortMarker(left, right) {
    if (left.dataIndex !== right.dataIndex) {
      return left.dataIndex - right.dataIndex;
    }

    if (left.priority !== right.priority) {
      return left.priority - right.priority;
    }

    return left.order - right.order;
  });

  const seenDate = new Set();
  const filteredMarkers = [];

  markerEntries.forEach(function eachMarker(marker) {
    if (seenDate.has(marker.date)) {
      return;
    }

    seenDate.add(marker.date);
    filteredMarkers.push(marker);
  });

  return filteredMarkers.map(function mapMarker(marker) {
    return [
      marker.dataIndex,
      marker.targetPrice,
      marker.labelPrice,
      marker.label,
      marker.position,
      marker.type,
      marker.lineWidth,
      marker.fontSize,
      marker.direction,
    ];
  });
}

function buildPolylineData(data, categoryData, polyLines) {
  if (!Array.isArray(polyLines) || polyLines.length === 0) {
    return [];
  }

  return polyLines
    .map(function mapPolyLine(line, index) {
      const rawPoints = Array.isArray(line.points) ? line.points : [];
      const points = rawPoints
        .map(function mapPoint(point) {
          const pointIndex = resolveMarkerIndex(point, categoryData);
          const pointCandle = data[pointIndex];
          const pointPrice = resolveMarkerPrice(point, pointCandle);

          if (!Number.isFinite(pointIndex) || pointIndex < 0 || !Number.isFinite(pointPrice)) {
            return null;
          }

          return [pointIndex, pointPrice];
        })
        .filter(Boolean);

      if (points.length < 2) {
        return null;
      }

      const lineWidth = Number.isFinite(Number(line.lineWidth)) && Number(line.lineWidth) > 0 ? Number(line.lineWidth) : 1;
      const color = line.color || '#8a5d25';
      const lineType = line.lineType || 'dashed';

      return {
        points: points.map(function mapPoint(point) {
          return [categoryData[point[0]], point[1]];
        }),
        color,
        lineWidth,
        lineType,
      };
    })
    .filter(Boolean);
}

function makeCandleMarkerSeries(markerData) {
  function resolveMarkerStyle(type) {
    if (type === KLineMarkerTypeEnum.SUPPORT) {
      return {
        line: '#d39a55',
        fill: '#fff6ea',
        text: '#8a5d25',
        lineWidth: 0.75,
        fontSize: 8,
      };
    }

    if (type === KLineMarkerTypeEnum.RESISTANCE) {
      return {
        line: '#7f9cc1',
        fill: '#eff4fb',
        text: '#506b8b',
        lineWidth: 0.75,
        fontSize: 8,
      };
    }

    if (type === KLineMarkerTypeEnum.KEY_INFO) {
      return {
        line: '#8a7f74',
        fill: '#f7f4ef',
        text: '#66605a',
        lineWidth: 0.65,
        fontSize: 7,
      };
    }

    return {
      line: '#8c897f',
      fill: '#faf8f3',
      text: '#6a6056',
      lineWidth: 0.75,
      fontSize: 8,
    };
  }

  return {
    name: 'K线标记',
    type: 'custom',
    coordinateSystem: 'cartesian2d',
    data: markerData,
    encode: { x: 0, y: [1, 2] },
    silent: true,
    clip: false,
    z: 12,
    renderItem(params, api) {
      const targetPoint = api.coord([api.value(0), api.value(1)]);
      const baseLabelPoint = api.coord([api.value(0), api.value(2)]);
      const label = api.value(3);
      const type = api.value(5);
      const markerLineWidth = api.value(6);
      const markerFontSize = api.value(7);
      const direction = api.value(8);
      const isUpDirection = direction === KLineMarkerDirectionEnum.UP || direction === KLineMarkerDirectionEnum.UP_LEFT;
      const isLeftDirection = direction === KLineMarkerDirectionEnum.UP_LEFT || direction === KLineMarkerDirectionEnum.DOWN_LEFT;
      const horizontalOffset = isLeftDirection ? -18 : 0;
      const verticalOffset = isUpDirection ? 16 : -16;
      const textOffset = isUpDirection ? 3 : -3;
      const markerStyle = resolveMarkerStyle(type);
      const lineWidth = Number.isFinite(Number(markerLineWidth)) ? Number(markerLineWidth) : markerStyle.lineWidth;
      const fontSize = Number.isFinite(Number(markerFontSize)) ? Number(markerFontSize) : markerStyle.fontSize;
      const labelPoint = [baseLabelPoint[0] + horizontalOffset, baseLabelPoint[1] + verticalOffset];

      return {
        type: 'group',
        children: [
          {
            type: 'line',
            shape: {
              x1: labelPoint[0],
              y1: labelPoint[1],
              x2: targetPoint[0],
              y2: targetPoint[1],
            },
            style: {
              stroke: markerStyle.line,
              lineWidth,
              opacity: 0.92,
            },
          },
          {
            type: 'circle',
            shape: {
              cx: targetPoint[0],
              cy: targetPoint[1],
              r: 1,
            },
            style: {
              fill: markerStyle.fill,
              stroke: markerStyle.line,
              lineWidth,
              opacity: 0.96,
            },
          },
          {
            type: 'text',
            style: {
              x: labelPoint[0],
              y: labelPoint[1] + textOffset,
              text: label,
              fill: markerStyle.text,
              font: `500 ${fontSize}px TsangerJinKai02, serif`,
              textAlign: isLeftDirection ? 'right' : 'center',
              textVerticalAlign: isUpDirection ? 'top' : 'bottom',
            },
          },
        ],
      };
    },
  };
}

function makePolylineSeries(polyLineData) {
  return polyLineData
    .map(function mapPolyline(line, index) {
      return {
        name: `折线${index + 1}`,
        type: 'line',
        data: line.points,
        xAxisIndex: 0,
        yAxisIndex: 0,
        showSymbol: false,
        symbol: 'none',
        smooth: false,
        silent: true,
        clip: true,
        z: 20,
        lineStyle: {
          color: line.color || '#1b365d',
          width: line.lineWidth || 1,
          type: line.lineType || 'solid',
          opacity: 0.9,
        },
        emphasis: {
          disabled: true,
        },
      };
    })
    .filter(Boolean);
}

export default function BaseKLineChart({ data = [], height = 360, className, markers = {} }) {
  const option = useMemo(
    function makeOption() {
      const dataset = splitKlineData(data);
      const normalizedMarkers = normalizeMarkerGroups(markers);
      const ma5Data = buildMovingAverageData(data, 5);
      const ma10Data = buildMovingAverageData(data, 10);
      const latestMa5 = getLatestFiniteValue(ma5Data);
      const latestMa10 = getLatestFiniteValue(ma10Data);
      const markerData = buildMarkerData(data, dataset.categoryData, [
        { type: KLineMarkerTypeEnum.SUPPORT, priority: KLineMarkerPriorityEnum.SUPPORT, markers: normalizedMarkers.supportMarkers },
        { type: KLineMarkerTypeEnum.RESISTANCE, priority: KLineMarkerPriorityEnum.RESISTANCE, markers: normalizedMarkers.resistanceMarkers },
        { type: KLineMarkerTypeEnum.KEY_INFO, priority: KLineMarkerPriorityEnum.KEY_INFO, markers: normalizedMarkers.keyInfoMarkers },
        { type: KLineMarkerTypeEnum.CANDLE, priority: KLineMarkerPriorityEnum.CANDLE, markers: normalizedMarkers.candleMarkers },
      ]);
      const polyLineData = buildPolylineData(data, dataset.categoryData, normalizedMarkers.polyLines);
      const hasPointMarkers = markerData.length > 0;
      const series = [
        {
          name: '价格',
          type: 'candlestick',
          data: dataset.values,
          z: 3,
          itemStyle: {
            color: '#ef4444',
            color0: '#22c55e',
            borderColor: '#ef4444',
            borderColor0: '#22c55e',
          },
        },
        {
          name: 'MA5',
          type: 'line',
          data: ma5Data,
          xAxisIndex: 0,
          yAxisIndex: 0,
          showSymbol: false,
          symbol: 'none',
          smooth: false,
          silent: true,
          clip: true,
          z: 4,
          lineStyle: {
            color: '#f59e0b',
            width: 1.25,
            opacity: 0.95,
          },
          emphasis: {
            disabled: true,
          },
        },
        {
          name: 'MA10',
          type: 'line',
          data: ma10Data,
          xAxisIndex: 0,
          yAxisIndex: 0,
          showSymbol: false,
          symbol: 'none',
          smooth: false,
          silent: true,
          clip: true,
          z: 4,
          lineStyle: {
            color: '#3b82f6',
            width: 1.25,
            opacity: 0.95,
          },
          emphasis: {
            disabled: true,
          },
        },
        {
          name: '成交量',
          type: 'bar',
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: dataset.volumes,
          barWidth: '60%',
        },
      ];

      if (polyLineData.length > 0) {
        series.push(...makePolylineSeries(polyLineData));
      }

      if (hasPointMarkers) {
        series.push(makeCandleMarkerSeries(markerData));
      }

      return {
        animation: false,
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'cross' },
          confine: true,
          borderWidth: 1,
          borderColor: '#e8e6dc',
          backgroundColor: '#faf9f5',
          textStyle: { color: '#141413', fontFamily: 'TsangerJinKai02, serif' },
          formatter(params) {
            const seriesItems = Array.isArray(params) ? params : [params];
            const klineItem = seriesItems.find(function findKLine(item) {
              return item.seriesType === 'candlestick';
            });
            if (!klineItem) {
              return '';
            }
            const raw = klineItem.data || {};
            const tooltipLines = [
              `日期：${raw.date ?? klineItem.axisValue ?? '--'}`,
              `开盘：${formatNumber(raw.open)}`,
              `收盘：${formatNumber(raw.close)}`,
              `最高：${formatNumber(raw.high)}`,
              `最低：${formatNumber(raw.low)}`,
              `成交量：${formatAmountToYi(raw.volume)}`,
              `成交额：${formatAmountToYi(raw.amount)}`,
              `振幅：${formatNumber(raw.amplitude)}%`,
              `最大跌幅：${formatNumber(raw.maxDrawdown)}%`,
              `涨跌幅：${formatNumber(raw.changePercent)}%`,
              `涨跌额：${formatNumber(raw.changeAmount)}`,
              `换手率：${formatNumber(raw.turnoverRate)}%`,
            ];

            if (raw.gapLabel && Number.isFinite(Number(raw.gapLow)) && Number.isFinite(Number(raw.gapHigh))) {
              tooltipLines.push(`跳空：${raw.gapLabel}（${formatNumber(raw.gapLow)} - ${formatNumber(raw.gapHigh)}）`);
            } else if (raw.gapLabel) {
              tooltipLines.push(`跳空：${raw.gapLabel}`);
            }

            return tooltipLines.join('<br/>');
          },
        },
        axisPointer: {
          link: [{ xAxisIndex: 'all' }],
          label: {
            backgroundColor: '#1B365D',
          },
        },
        grid: [
          { left: 38, right: 16, top: hasPointMarkers ? 34 : 18, height: hasPointMarkers ? 204 : 220 },
          { left: 38, right: 16, top: 252, height: 86 },
        ],
        xAxis: [
          {
            type: 'category',
            data: dataset.categoryData,
            boundaryGap: true,
            axisLine: { lineStyle: { color: '#e8e6dc' } },
            axisTick: { show: false },
            axisLabel: {
              show: false,
              // color: '#6b6a64',
              // fontFamily: 'JetBrains Mono, monospace',
              // formatter(value) {
              //   return formatDateWithoutYear(value)
              // },
            },
            splitLine: { show: false },
            min: 'dataMin',
            max: 'dataMax',
          },
          {
            type: 'category',
            gridIndex: 1,
            data: dataset.categoryData,
            boundaryGap: true,
            axisLine: { lineStyle: { color: '#e8e6dc' } },
            axisTick: { show: false },
            axisLabel: { show: false },
            splitLine: { show: false },
            min: 'dataMin',
            max: 'dataMax',
          },
        ],
        yAxis: [
          {
            scale: true,
            splitNumber: 4,
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { color: '#6b6a64', fontFamily: 'JetBrains Mono, monospace' },
            splitLine: { lineStyle: { color: '#e8e6dc' } },
          },
          {
            scale: true,
            gridIndex: 1,
            splitNumber: 2,
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { show: false },
            splitLine: { show: false },
          },
        ],
        dataZoom: [
          {
            type: 'inside',
            xAxisIndex: [0, 1],
            zoomOnMouseWheel: false,
            moveOnMouseWheel: false,
            moveOnMouseMove: false,
            preventDefaultMouseMove: true,
          },
        ],
        series,
      };
    },
    [data, markers],
  );

  return <BaseChart option={option} height={height} className={className} />;
}
