export type MarkerPosition = 'above' | 'below';

export interface TimelineTag {
  label: string;
  kind: 'bullish' | 'bearish' | 'neutral';
}

export interface TimelineItem {
  datetime: string;
  title: string;
  summary: string;
  source: string;
  statusTag?: TimelineTag;
  tags?: string[];
}

export interface RiskItem {
  title: string;
  description: string;
}

export interface MetricItem {
  label: '基金规模' | '盈利增速' | 'ROE' | '业务增速';
  value: string;
  note: string;
}

export interface BusinessRatioSubItem {
  type: string;
  rate: number;
}

export interface BusinessRatioItem {
  type: string;
  rate: number;
  desc: string;
  subItems?: BusinessRatioSubItem[];
}

export interface FactorItem {
  title: string;
  description: string;
}

export interface KLineItem {
  date: string;
  open: number;
  close: number;
  low: number;
  high: number;
  volume: number;
  amount: number;
  amplitude: number;
  maxDrawdown: number;
  changePercent: number;
  changeAmount: number;
  turnoverRate: number;
}

export interface CandleMarker {
  date: string;
  label: string;
  position: MarkerPosition;
  lineLength?: number;
  lineWidth?: number;
  fontSize?: number;
}

export interface PriceMarker {
  date: string;
  price: number;
  label: string;
  position: MarkerPosition;
  lineLength?: number;
  lineWidth?: number;
  fontSize?: number;
}

export interface PolyLinePoint {
  date: string;
  price: number;
}

export interface PolyLineMarker {
  points: PolyLinePoint[];
  lineWidth?: number;
  lineType?: 'solid' | 'dashed';
  color?: string;
}

export interface KLineMarkers {
  candleMarkers: CandleMarker[];
  supportMarkers: PriceMarker[];
  resistanceMarkers: PriceMarker[];
  keyInfoMarkers: CandleMarker[];
  polyLines: PolyLineMarker[];
}

export interface FinancialQuarterData {
  year: number;
  quarter: 1 | 2 | 3 | 4;
  roe: number;
  mainBusinessGrowthRate: number;
  netProfitMargin: number;
  grossProfitMargin: number;
  revenueGrowthRate: number;
  nonNetProfitGrowthRate: number;
}

export interface FinancialRow {
  code: string;
  name: string;
  weight: number;
  productTags: string[];
  intro: string;
  data: FinancialQuarterData[];
}

export interface EtfInfo {
  code: string;
  name: string;
  index: string;
  intro: string;
  concepts: string[];
  scale: string;
}

export interface EtfReport {
  date: string;
  author: string;
  headlineSignal: string;
  heatScore: number;
  coreJudgment: string;
  thesis: string;
  callout: string;
  chartCaption: unknown;
  hiddenStoryLine: string;
  timelineEvents?: TimelineItem[];
  disclaimer: string;
  risks: RiskItem[];
}

export interface EtfStaticDataReference {
  etf: EtfInfo;
  report: EtfReport;
  metrics: [MetricItem, MetricItem, MetricItem, MetricItem];
  recentFiveDayAmplitude: string;
  recentTenDayAmplitudeComment: string;
  recentTenDayMaxDrawdownComment: string;
  businessRatio: BusinessRatioItem[];
  shortTermFactors: FactorItem[];
  styleCharacteristics: FactorItem[];
  kLineData: KLineItem[];
  kLineMarkers: KLineMarkers;
  financialRows: FinancialRow[];
  viewpoints: TimelineItem[];
}
