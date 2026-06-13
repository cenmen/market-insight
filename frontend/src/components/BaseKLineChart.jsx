import { useEffect, useRef } from 'react';
import { isFunction, isPlainObject, isString } from 'es-toolkit';
import { dispose, init, registerOverlay } from 'klinecharts';

const POINT_MARKER_OVERLAY_NAME = 'base-kline-chart-2-point-marker';
const POINT_MARKER_GROUP_ID = 'base-kline-chart-2-point-marker-group';
const K_LINE_MARKER_TYPE_PRIORITY = {
  support: 1,
  resistance: 2,
  keyInfo: 3,
  event: 3.5,
  candle: 4,
};

let hasRegisteredPointMarkerOverlay = false;

function ensurePointMarkerOverlayRegistered() {
  if (hasRegisteredPointMarkerOverlay) {
    return;
  }

  registerOverlay({
    name: POINT_MARKER_OVERLAY_NAME,
    totalStep: 1,
    lock: true,
    visible: true,
    needDefaultPointFigure: false,
    needDefaultXAxisFigure: false,
    needDefaultYAxisFigure: false,
    createPointFigures(params) {
      const point = Array.isArray(params.coordinates) ? params.coordinates[0] : null;
      if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) {
        return [];
      }

      const marker = params.overlay?.extendData || {};
      const isAbove = marker.position === 'above';
      const markerStyle = resolveMarkerStyle(marker.type);
      const lineLength = Number.isFinite(Number(marker.lineLength)) && Number(marker.lineLength) > 0 ? Number(marker.lineLength) : 1;
      const lineWidth = Number.isFinite(Number(marker.lineWidth)) && Number(marker.lineWidth) > 0 ? Number(marker.lineWidth) : 1;
      const fontSize = Number.isFinite(Number(marker.fontSize)) && Number(marker.fontSize) > 0 ? Number(marker.fontSize) : 8;
      const label = marker.label || resolveDefaultMarkerLabel(marker.type);
      const pointX = Math.round(point.x);
      const pointY = Math.round(point.y);
      const verticalOffset = Math.round(18 * lineLength);
      const labelY = isAbove ? pointY - verticalOffset : pointY + verticalOffset;

      return [
        {
          type: 'line',
          attrs: {
            coordinates: [
              { x: pointX, y: pointY },
              { x: pointX, y: labelY },
            ],
          },
          styles: {
            style: 'solid',
            color: markerStyle.line,
            size: lineWidth,
            dashedValue: [2, 2],
          },
        },
        {
          type: 'circle',
          attrs: {
            x: pointX + 0.5,
            y: pointY,
            r: 2,
          },
          styles: {
            style: 'stroke_fill',
            color: markerStyle.fill,
            borderColor: markerStyle.line,
            borderSize: lineWidth,
            borderStyle: 'solid',
            borderDashedValue: [2, 2],
          },
        },
        {
          type: 'text',
          attrs: {
            x: pointX,
            y: labelY,
            text: label,
            align: 'center',
            baseline: isAbove ? 'bottom' : 'top',
          },
          styles: {
            style: 'fill',
            color: markerStyle.text,
            size: fontSize,
            family: 'TsangerJinKai02, serif',
            weight: 500,
            paddingLeft: 0,
            paddingTop: 0,
            paddingRight: 0,
            paddingBottom: 0,
            backgroundColor: 'transparent',
            borderStyle: 'solid',
            borderDashedValue: [2, 2],
            borderSize: 0,
            borderColor: 'transparent',
            borderRadius: 0,
          },
        },
      ];
    },
  });

  hasRegisteredPointMarkerOverlay = true;
}

function parseDateToTimestamp(value) {
  if (!isString(value)) {
    return 0;
  }

  const parts = value.split('-');
  if (parts.length !== 3) {
    return 0;
  }

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return 0;
  }

  return new Date(year, month - 1, day).getTime();
}

function safeNumber(value, defaultValue = 0) {
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return defaultValue;
  }
  return num;
}

function formatTooltipNumber(value, digits = 3) {
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return '--';
  }
  return num.toFixed(digits);
}

function formatTooltipAmountToYi(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return '--';
  }
  return `${(num / 100000000).toFixed(2)} 亿`;
}

function resolveTrendColor(value, fallback = '#6b6a64') {
  const num = Number(value);
  if (!Number.isFinite(num) || num === 0) {
    return fallback;
  }
  return num > 0 ? '#ef4444' : '#22c55e';
}

