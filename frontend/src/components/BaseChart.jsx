import { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { GridComponent, TooltipComponent, LegendComponent, DataZoomComponent, TitleComponent, GraphicComponent } from 'echarts/components';
import { CandlestickChart, BarChart, PieChart, LineChart, ScatterChart, CustomChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  TitleComponent,
  GraphicComponent,
  CandlestickChart,
  BarChart,
  PieChart,
  LineChart,
  ScatterChart,
  CustomChart,
  CanvasRenderer,
]);

export default function BaseChart({ option, height = 320, className, style, loading = false }) {
  const containerRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(function initChart() {
    if (!containerRef.current) {
      return null;
    }

    const instance = echarts.init(containerRef.current);
    instanceRef.current = instance;

    return function disposeChart() {
      instance.dispose();
      instanceRef.current = null;
    };
  }, []);

  useEffect(
    function updateOption() {
      if (!instanceRef.current) {
        return;
      }

      instanceRef.current.setOption(option, true);
    },
    [option],
  );

  useEffect(
    function toggleLoading() {
      if (!instanceRef.current) {
        return;
      }

      if (loading) {
        instanceRef.current.showLoading('default', {
          text: '加载中...',
          color: '#1B365D',
          textColor: '#6b6a64',
          maskColor: 'rgba(245, 244, 237, 0.65)',
        });
        return;
      }

      instanceRef.current.hideLoading();
    },
    [loading],
  );

  useEffect(function attachResize() {
    if (!containerRef.current || !instanceRef.current) {
      return null;
    }

    const resizeObserver = new ResizeObserver(function onResize() {
      if (instanceRef.current) {
        instanceRef.current.resize();
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
        ...style,
      }}
    />
  );
}
