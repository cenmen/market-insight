import { useMemo } from 'react'
import BaseChart from './BaseChart'

function splitKlineData(data) {
  const categoryData = []
  const values = []
  const volumes = []

  data.forEach(function eachItem(item) {
    categoryData.push(item.date)
    values.push({
      value: [item.open, item.close, item.low, item.high],
      open: item.open,
      close: item.close,
      low: item.low,
      high: item.high,
      volume: item.volume,
      amount: item.amount,
      amplitude: item.amplitude,
      changePercent: item.changePercent,
      changeAmount: item.changeAmount,
      turnoverRate: item.turnoverRate,
      date: item.date,
    })
    volumes.push({
      value: item.volume ?? 0,
      itemStyle: {
        color: item.open <= item.close ? 'rgba(239, 68, 68, 0.35)' : 'rgba(34, 197, 94, 0.32)',
      },
    })
  })

  return { categoryData, values, volumes }
}

function formatNumber(value, digits = 2) {
  const num = Number(value)
  if (!Number.isFinite(num)) {
    return '--'
  }
  return num.toFixed(digits)
}

function formatAmountToYi(value) {
  const num = Number(value)
  if (!Number.isFinite(num)) {
    return '--'
  }
  return `${(num / 100000000).toFixed(2)} 亿`
}

function formatDateWithoutYear(value) {
  if (typeof value !== 'string') {
    return value
  }
  const parts = value.split('-')
  if (parts.length === 3) {
    return `${parts[1]}-${parts[2]}`
  }
  return value
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
          confine: true,
          borderWidth: 1,
          borderColor: '#e8e6dc',
          backgroundColor: '#faf9f5',
          textStyle: { color: '#141413' },
          formatter(params) {
            const seriesItems = Array.isArray(params) ? params : [params]
            const klineItem = seriesItems.find(function findKLine(item) {
              return item.seriesType === 'candlestick'
            })
            if (!klineItem) {
              return ''
            }
            const raw = klineItem.data || {}
            return [
              `日期：${raw.date ?? klineItem.axisValue ?? '--'}`,
              `开盘：${formatNumber(raw.open)}`,
              `收盘：${formatNumber(raw.close)}`,
              `最高：${formatNumber(raw.high)}`,
              `最低：${formatNumber(raw.low)}`,
              `成交量：${formatAmountToYi(raw.volume)}`,
              `成交额：${formatAmountToYi(raw.amount)}`,
              `振幅：${formatNumber(raw.amplitude)}%`,
              `涨跌幅：${formatNumber(raw.changePercent)}%`,
              `涨跌额：${formatNumber(raw.changeAmount)}`,
              `换手率：${formatNumber(raw.turnoverRate)}%`,
            ].join('<br/>')
          },
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
            boundaryGap: true,
            axisLine: { lineStyle: { color: '#e8e6dc' } },
            axisTick: { show: false },
            axisLabel: {
              color: '#6b6a64',
              fontFamily: 'JetBrains Mono, monospace',
              formatter(value) {
                return formatDateWithoutYear(value)
              },
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
        series: [
          {
            name: '价格',
            type: 'candlestick',
            data: dataset.values,
            itemStyle: {
              color: '#ef4444',
              color0: '#22c55e',
              borderColor: '#ef4444',
              borderColor0: '#22c55e',
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
        ],
      }
    },
    [data],
  )

  return <BaseChart option={option} height={height} className={className} />
}