function normalizeKLineData(data) {
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map(function mapItem(item) {
      const open = safeNumber(item?.open);
      const high = safeNumber(item?.high);
      const low = safeNumber(item?.low);
      const amplitude = Number.isFinite(Number(item?.amplitude)) ? safeNumber(item?.amplitude) : open !== 0 ? ((high - low) / open) * 100 : NaN;

      return {
        timestamp: parseDateToTimestamp(item?.date),
        date: item?.date,
        open,
        high,
        low,
        close: safeNumber(item?.close),
        volume: safeNumber(item?.volume),
        turnover: safeNumber(item?.amount),
        amplitude,
        maxDrawdown: safeNumber(item?.maxDrawdown, NaN),
      };
    })
    .filter(function filterItem(item) {
      return item.timestamp > 0;
    });
}

function getDecimalLength(value) {
  const text = String(value ?? '').trim();
  if (!text.includes('.')) {
    return 0;
  }
  return text.split('.')[1]?.length ?? 0;
}

function resolvePricePrecision(data, markers) {
  let precision = 2;

  (Array.isArray(data) ? data : []).forEach(function eachItem(item) {
    precision = Math.max(precision, getDecimalLength(item?.open), getDecimalLength(item?.high), getDecimalLength(item?.low), getDecimalLength(item?.close));
  });

  (Array.isArray(markers) ? markers : []).forEach(function eachMarker(marker) {
    precision = Math.max(precision, getDecimalLength(marker?.price));
  });

  return precision;
}

function normalizeMarkerGroups(markers, supportMarkers) {
  if (Array.isArray(markers)) {
    return {
      candleMarkers: markers,
      eventMarkers: [],
      supportMarkers: Array.isArray(supportMarkers) ? supportMarkers : [],
      resistanceMarkers: [],
      keyInfoMarkers: [],
    };
  }

  if (!isPlainObject(markers)) {
    return {
      candleMarkers: [],
      eventMarkers: [],
      supportMarkers: Array.isArray(supportMarkers) ? supportMarkers : [],
      resistanceMarkers: [],
      keyInfoMarkers: [],
    };
  }

  return {
    candleMarkers: Array.isArray(markers.candleMarkers) ? markers.candleMarkers : [],
    eventMarkers: Array.isArray(markers.eventMarkers) ? markers.eventMarkers : [],
    supportMarkers: Array.isArray(supportMarkers) ? supportMarkers : Array.isArray(markers.supportMarkers) ? markers.supportMarkers : [],
    resistanceMarkers: Array.isArray(markers.resistanceMarkers) ? markers.resistanceMarkers : [],
    keyInfoMarkers: Array.isArray(markers.keyInfoMarkers) ? markers.keyInfoMarkers : [],
  };
}

function resolveDefaultMarkerLabel(type) {
  if (type === 'support') {
    return '支撑位';
  }

  if (type === 'resistance') {
    return '压力位';
  }

  if (type === 'keyInfo') {
    return '关键信息位';
  }

  if (type === 'event') {
    return '事件标记';
  }

  return 'K线标记';
}

function resolveMarkerStyle(type) {
  if (type === 'support') {
    return {
      line: '#d39a55',
      fill: '#fff6ea',
      text: '#8a5d25',
    };
  }

  if (type === 'resistance') {
    return {
      line: '#7f9cc1',
      fill: '#eff4fb',
      text: '#506b8b',
    };
  }

  if (type === 'keyInfo') {
    return {
      line: '#8a7f74',
      fill: '#f7f4ef',
      text: '#66605a',
    };
  }

  if (type === 'event') {
    return {
      line: '#5f7d5a',
      fill: '#eef6ec',
      text: '#4d6b49',
    };
  }

  return {
    line: '#8c897f',
    fill: '#faf8f3',
    text: '#6a6056',
  };
}

function buildPointMarkerOverlays(data, markerGroups) {
  const markerEntries = [];
  const dateMap = new Map();

  data.forEach(function eachItem(item) {
    if (isString(item?.date)) {
      dateMap.set(item.date, item);
    }
  });

  markerGroups.forEach(function eachGroup(group) {
    const markers = Array.isArray(group.markers) ? group.markers : [];

    markers.forEach(function eachMarker(marker, index) {
      const candle = dateMap.get(marker?.date);
      if (!candle) {
        return;
      }

      const position = marker.position === 'below' ? 'below' : 'above';
      const price = Number.isFinite(Number(marker?.price)) ? Number(marker.price) : position === 'below' ? Number(candle.low) : Number(candle.high);

      if (!Number.isFinite(price)) {
        return;
      }

      markerEntries.push({
        date: candle.date,
        timestamp: candle.timestamp,
        value: price,
        type: group.type,
        position,
        label: marker.label,
        lineLength: marker.lineLength,
        lineWidth: marker.lineWidth,
        fontSize: marker.fontSize,
        priority: group.priority,
        order: index,
      });
    });
  });

  markerEntries.sort(function sortMarker(left, right) {
    const leftTimestamp = Number(left.timestamp) || 0;
    const rightTimestamp = Number(right.timestamp) || 0;
    if (leftTimestamp !== rightTimestamp) {
      return leftTimestamp - rightTimestamp;
    }

    if (left.priority !== right.priority) {
      return left.priority - right.priority;
    }

    return left.order - right.order;
  });

  const seenDate = new Set();

  return markerEntries
    .filter(function filterMarker(marker) {
      if (seenDate.has(marker.date)) {
        return false;
      }

      seenDate.add(marker.date);
      return true;
    })
    .map(function mapMarker(marker, index) {
      return {
        name: POINT_MARKER_OVERLAY_NAME,
        groupId: POINT_MARKER_GROUP_ID,
        id: `${POINT_MARKER_GROUP_ID}-${index}-${marker.date}`,
        lock: true,
        points: [{ timestamp: marker.timestamp, value: marker.value }],
        extendData: {
          label: marker.label,
          type: marker.type,
          position: marker.position,
          lineLength: marker.lineLength,
          lineWidth: marker.lineWidth,
          fontSize: marker.fontSize,
        },
      };
    })
    .filter(Boolean);
}

