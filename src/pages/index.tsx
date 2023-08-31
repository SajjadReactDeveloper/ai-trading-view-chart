import React, { useEffect, useState } from "react";
import axios from "axios";
import { Chart } from "@/components/Chart/Chart";
import {
  candleStickData,
  getArea,
  getQuestion,
  getSupportLines,
  getTrendData,
  getVolumeData,
  isArray,
  validate,
} from "@/helper/common";
import { getCoinsName } from "@/helper/apiCall";
import { toast } from "react-toastify";

export default function Index() {
  const [trxData, setTrxData] = useState<any>(null);
  const [ohlc, setOhlc] = useState<any>([]);
  const [volume, setVolume] = useState<any>([]);
  const [lineData, setLineData] = useState<any>([]);
  const [areaData, setAreaData] = useState<any>([]);
  const [straightLines, setStraightLines] = useState<any>([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isGraph, setIsGraph] = useState(false);
  const [allGraphs, setAllGraphs] = useState<any>([]);
  const [startDate, setStartDate] = useState("");
  const [coinName, setCoinName] = useState("");
  const [trendName, setTrendName] = useState("");
  const [coinNames, setCoinNames] = useState({});

  const resetData = () => {
    setAllGraphs([]);
    setAnswer("");
    setStraightLines([]);
    setAreaData([]);
    setLineData([]);
    setVolume([]);
    setOhlc([]);
    setTrxData(null);
  };

  const resetValues = () => {
    setCoinName("");
    setTrendName("");
    setStartDate("");
  };

  const getData = async () => {
    const newQuestion = getQuestion(coinName, trendName, startDate);
    resetData();
    try {
      if (question || newQuestion) {
        const response = await axios.post(
          `http://3.23.120.156:8086/trendidentifier?question=${
            newQuestion ? newQuestion : question
          }`
        );
        const data = response?.data;
        if (isArray(data)) {
          setAnswer("");
          setTrxData(data[0]);
          setAllGraphs(data);
        } else {
          setTrxData(null);
          setAnswer(data);
        }
        resetValues();
      }
      else {
        toast.error("Please Type Question");
      }
    } catch (error) {
      console.log("ERROR", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (validate(trxData)) {
        try {
          const ohlcData = await candleStickData(trxData);

          const volumeData = await getVolumeData(trxData);

          const trendData = await getTrendData(trxData, ohlcData, allGraphs);

          const supportLines = await getSupportLines(trxData, allGraphs);

          const area = await getArea(trxData, ohlcData, allGraphs);

          console.log("Candlestick Data: ", ohlcData);
          console.log("Volume Data: ", volumeData);
          console.log("Trend Line Data: ", trendData);
          console.log("Support Lines Data: ", supportLines);
          console.log("Area Data: ", area);

          setOhlc(ohlcData);
          setVolume(volumeData);
          setLineData(trendData);
          setAreaData(area);
          setStraightLines(supportLines);
        } catch (error) {
          console.error("Error fetching and processing data:", error);
        }
      } else {
        setIsGraph(false);
      }
    };

    if (trxData) {
      fetchData();
    }
  }, [trxData, allGraphs]);

  useEffect(() => {
    const getName = async () => {
      const coinNames = await getCoinsName();
      setCoinNames(coinNames);
    };
    getName();
  }, []);

  return (
    <div style={{ marginTop: 100 }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <label htmlFor="">Enter Question</label>
        <textarea
          onChange={(e) => setQuestion(e.target.value)}
          name="question"
          id="question"
          cols={30}
          rows={5}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 20,
        }}
      >
        <div>
          <label className="form-label" htmlFor="">
            Coin Name
          </label>
          <select
            value={coinName}
            name=""
            id=""
            className="form-select"
            onChange={(e) => setCoinName(e.target.value)}
          >
            <option value="">Select Coin</option>
            {Object.entries(coinNames).map(([coinName, coinSymbol]: any) => (
              <option key={coinSymbol} value={coinSymbol}>
                {coinName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label" htmlFor="">
            Trend Name
          </label>
          <select
            value={trendName}
            name=""
            id=""
            className="form-select"
            onChange={(e) => setTrendName(e.target.value)}
          >
            <option value="">Select Trend</option>
            <option value="Double Top">Double Top</option>
            <option value="Triangle">Triangle</option>
            <option value="Trp">TRP</option>
          </select>
        </div>

        <div>
          <label className="form-label" htmlFor="">
            Start Date
          </label>
          <input
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="form-control"
            type="date"
            name=""
            id=""
          />
        </div>
      </div>
      <br />
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "flex-end",
          alignSelf: "flex-end",
        }}
      >
        <button
          onClick={getData}
          style={{
            backgroundColor: "green",
            padding: 10,
            color: "white",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
          }}
        >
          Submit
        </button>
      </div>
      <br />
      <br />
      <h1>{trxData?.symbol ? trxData?.symbol : ""}</h1>

      {trxData?.graph ? (
        <Chart
          title={trxData.symbol}
          data={ohlc}
          volumeData={volume}
          lineData={lineData}
          areaData={areaData}
          isArray={Array.isArray(trxData.trend) || allGraphs?.length > 1}
          straightLine={
            Array.isArray(trxData.trend)
              ? straightLines
              : trxData?.trend?.lines[0]?.intercept
          }
          straightLineName={
            !Array.isArray(trxData.trend) && trxData?.trend?.lines[0]?.name
          }
        />
      ) : (
        <p>{answer}</p>
      )}
      {trxData?.text && <p>{trxData.text}</p>}
    </div>
  );
}
