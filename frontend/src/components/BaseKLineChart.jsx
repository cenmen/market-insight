import { useMemo } from 'react';
import BaseChart from './BaseChart';

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

    if (closes.length < period || closes.some(function hasInvalidValue(value) {
      return !Number.isFinite(value);
    })) {
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

function buildGapAreas(data) {
  const gaps = [];

  data.forEach(function eachItem(item, index) {
    if (index === 0) {
      return;
    }

    const previousItem = data[index - 1];
    const gapType = resolveGapType(previousItem, item);

    if (!gapType) {
      return;
    }

    const gapArea = {
      startDate: previousItem.date,
      endDate: item.date,
      top: gapType === 'up' ? Number(item.low) : Number(previousItem.low),
      bottom: gapType === 'up' ? Number(previousItem.high) : Number(item.high),
      label: gapType === 'up' ? '向上跳空缺口' : '向下跳空缺口',
      kind: gapType,
    };

    if (!Number.isFinite(gapArea.top) || !Number.isFinite(gapArea.bottom) || gapArea.top <= gapArea.bottom) {
      return;
    }

    gaps.push(gapArea);
  });

  return gaps.slice(-4);
}

function buildMaHeaderGraphic(latestMa5, latestMa10) {
  const children = [];
  let cursorX = 0;

  if (Number.isFinite(latestMa5)) {
    children.push({
      type: 'text',
      style: {
        x: cursorX,
        y: 0,
        text: `MA5: ${formatNumber(latestMa5)}`,
        fill: '#f59e0b',
        font: '500 11px JetBrains Mono, monospace',
      },
    });
    cursorX += 96;
  }

  if (Number.isFinite(latestMa10)) {
    children.push({
      type: 'text',
      style: {
        x: cursorX,
        y: 0,
        text: `MA10: ${formatNumber(latestMa10)}`,
        fill: '#3b82f6',
        font: '500 11px JetBrains Mono, monospace',
      },
    });
    cursorX += 108;
  }

  if (children.length === 0) {
    return null;
  }

  return {
    type: 'group',
    left: 56,
    top: 10,
    z: 30,
    silent: true,
    children,
  };
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
  const collisionBand = priceRange * 0.045;
  const maxShift = priceRange * 0.14;

  const markerEntries = markerGroups
    .flatMap(function mapGroup(group) {
      const markers = Array.isArray(group.markers) ? group.markers : [];

      return markers.map(function mapMarker(marker) {
        const dataIndex = resolveCandleMarkerIndex(marker, categoryData);
        const candle = data[dataIndex];

        if (!candle) {
          return null;
        }

        const position = marker.position === 'below' ? 'below' : 'above';
        const candleEdge = position === 'below' ? Number(candle.low) : Number(candle.high);
        const targetPrice = Number.isFinite(Number(marker.price)) ? Number(marker.price) : candleEdge;

        if (!Number.isFinite(targetPrice)) {
          return null;
        }

        const lineLength = Number.isFinite(Number(marker.lineLength)) && Number(marker.lineLength) > 0 ? Number(marker.lineLength) : 1;
        const labelPrice = position === 'below' ? targetPrice - markerGap * lineLength : targetPrice + markerGap * lineLength;
        const defaultLabel =
          group.kind === 'support'
            ? '支撑位'
            : group.kind === 'resistance'
              ? '压力位'
              : group.kind === 'keyInfo'
                ? '关键信息位'
                : '锤子线';
        const label = marker.label || defaultLabel;
        const lineWidth = Number.isFinite(Number(marker.lineWidth)) && Number(marker.lineWidth) > 0 ? Number(marker.lineWidth) : undefined;
        const fontSize = Number.isFinite(Number(marker.fontSize)) && Number(marker.fontSize) > 0 ? Number(marker.fontSize) : undefined;

        return {
          dataIndex,
          targetPrice,
          labelPrice,
          label,
          position,
          kind: group.kind,
          lineWidth,
          fontSize,
        };
      });
    })
    .filter(Boolean)
    .sort(function sortMarker(left, right) {
      if (left.position !== right.position) {
        return left.position === 'above' ? -1 : 1;
      }

      if (left.dataIndex !== right.dataIndex) {
        return left.dataIndex - right.dataIndex;
      }

      return left.labelPrice - right.labelPrice;
    });

  const placedMarkers = [];

  return markerEntries.map(function mapPlacedMarker(marker) {
    let shiftLevel = 0;

    for (const placedMarker of placedMarkers) {
      if (placedMarker.position !== marker.position) {
        continue;
      }

      if (Math.abs(placedMarker.dataIndex - marker.dataIndex) > 3) {
        continue;
      }

      if (Math.abs(placedMarker.labelPrice - marker.labelPrice) > collisionBand) {
        continue;
      }

      shiftLevel = Math.max(shiftLevel, placedMarker.shiftLevel + 1);
    }

    const shiftDistance = Math.min(shiftLevel * markerGap * 0.55, maxShift);
    const direction = marker.position === 'below' ? -1 : 1;
    const adjustedLabelPrice = marker.labelPrice + direction * shiftDistance;
    const placedMarker = {
      ...marker,
      labelPrice: adjustedLabelPrice,
      shiftLevel,
    };

    placedMarkers.push(placedMarker);
    return [
      placedMarker.dataIndex,
      placedMarker.targetPrice,
      placedMarker.labelPrice,
      placedMarker.label,
      placedMarker.position,
      placedMarker.kind,
      placedMarker.lineWidth,
      placedMarker.fontSize,
      placedMarker.shiftLevel,
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
      const color = line.color || ['#d39a55', '#7f9cc1', '#8a7f74', '#c7b28d'][index % 4];
      const lineType = line.lineType || 'solid';

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

function makeGapMarkAreas(gapAreas) {
  if (!Array.isArray(gapAreas) || gapAreas.length === 0) {
    return [];
  }

  return gapAreas.map(function mapGapArea(gapArea) {
    const isUpGap = gapArea.kind === 'up';
    const fillColor = isUpGap ? 'rgba(245, 158, 11, 0.10)' : 'rgba(59, 130, 246, 0.10)';
    const borderColor = isUpGap ? '#d39a55' : '#7f9cc1';
    const textColor = isUpGap ? '#8a5d25' : '#506b8b';

    return [
      {
        name: gapArea.label,
        xAxis: gapArea.startDate,
        yAxis: gapArea.bottom,
        itemStyle: {
          color: fillColor,
          borderColor,
          borderWidth: 1,
        },
        label: {
          show: true,
          position: 'insideTop',
          color: textColor,
          fontFamily: 'TsangerJinKai02, serif',
          fontSize: 9,
          formatter: gapArea.label,
        },
      },
      {
        xAxis: gapArea.endDate,
        yAxis: gapArea.top,
      },
    ];
  });
}

function makeCandleMarkerSeries(markerData) {
  function resolveMarkerStyle(kind) {
    if (kind === 'support') {
      return {
        line: '#d39a55',
        fill: '#fff6ea',
        text: '#8a5d25',
        lineWidth: 0.75,
        fontSize: 8,
      };
    }

    if (kind === 'resistance') {
      return {
        line: '#7f9cc1',
        fill: '#eff4fb',
        text: '#506b8b',
        lineWidth: 0.75,
        fontSize: 8,
      };
    }

    if (kind === 'keyInfo') {
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
      const position = api.value(4);
      const kind = api.value(5);
      const markerLineWidth = api.value(6);
      const markerFontSize = api.value(7);
      const shiftLevel = Number.isFinite(Number(api.value(8))) ? Number(api.value(8)) : 0;
      const isBelow = position === 'below';
      const lane = Math.ceil(shiftLevel / 2);
      const horizontalOffset = shiftLevel === 0 ? 0 : (shiftLevel % 2 === 1 ? -1 : 1) * lane * 14;
      const verticalOffset = (isBelow ? 1 : -1) * lane * 12;
      const textOffset = isBelow ? 3 : -3;
      const markerStyle = resolveMarkerStyle(kind);
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
              textAlign: horizontalOffset < 0 ? 'right' : horizontalOffset > 0 ? 'left' : 'center',
              textVerticalAlign: isBelow ? 'top' : 'bottom',
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
      const gapAreas = buildGapAreas(data);
      const ma5Data = buildMovingAverageData(data, 5);
      const ma10Data = buildMovingAverageData(data, 10);
      const latestMa5 = getLatestFiniteValue(ma5Data);
      const latestMa10 = getLatestFiniteValue(ma10Data);
      const maHeaderGraphic = buildMaHeaderGraphic(latestMa5, latestMa10);
      const markerData = buildMarkerData(data, dataset.categoryData, [
        { kind: 'candle', markers: normalizedMarkers.candleMarkers },
        { kind: 'support', markers: normalizedMarkers.supportMarkers },
        { kind: 'resistance', markers: normalizedMarkers.resistanceMarkers },
        { kind: 'keyInfo', markers: normalizedMarkers.keyInfoMarkers },
      ]);
      const polyLineData = buildPolylineData(data, dataset.categoryData, normalizedMarkers.polyLines);
      const gapMarkAreaData = makeGapMarkAreas(gapAreas);
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
          markArea: gapMarkAreaData.length > 0 ? { silent: true, data: gapMarkAreaData } : undefined,
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
        graphic: maHeaderGraphic || undefined,
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
            const ma5Item = seriesItems.find(function findMa5(item) {
              return item.seriesName === 'MA5';
            });
            const ma10Item = seriesItems.find(function findMa10(item) {
              return item.seriesName === 'MA10';
            });
            const ma5Value = Number.isFinite(Number(ma5Item?.data)) ? Number(ma5Item.data) : Number(ma5Item?.value);
            const ma10Value = Number.isFinite(Number(ma10Item?.data)) ? Number(ma10Item.data) : Number(ma10Item?.value);
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

            if (Number.isFinite(ma5Value)) {
              tooltipLines.push(`MA5：${formatNumber(ma5Value)}`);
            }

            if (Number.isFinite(ma10Value)) {
              tooltipLines.push(`MA10：${formatNumber(ma10Value)}`);
            }

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
          { left: 56, right: 16, top: hasPointMarkers ? 34 : 18, height: hasPointMarkers ? 204 : 220 },
          { left: 56, right: 16, top: 252, height: 86 },
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
