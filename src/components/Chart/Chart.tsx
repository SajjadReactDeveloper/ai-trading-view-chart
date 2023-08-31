import {
  getColor,
  getFormattedDate,
  getVolumeDataWithColors,
} from "@/helper/common";
import { createChart, ColorType, LineStyle } from "lightweight-charts";
import moment from "moment-timezone";
import React, { useEffect, useRef } from "react";

export const Chart = ({
  data,
  volumeData,
  lineData,
  areaData,
  straightLine,
  title,
  isArray,
  straightLineName,
}: any) => {
  const chartContainerRef = useRef<any>();
  const chartTooltipRef = useRef<any>();

  useEffect(() => {
    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };

    //! Chart Creation
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "white" },
        textColor: "black",
      },
      width: chartContainerRef.current.clientWidth - 100,
      height: 500,
      crosshair: {
        vertLine: {
          labelVisible: false,
        },
      },
    });

    chart.timeScale().fitContent();

    //! CandleStick
    const candleStickSeries = chart.addCandlestickSeries({
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
      priceLineVisible: false,
    });
    candleStickSeries.setData(data);

    //! Volume Graph
    const volumeDataWithColors = getVolumeDataWithColors(volumeData, data);

    const volumeSeries = chart.addHistogramSeries({
      color: "#26a69a",
      priceFormat: {
        type: "volume",
      },
      priceScaleId: "",
      priceLineVisible: false,
    });
    volumeSeries.setData(volumeDataWithColors);

    //! Line Graph
    // if (lineData && lineData !== undefined && lineData !== null) {
    //   if (isArray) {
    //     lineData.forEach((subArray: any, index: any) => {
    //       const color = getColor(index);
    //       const trendLineSeries = chart.addLineSeries({
    //         color: color,
    //         lineWidth: 2,
    //         lineStyle: LineStyle.Dotted,
    //         priceLineVisible: false,
    //       });
    //       trendLineSeries.setData(subArray);
    //     });
    //   } else {
    //     const lineSeries = chart.addLineSeries({
    //       color: "#2962FF",
    //       lineWidth: 2,
    //       lineStyle: LineStyle.Solid,
    //       priceLineVisible: false,
    //     });
    //     lineSeries.setData(lineData);
    //   }
    // }

    //! Area Graph
    if (areaData && areaData !== undefined && areaData !== null) {
      if (isArray) {
        areaData.forEach((subArray: any, index: any) => {
          const color = getColor(index);
          const areaSeries = chart.addAreaSeries({
            topColor: color,
            bottomColor: "transparent",
            lineWidth: 2,
            lineColor: color,
            lineStyle: LineStyle.Dotted,
            priceLineVisible: false,
          });
          areaSeries.setData(subArray);
        });
      } else {
        const areaSeries = chart.addAreaSeries({
          topColor: "#FF5733",
          bottomColor: "transparent",
          lineColor: "red",
          lineWidth: 1,
        });
        areaSeries.setData(areaData);
      }
    }

    candleStickSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.1,
        bottom: 0.4,
      },
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.7,
        bottom: 0,
      },
    });

    //! Support Line
    if (straightLine && straightLine !== undefined && straightLine !== null) {
      if (typeof straightLine === "object") {
        straightLine.forEach((straightLine: any, index: any) => {
          const maxPriceLine: any = {
            price: straightLine.straightLine,
            color: getColor(index),
            lineWidth: 2,
            lineStyle: LineStyle.Dotted,
            axisLabelVisible: true,
            title: straightLine.name,
          };

          candleStickSeries.createPriceLine(maxPriceLine);
        });
      } else {
        const maxPriceLine: any = {
          price: straightLine,
          color: "black",
          lineWidth: 2,
          lineStyle: 2,
          axisLabelVisible: true,
          title: straightLineName,
        };

        candleStickSeries.createPriceLine(maxPriceLine);
      }
    }

    //! Tooltip Start
    const getTooltipUpdater = (toolTip: any, container: any, series: any) => {
      return (param: any) => {
        var toolTipWidth = 80;
        var toolTipHeight = 80;
        var toolTipMargin = 15;

        if (
          param.point === undefined ||
          !param.time ||
          param.point.x < 0 ||
          param.point.x > container.clientWidth ||
          param.point.y < 0 ||
          param.point.y > container.clientHeight
        ) {
          toolTip.style.display = "none";
        } else {
          const dateStr = getFormattedDate(param.time);
          toolTip.style.display = "block";
          toolTip.style.position = "absolute";
          toolTip.style.zIndex = 9999;
          toolTip.style.backgroundColor = "#fff";
          toolTip.style.border = "1px solid #000";
          toolTip.style.padding = "10px";
          var price1 = param.seriesData.get(series[0]);
          var price2 = param.seriesData.get(series[1]);

          toolTip.innerHTML =
            '<div style="color: #009688">' +
            title +
            '</div><div style="font-size: 14px; margin: 4px 0px; color: #21384d">' +
            price1.close +
            '</div><div style="color: #21384d">' +
            dateStr;
          ("</div>");

          const y = param.point.y;
          let left = param.point.x + toolTipMargin;
          if (left > container.clientWidth - toolTipWidth) {
            left = param.point.x - toolTipMargin - toolTipWidth;
          }

          let top = y + toolTipMargin + 50;
          if (top > container.clientHeight - toolTipHeight) {
            top = y - toolTipHeight - toolTipMargin;
          }
          toolTip.style.left = left + "px";
          toolTip.style.top = top + "px";
        }
      };
    };

    const tooltipElement = chartTooltipRef?.current;
    chart.subscribeCrosshairMove(
      getTooltipUpdater(tooltipElement, chartContainerRef.current, [
        candleStickSeries,
        volumeSeries,
      ])
    );
    //! Tooltip End

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);

      chart.remove();
    };
  }, [
    data,
    areaData,
    straightLine,
    volumeData,
    isArray,
    lineData,
    title,
    straightLineName,
  ]);

  return (
    <div>
      <div ref={chartContainerRef}></div>
      <div ref={chartTooltipRef} className="floating-tooltip-2" />
    </div>
  );
};
