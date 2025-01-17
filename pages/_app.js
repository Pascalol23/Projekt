import React, { useState, useEffect } from "react";
import { Diagramm } from "./Diagramm";
import { Kopfzeile } from "./Kopfzeile";
import axios from "axios";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import {
  Container,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

const App = () => {
  const [date, setDate] = useState(dayjs("2023-01-01"));
  const [stations, setStations] = useState([]);
  const [station, setStation] = useState("Zch_Rosengartenstrasse");
  const [charts, setCharts] = useState(null);

  const backendUrl =
    process.env.REACT_APP_BACKEND_URL ||
    (typeof window !== "undefined" && window.location.hostname === "localhost"
      ? "http://127.0.0.1:8000"
      : "https://pro-lime-tau.vercel.app");

  useEffect(() => {
    const fetchStations = async () => {
      try {
        await axios
          .get(`${backendUrl}/api/py/getWeatherStations`)
          .then((response) => {
            setStations(response.data);
          });
      } catch (error) {
        console.error("Error fetching stations:", error);
        alert("Error fetching stations. Check the backend connection.");
      }
    };
    fetchStations();
  }, [backendUrl]);

  const handleFetchData = async () => {
    try {
      await axios
        .get(`${backendUrl}/api/py/data`, {
          params: {
            station: station,
            date: date.toISOString(),
          },
        })
        .then((response) => {
          setCharts(response.data);
        });
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Error fetching data. Please check the server.");
    }
  };

  return (
    <Container>
      <Kopfzeile />
      <FormControl fullWidth margin="normal">
        <InputLabel id="station-label">Wetterstationen</InputLabel>
        <Select
          labelId="station-label"
          value={station}
          onChange={(e) => setStation(e.target.value)}
        >
          {stations.map((station) => (
            <MenuItem key={station.key} value={station.key}>
              {station.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            minDate={dayjs("2023-01-01")}
            maxDate={dayjs("2023-12-23")}
            label="Bitte Datum in (2023-MM-DD) angeben"
            value={date}
            onChange={(e) => setDate(e)}
          />
        </LocalizationProvider>
      </FormControl>

      <Button
        variant="contained"
        fullWidth
        onClick={handleFetchData}
        style={{
          marginTop: "20px",
          marginBottom: "20px",
          backgroundColor: "#f44336",
          color: "white",
        }}
      >
        Diagramme anzeigen lassen
      </Button>
      {charts && <Diagramm charts={charts}></Diagramm>}
    </Container>
  );
};

export default App;
