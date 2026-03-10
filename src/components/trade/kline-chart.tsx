"use client"

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react"
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  ColorType,
  CrosshairMode,
  type IChartApi,
  type ISeriesApi,
  type CandlestickSeriesOptions,
  type HistogramSeriesOptions,
  type Time,
} from "lightweight-charts"
import type { KlineData } from "@/types"

// ─── 暗色主题配置 ──────────────────────────────────────────────────────────────
const CHART_COLORS = {
  bg: "#0a0a0a",
  grid: "#1a1a1a",
  text: "#71717a",
  border: "#27272a",
  upColor: "#22c55e",
  downColor: "#ef4444",
  upWick: "#22c55e",
  downWick: "#ef4444",
  volumeUp: "rgba(34,197,94,0.25)",
  volumeDown: "rgba(239,68,68,0.25)",
  crosshair: "#52525b",
}

// ─── 组件暴露的操作接口 ────────────────────────────────────────────────────────
export interface KlineChartHandle {
  updateBar: (bar: KlineData) => void
}

interface KlineChartProps {
  symbol: string
  initialData: KlineData[]
  className?: string
}

export const KlineChart = forwardRef<KlineChartHandle, KlineChartProps>(
  function KlineChart({ initialData, className }, ref) {
    const containerRef = useRef<HTMLDivElement>(null)
    const chartRef = useRef<IChartApi | null>(null)
    const candleRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
    const volumeRef = useRef<ISeriesApi<"Histogram"> | null>(null)

    // ── 暴露 updateBar 给父组件 ──────────────────────────────────────────────────
    useImperativeHandle(ref, () => ({
      updateBar(bar: KlineData) {
        if (!candleRef.current || !volumeRef.current) return
        const t = bar.time as Time

        candleRef.current.update({
          time: t,
          open: bar.open,
          high: bar.high,
          low: bar.low,
          close: bar.close,
        })

        volumeRef.current.update({
          time: t,
          value: bar.volume,
          color: bar.close >= bar.open ? CHART_COLORS.volumeUp : CHART_COLORS.volumeDown,
        })
      },
    }))

    // ── 初始化图表（只执行一次）──────────────────────────────────────────────────
    useEffect(() => {
      if (!containerRef.current) return

      const chart = createChart(containerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: CHART_COLORS.bg },
          textColor: CHART_COLORS.text,
          fontSize: 11,
        },
        grid: {
          vertLines: { color: CHART_COLORS.grid },
          horzLines: { color: CHART_COLORS.grid },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
          vertLine: { color: CHART_COLORS.crosshair, style: 1 },
          horzLine: { color: CHART_COLORS.crosshair, style: 1 },
        },
        rightPriceScale: {
          borderColor: CHART_COLORS.border,
          scaleMargins: { top: 0.06, bottom: 0.28 },
        },
        timeScale: {
          borderColor: CHART_COLORS.border,
          timeVisible: true,
          secondsVisible: false,
          fixLeftEdge: false,
          fixRightEdge: false,
        },
        handleScroll: true,
        handleScale: true,
      })

      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: CHART_COLORS.upColor,
        downColor: CHART_COLORS.downColor,
        borderVisible: false,
        wickUpColor: CHART_COLORS.upWick,
        wickDownColor: CHART_COLORS.downWick,
      } as Partial<CandlestickSeriesOptions>)

      const volumeSeries = chart.addSeries(HistogramSeries, {
        priceFormat: { type: "volume" },
        priceScaleId: "volume",
      } as Partial<HistogramSeriesOptions>)

      chart.priceScale("volume").applyOptions({
        scaleMargins: { top: 0.75, bottom: 0 },
      })

      chartRef.current = chart
      candleRef.current = candleSeries
      volumeRef.current = volumeSeries

      // 响应容器大小变化
      const ro = new ResizeObserver(() => {
        if (!containerRef.current) return
        chart.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        })
      })
      ro.observe(containerRef.current)

      return () => {
        ro.disconnect()
        chart.remove()
        chartRef.current = null
        candleRef.current = null
        volumeRef.current = null
      }
    }, [])

    // ── 历史数据加载（initialData 变化时重新填充）──────────────────────────────
    useEffect(() => {
      if (!candleRef.current || !volumeRef.current || initialData.length === 0) return

      candleRef.current.setData(
        initialData.map((d) => ({
          time: d.time as Time,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
        }))
      )

      volumeRef.current.setData(
        initialData.map((d) => ({
          time: d.time as Time,
          value: d.volume,
          color: d.close >= d.open ? CHART_COLORS.volumeUp : CHART_COLORS.volumeDown,
        }))
      )

      chartRef.current?.timeScale().fitContent()
    }, [initialData])

    return (
      <div className={className}>
        <div ref={containerRef} className="h-full w-full" />
      </div>
    )
  }
)
