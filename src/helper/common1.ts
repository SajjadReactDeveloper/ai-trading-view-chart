// Check if the given data is array or not
import axios from "axios";
import moment from "moment-timezone";

export const isArray = (array: any) => {
  if (Array.isArray(array)) {
    return true;
  } else {
    return false;
  }
};

// Check if the graph data is valid or not
export const validate = (trxData: any) => {
  if (
    trxData?.graph &&
    trxData?.graph?.index &&
    trxData?.graph?.timestamp &&
    trxData?.graph?.High &&
    trxData?.graph?.Low &&
    trxData?.graph?.Close &&
    trxData?.graph?.Volume &&
    trxData?.graph?.Open
  ) {
    return true;
  } else {
    return false;
  }
};

// Get Valid time
export const getValidTime = (time: any) => {
  return moment(time).utcOffset(0, true).unix();
};

// Create Question from user input
export const getQuestion = (
  coinName: string,
  trendName: string,
  startDate: string
) => {
  if (coinName !== "" && trendName !== "" && startDate !== "") {
    return `identify ${trendName} in ${coinName} in ${startDate}`;
  } else {
    return null;
  }
};

// Get Graph Data length
const getDataLength = (trxData: any) => {
  return trxData?.graph?.index?.length;
};

// Check if there are multiple Graphs
const isMultipleGraphs = (allGraphs: any) => {
  return allGraphs?.length > 1;
};

// Check if trend is present or not
export const isTrendPresent = (trend : any) => {
    return trend?.is_present;
}

export const candleStickData = (trxData: any) => {
  const ohlcData: any = [];
  const graph = trxData?.graph || {};

  for (let i = 0; i < getDataLength(trxData); i++) {
    const open = graph.Open?.[i] || 0;
    const high = graph.High?.[i] || 0;
    const low = graph.Low?.[i] || 0;
    const close = graph.Close?.[i] || 0;
    const timestamp = getValidTime(trxData?.graph?.timestamp[i]);
    ohlcData.push({
      time: timestamp,
      open: open,
      high: high,
      low: low,
      close: close,
    });
  }
  return ohlcData;
};

export const getVolumeData = (trxData: any) => {
  const volumeData = [];
  const graph = trxData?.graph || {};

  for (let i = 0; i < getDataLength(trxData); i++) {
    const timestamp = getValidTime(trxData?.graph?.timestamp[i]);
    const value = graph?.Volume[i];
    volumeData.push({ time: timestamp, value: value });
  }
  return volumeData;
};

export const getTrendData = (trxData: any, ohlcData: any, allGraphs: any) => {
  const allLinePoints: any = [];
  const linePoints = [];

  if (isMultipleGraphs(allGraphs)) {
    allGraphs.forEach((trend: any) => {
      if (isTrendPresent(trend?.trend)) {
        const leftIndex = trend?.trend?.ordered_pair?.left;
        const rightIndex = trend?.trend?.ordered_pair?.right;

        const linePoints = [];

        for (let i = leftIndex; i <= rightIndex; i++) {
          const time = ohlcData[i]?.time;
          const close = ohlcData[i]?.close;
          linePoints.push({ time, value: close });
        }

        allLinePoints.push(linePoints);
      }
    });
    return allLinePoints;
  } else {
    if (isArray(trxData?.trend)) {
      trxData?.trend.forEach((trend: any) => {
        if (isTrendPresent(trend)) {
          const leftIndex = trend?.ordered_pair?.left;
          const rightIndex = trend?.ordered_pair?.right;

          const linePoints = [];

          for (let i = leftIndex; i <= rightIndex; i++) {
            const time = ohlcData[i]?.time;
            const close = ohlcData[i]?.close;
            linePoints.push({ time, value: close });
          }

          allLinePoints.push(linePoints);
        }
        return allLinePoints;
      });
    } else {
      const leftIndex = trxData?.trend?.ordered_pair?.left;
      const rightIndex = trxData?.trend?.ordered_pair?.right;

      for (let i = leftIndex; i <= rightIndex; i++) {
        const time = ohlcData[i]?.time;
        const close = ohlcData[i]?.close;
        linePoints.push({ time, value: close });
      }
      return linePoints;
    }
  }
};

export const getSupportLines = (trxData: any, allGraphs: any) => {
  const allStraightLines: any = [];

    if (isMultipleGraphs(allGraphs)) {
      allGraphs.forEach((trend: any) => {
        if (isTrendPresent(trend?.trend)) {
          const straightLine = trend?.trend?.lines[0]?.intercept;
          const name = trend?.trend?.lines[0]?.name;
          allStraightLines.push({ straightLine, name });
        }
      });
      return allStraightLines;
    } else {
      if (isArray(trxData?.trend)) {
        trxData?.trend.forEach((trend: any) => {
          if (isTrendPresent(trend)) {
            const straightLine = trend?.lines[0]?.intercept;
            const name = trend?.lines[0]?.name;
            allStraightLines.push({ straightLine, name });
          }
        });
        return allStraightLines;
      }
    }
};

export const getArea = (trxData: any, ohlcData: any, allGraphs: any) => {
  const allAreaPoints: any = [];

  if (isMultipleGraphs(allGraphs)) {
    allGraphs.forEach((trend: any) => {
      if (isTrendPresent(trend?.trend)) {
        const leftIndex = trend?.trend?.ordered_pair?.left;
        const rightIndex = trend?.trend?.ordered_pair?.right;

        const areaPoints = [];

        for (let i = leftIndex; i <= rightIndex; i++) {
          const time = ohlcData[i]?.time;
          const close = ohlcData[i]?.close;
          areaPoints.push({ time, value: close });
        }
        allAreaPoints.push(areaPoints);
      }
    });
    return allAreaPoints;
  } else {
    if (isArray(trxData?.trend)) {
      trxData?.trend.forEach((trend: any) => {
        if (isTrendPresent(trend)) {
          const leftIndex = trend?.ordered_pair?.left;
          const rightIndex = trend?.ordered_pair?.right;

          const areaPoints = [];

          for (let i = leftIndex; i <= rightIndex; i++) {
            const time = ohlcData[i]?.time;
            const close = ohlcData[i]?.close;
            areaPoints.push({ time, value: close });
          }
          allAreaPoints.push(areaPoints);
        }
      });
      return allAreaPoints;
    } else {
      const leftIndex = trxData?.trend?.ordered_pair?.left;
      const rightIndex = trxData?.trend?.ordered_pair?.right;
      for (let i = leftIndex; i <= rightIndex; i++) {
        const time = ohlcData[i]?.time;
        const close = ohlcData[i]?.close;
        allAreaPoints.push({ time: time, value: close });
      }
      return allAreaPoints;
    }
  }
};
