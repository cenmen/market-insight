import { useEffect, useRef } from 'react';
import { dispose, init, registerOverlay } from 'klinecharts';

const SUPPORT_MARKER_OVERLAY_NAME = 'base-kline-chart-2-support-marker';
const SUPPORT_MARKER_GROUP_ID = 'base-kline-chart-2-support-marker-group';

let hasRegisteredSupportMarkerOverlay = false;

function ensureSupportMarkerOverlayRegistered() {
  if (hasRegisteredSupportMarkerOverlay) {
    return;
  }

  registerOverlay({
    name: SUPPORT_MARKER_OVERLAY_NAME,
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
      const lineLength = Number.isFinite(Number(marker.lineLength)) && Number(marker.lineLength) > 0 ? Number(marker.lineLength) : 1;
      const lineWidth = Number.isFinite(Number(marker.lineWidth)) && Number(marker.lineWidth) > 0 ? Number(marker.lineWidth) : 1;
      const fontSize = Number.isFinite(Number(marker.fontSize)) && Number(marker.fontSize) > 0 ? Number(marker.fontSize) : 10;
      const label = marker.label || '支撑位';
      const pointX = Math.round(point.x) + 0.5;
      const pointY = Math.round(point.y) + 0.5;
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
            color: '#d39a55',
            size: lineWidth,
            dashedValue: [2, 2],
          },
        },
        {
          type: 'circle',
          attrs: {
            x: pointX,
            y: pointY,
            r: 2,
          },
          styles: {
            style: 'stroke_fill',
            color: '#fff6ea',
            borderColor: '#d39a55',
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
            color: '#8a5d25',
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

  hasRegisteredSupportMarkerOverlay = true;
}

function parseDateToTimestamp(value) {
  if (typeof value !== 'string') {
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

function normalizeKLineData(data) {
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map(function mapItem(item) {
      return {
        timestamp: parseDateToTimestamp(item?.date),
        open: safeNumber(item?.open),
        high: safeNumber(item?.high),
        low: safeNumber(item?.low),
        close: safeNumber(item?.close),
        volume: safeNumber(item?.volume),
        turnover: safeNumber(item?.amount),
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
    precision = Math.max(
      precision,
      getDecimalLength(item?.open),
      getDecimalLength(item?.high),
      getDecimalLength(item?.low),
      getDecimalLength(item?.close),
    );
  });

  (Array.isArray(markers) ? markers : []).forEach(function eachMarker(marker) {
    precision = Math.max(precision, getDecimalLength(marker?.price));
  });

  return precision;
}

function resolveSupportMarkers(markers, supportMarkers) {
  if (Array.isArray(supportMarkers)) {
    return supportMarkers;
  }

  if (markers && typeof markers === 'object' && Array.isArray(markers.supportMarkers)) {
    return markers.supportMarkers;
  }

  return [];
}

function buildSupportMarkerOverlays(data, markers) {
  if (!Array.isArray(markers) || markers.length === 0) {
    return [];
  }

  const timestampMap = new Map();
  data.forEach(function eachItem(item) {
    if (typeof item?.date === 'string') {
      timestampMap.set(item.date, parseDateToTimestamp(item.date));
    }
  });

  return markers
    .map(function mapMarker(marker, index) {
      const timestamp = timestampMap.get(marker?.date);
      const value = safeNumber(marker?.price, NaN);
      if (!Number.isFinite(timestamp) || timestamp <= 0 || !Number.isFinite(value)) {
        return null;
      }

      return {
        name: SUPPORT_MARKER_OVERLAY_NAME,
        groupId: SUPPORT_MARKER_GROUP_ID,
        id: `${SUPPORT_MARKER_GROUP_ID}-${index}-${marker.date}`,
        lock: true,
        points: [{ timestamp, value }],
        extendData: {
          label: marker.label,
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
  if (!chart || typeof chart.setStyles !== 'function') {
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
  });
}

export default function BaseKLineChart2({ data = [], height = 360, className, markers = {}, supportMarkers, style }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const dataRef = useRef([]);

  useEffect(function initChart() {
    if (!containerRef.current) {
      return null;
    }

    containerRef.current.innerHTML = '';
    ensureSupportMarkerOverlayRegistered();

    const chart = init(containerRef.current);
    chartRef.current = chart;

    applyChartStyles(chart);

    if (chart && typeof chart.overrideYAxis === 'function') {
      chart.overrideYAxis({
        position: 'left',
      });
    }

    if (chart && typeof chart.setDataLoader === 'function') {
      chart.setDataLoader({
        getBars(params) {
          params.callback(dataRef.current, false);
        },
      });
    }

    if (chart && typeof chart.setPeriod === 'function') {
      chart.setPeriod({ type: 'day', span: 1 });
    }

    if (chart && typeof chart.createIndicator === 'function') {
      chart.createIndicator(
        {
          name: 'VOL',
          shortName: '',
          calcParams: [5, 10],
          styles: {
            tooltip: {
              showRule: 'none',
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
      if (typeof chart.removeOverlay === 'function') {
        chart.removeOverlay({ groupId: SUPPORT_MARKER_GROUP_ID });
      }

      const markerList = resolveSupportMarkers(markers, supportMarkers);
      dataRef.current = normalizedData;

      if (typeof chart.setSymbol === 'function') {
        chart.setSymbol({
          ticker: 'BASE_KLINE_CHART_2',
          pricePrecision: resolvePricePrecision(data, markerList),
          volumePrecision: 0,
        });
      } else if (typeof chart.resetData === 'function') {
        chart.resetData();
      }

      const overlays = buildSupportMarkerOverlays(data, markerList);
      if (overlays.length > 0 && typeof chart.createOverlay === 'function') {
        chart.createOverlay(overlays);
      }

      if (normalizedData.length > 0 && typeof chart.scrollToRealTime === 'function') {
        chart.scrollToRealTime();
      }
    },
    [data, markers, supportMarkers],
  );

  useEffect(function attachResize() {
    if (!containerRef.current) {
      return null;
    }

    const resizeObserver = new ResizeObserver(function onResize() {
      if (chartRef.current && typeof chartRef.current.resize === 'function') {
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