function applyChartStyles(chart) {
  if (!chart || !isFunction(chart.setStyles)) {
    return;
  }

  chart.setStyles({
    grid: {
      horizontal: {
        color: '#e8e6dc',
      },
      vertical: {
        color: '#f0ede2',
      },
    },
    candle: {
      bar: {
        upColor: '#ef4444',
        downColor: '#22c55e',
        noChangeColor: '#a8a29e',
        upBorderColor: '#ef4444',
        downBorderColor: '#22c55e',
        noChangeBorderColor: '#a8a29e',
        upWickColor: '#ef4444',
        downWickColor: '#22c55e',
        noChangeWickColor: '#a8a29e',
      },
      priceMark: {
        last: {
          show: false,
        },
      },
      tooltip: {
        showRule: 'follow_cross',
        showType: 'rect',
        title: {
          template: '{time}',
        },
        legend: {
          template(data) {
            const current = data.current || {};
            const prev = data.prev || null;
            const prevClose = Number(prev?.close);
            const currentClose = Number(current.close);
            const changePercent =
              Number.isFinite(prevClose) && prevClose !== 0 && Number.isFinite(currentClose) ? ((currentClose - prevClose) / prevClose) * 100 : NaN;
            const amplitude = Number(current.amplitude);
            const maxDrawdown = Number(current.maxDrawdown);

            return [
              { title: '日期：', value: current.date || '--' },
              { title: '开盘：', value: formatTooltipNumber(current.open) },
              { title: '收盘：', value: formatTooltipNumber(current.close) },
              { title: '最高：', value: formatTooltipNumber(current.high) },
              { title: '最低：', value: formatTooltipNumber(current.low) },
              { title: '振幅：', value: Number.isFinite(amplitude) ? `${amplitude.toFixed(2)}%` : '--' },
              {
                title: '最大跌幅：',
                value: {
                  text: Number.isFinite(maxDrawdown) ? `${maxDrawdown.toFixed(2)}%` : '--',
                  color: resolveTrendColor(maxDrawdown),
                },
              },
              {
                title: '涨跌幅：',
                value: {
                  text: Number.isFinite(changePercent) ? `${changePercent.toFixed(2)}%` : '--',
                  color: resolveTrendColor(changePercent),
                },
              },
              { title: '成交量：', value: formatTooltipAmountToYi(current.volume) },
              { title: '成交额：', value: formatTooltipAmountToYi(current.turnover) },
            ];
          },
        },
      },
    },
    xAxis: {
      axisLine: {
        color: '#e8e6dc',
      },
      tickText: {
        color: '#6b6a64',
        family: 'JetBrains Mono, monospace',
        size: 10,
      },
    },
    yAxis: {
      axisLine: {
        color: '#e8e6dc',
      },
      tickText: {
        color: '#6b6a64',
        family: 'JetBrains Mono, monospace',
        size: 10,
      },
    },
    crosshair: {
      horizontal: {
        line: {
          color: '#1b365d',
        },
      },
      vertical: {
        line: {
          color: '#1b365d',
        },
      },
    },
    indicator: {
      tooltip: {
        showRule: 'none',
        title: {
          show: false,
          showName: false,
          showParams: false,
        },
      },
    },
  });
}

