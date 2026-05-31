import { useMemo } from 'react'
import BaseChart from './BaseChart'

const PALETTE = ['#1B365D', '#2D5A8A', '#6b6a64', '#8b857a', '#d0dce9', '#e4ecf5']

export default function BasePieChart({ data = [], title = '占比结构', height = 320, className }) {
  const option = useMemo(
    function makeOption() {
      return {
        animation: false,
        color: PALETTE,
        title: {
          text: title,
          left: 'center',
          top: 4,
          textStyle: {
            color: '#3d3d3a',
            fontFamily: '"TsangerJinKai02", "Source Han Serif SC", serif',
            fontWeight: 500,
            fontSize: 14,
          },
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b}<br/>{c}% ({d}%)',
          borderWidth: 1,
          borderColor: '#e8e6dc',
          backgroundColor: '#faf9f5',
          textStyle: { color: '#141413' },
        },
        legend: {
          bottom: 0,
          textStyle: {
            color: '#6b6a64',
          },
        },
        series: [
          {
            name: '业务占比',
            type: 'pie',
            radius: ['42%', '70%'],
            center: ['50%', '52%'],
            avoidLabelOverlap: true,
            itemStyle: {
              borderRadius: 4,
              borderColor: '#f5f4ed',
              borderWidth: 2,
            },
            label: {
              color: '#504e49',
              formatter: '{b}\n{d}%',
              fontSize: 11,
            },
            labelLine: {
              lineStyle: { color: '#b9b8b2' },
            },
            data,
          },
        ],
      }
    },
    [data, title],
  )

  return <BaseChart option={option} height={height} className={className} />
}
