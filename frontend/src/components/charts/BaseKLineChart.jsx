import { useMemo } from 'react'
import BaseChart from './BaseChart'

function splitKlineData(data) {
  const categoryData = []
  const values = []
  const volumes = []

  data.forEach(function eachItem(item) {
    categoryData.push(item.date)
    values.push([item.open, item.close, item.low, item.high])
    volumes.push([item.volume, item.open <= item.close ? 1 : -1])
  })

  return { categoryData, values, volumes }
}

export default function BaseKLineChart({ data = [], height = 360, className }) {
  const option = useMemo(
    function makeOption() {
      const dataset = splitKlineData(data)

      return {
        animation: false,
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'cross' },
          borderWidth: 1,
          borderColor: '#e8e6dc',
          backgroundColor: '#faf9f5',
          textStyle: { color: '#141413' },
        },
        axisPointer: {
          link: [{ xAxisIndex: 'all' }],
          label: {
            backgroundColor: '#1B365D',
          },
        },
        grid: [
          { left: 56, right: 16, top: 18, height: 220 },
          { left: 56, right: 16, top: 262, height: 70 },
        ],
        xAxis: [
          {
            type: 'category',
            data: dataset.categoryData,
            boundaryGap: false,
            axisLine: { lineStyle: { color: '#e8e6dc' } },
            axisTick: { show: false },
            axisLabel: { color: '#6b6a64', fontFamily: 'JetBrains Mono, monospace' },
            splitLine: { show: false },
            min: 'dataMin',
            max: 'dataMax',
          },
          {
            type: 'category',
            gridIndex: 1,
            data: dataset.categoryData,
            boundaryGap: false,
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
            axisLabel: { color: '#6b6a64', fontFamily: 'JetBrains Mono, monospace' },
            splitLine: { show: false },
          },
        ],
        dataZoom: [
          { type: 'inside', xAxisIndex: [0, 1], start: 0, end: 100 },
          {
            show: true,
            type: 'slider',
            xAxisIndex: [0, 1],
            top: 338,
            height: 16,
            borderColor: '#e8e6dc',
            backgroundColor: '#f5f4ed',
            fillerColor: '#d6e1ee',
            handleStyle: { color: '#1B365D' },
            textStyle: { color: '#6b6a64' },
          },
        ],
        series: [
          {
            name: '价格',
            type: 'candlestick',
            data: dataset.values,
            itemStyle: {
              color: '#1B365D',
              color0: '#6b6a64',
              borderColor: '#1B365D',
              borderColor0: '#6b6a64',
            },
          },
          {
            name: '成交量',
            type: 'bar',
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: dataset.volumes,
            itemStyle: {
              color(params) {
                return params.data[1] > 0 ? 'rgba(27, 54, 93, 0.45)' : 'rgba(107, 106, 100, 0.42)'
              },
            },
          },
        ],
      }
    },
    [data],
  )

  return <BaseChart option={option} height={height} className={className} />
}