export default function BaseKLineChart({ data = [], height = 360, className, markers = {}, supportMarkers, style }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const dataRef = useRef([]);

  useEffect(function initChart() {
    if (!containerRef.current) {
      return null;
    }

    containerRef.current.innerHTML = '';
    ensurePointMarkerOverlayRegistered();

    const chart = init(containerRef.current, {
      layout: {
        basicParams: {
          yAxisPosition: 'left',
          yAxisInside: false,
        },
      },
    });
    chartRef.current = chart;

    applyChartStyles(chart);

    if (chart && isFunction(chart.setDataLoader)) {
      chart.setDataLoader({
        getBars(params) {
          params.callback(dataRef.current, false);
        },
      });
    }

    if (chart && isFunction(chart.setPeriod)) {
      chart.setPeriod({ type: 'day', span: 1 });
    }

    if (chart && isFunction(chart.setBarSpace)) {
      chart.setBarSpace(7);
    }

    if (chart && isFunction(chart.createIndicator)) {
      chart.createIndicator(
        {
          name: 'MA',
          shortName: '',
          calcParams: [5, 10],
          styles: {
            lines: [
              {
                color: '#6366f1',
                size: 0.75,
                style: 'solid',
                dashedValue: [],
                smooth: false,
              },
              {
                color: '#facc15',
                size: 0.75,
                style: 'solid',
                dashedValue: [],
                smooth: false,
              },
            ],
            tooltip: {
              showRule: 'none',
              title: {
                show: false,
                showName: false,
                showParams: false,
              },
            },
          },
        },
        {
          pane: {
            id: 'candle_pane',
          },
          isStack: true,
        },
      );

      chart.createIndicator(
        {
          name: 'VOL',
          shortName: '',
          calcParams: [5, 10],
          styles: {
            tooltip: {
              showRule: 'none',
              title: {
                show: false,
                showName: false,
                showParams: false,
              },
            },
          },
        },
        {
          pane: {
            id: 'base-kline-chart-2-volume-pane',
            height: 96,
            minHeight: 72,
          },
          yAxis: {
            position: 'left',
          },
        },
      );
    }

    return function disposeChart() {
      if (containerRef.current) {
        dispose(containerRef.current);
        containerRef.current.innerHTML = '';
      }
      chartRef.current = null;
    };
  }, []);

  useEffect(
    function syncDataAndMarkers() {
      const chart = chartRef.current;
      if (!chart) {
        return;
      }

      const normalizedData = normalizeKLineData(data);
      const normalizedMarkers = normalizeMarkerGroups(markers, supportMarkers);
      const markerList = [
        ...normalizedMarkers.candleMarkers,
        ...normalizedMarkers.eventMarkers,
        ...normalizedMarkers.supportMarkers,
        ...normalizedMarkers.resistanceMarkers,
        ...normalizedMarkers.keyInfoMarkers,
      ];

      if (isFunction(chart.removeOverlay)) {
        chart.removeOverlay({ groupId: POINT_MARKER_GROUP_ID });
      }

      dataRef.current = normalizedData;

      if (isFunction(chart.setSymbol)) {
        chart.setSymbol({
          ticker: 'BASE_KLINE_CHART_2',
          pricePrecision: resolvePricePrecision(data, markerList),
          volumePrecision: 0,
        });
      } else if (isFunction(chart.resetData)) {
        chart.resetData();
      }

      const overlays = buildPointMarkerOverlays(normalizedData, [
        { type: 'support', priority: K_LINE_MARKER_TYPE_PRIORITY.support, markers: normalizedMarkers.supportMarkers },
        { type: 'resistance', priority: K_LINE_MARKER_TYPE_PRIORITY.resistance, markers: normalizedMarkers.resistanceMarkers },
        { type: 'keyInfo', priority: K_LINE_MARKER_TYPE_PRIORITY.keyInfo, markers: normalizedMarkers.keyInfoMarkers },
        { type: 'event', priority: K_LINE_MARKER_TYPE_PRIORITY.event, markers: normalizedMarkers.eventMarkers },
        { type: 'candle', priority: K_LINE_MARKER_TYPE_PRIORITY.candle, markers: normalizedMarkers.candleMarkers },
      ]);
      if (overlays.length > 0 && isFunction(chart.createOverlay)) {
        chart.createOverlay(overlays);
      }

      if (isFunction(chart.setMaxOffsetLeftDistance)) {
        chart.setMaxOffsetLeftDistance(0);
      }

      // if (isFunction(chart.setMaxOffsetRightDistance)) {
      //   chart.setMaxOffsetRightDistance(0);
      // }

      if (isFunction(chart.setOffsetRightDistance)) {
        chart.setOffsetRightDistance(20);
      }

      // if (normalizedData.length > 0 && isFunction(chart.scrollToDataIndex)) {
      //   chart.scrollToDataIndex(normalizedData.length - 1);
      // }
    },
    [data, markers, supportMarkers],
  );

  useEffect(function attachResize() {
    if (!containerRef.current) {
      return null;
    }

    const resizeObserver = new ResizeObserver(function onResize() {
      if (chartRef.current && isFunction(chartRef.current.resize)) {
        chartRef.current.resize();
      }
    });

    resizeObserver.observe(containerRef.current);

    return function detachResize() {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        height,
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    />
  );
}
