import React, { useState, useEffect } from "react";
import { Vega } from "react-vega";
import axios from "axios";
import {
  Container,
  Button,
  Select,
  Typography,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

const App = () => {
  const [date, setDate] = useState("");
  const [data, setData] = useState([]);
  const [stations, setStations] = useState([]);
  const [station, setStation] = useState("");
  const [parameter, setParameter] = useState("all");
  const [charts, setCharts] = useState(null);

  const backendUrl =
    process.env.REACT_APP_BACKEND_URL ||
    (typeof window !== "undefined" && window.location.hostname === "localhost"
      ? "http://127.0.0.1:8000"
      : "https://pro-lime-tau.vercel.app");

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/py/getWeatherStations`
        );
        setStations(response.data);
      } catch (error) {
        console.error("Error fetching stations:", error);
        alert("Error fetching stations. Check the backend connection.");
      }
    };
    fetchStations();
  }, [backendUrl]);

  const handleFetchData = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/py/data?date=${date}&station=${station}&parameter=${parameter}`
      );
      setData(response.data);

      const chartsResponse = await axios.get(
        `${backendUrl}/api/py/data?date=${date}&station=${station}`
      );
      setCharts(chartsResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Error fetching data. Please check the server.");
    }
  };

  return (
    <Container>
      <Typography variant="h5" gutterBottom>
        Abfrage Wetterdaten Zürich 2023 <br />
        Stationen: <br />
        <ul>
          <li>Schimmelstrasse</li>
          <li>Stampfenbachstrasse</li>
          <li>Rosengartenstrasse</li>
        </ul>
      </Typography>
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

      <TextField
        label="Bitte Datum in (2023-MM-DD) angeben"
        variant="outlined"
        fullWidth
        margin="normal"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <FormControl fullWidth margin="normal">
        <InputLabel id="parameter-label">Parameter</InputLabel>
        <Select
          labelId="parameter-label"
          value={parameter}
          onChange={(e) => setParameter(e.target.value)}
        >
          <MenuItem value="RainDur">Temperatur</MenuItem>
          <MenuItem value="T">Luftdruck</MenuItem>
          <MenuItem value="p">Niederschlagsdauer</MenuItem>
        </Select>
      </FormControl>

      <Button
        variant="contained"
        fullWidth
        onClick={handleFetchData}
        style={{
          marginTop: "20px",
          backgroundColor: "#f44336",
          color: "white",
        }}
      >
        Diagramme anzeigen lassen
      </Button>

      {charts && (
        <div style={{ marginTop: "50px", textAlign: "center" }}>
          <Typography variant="h5" gutterBottom>
            Diagramme:
          </Typography>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div style={{ width: "80%", margin: "12px 0" }}>
              <Vega spec={charts.rain_chart} />
            </div>
            <div style={{ width: "80%", margin: "12px 0" }}>
              <Vega spec={charts.temp_chart} />
            </div>
            <div style={{ width: "80%", margin: "12px 0" }}>
              <Vega spec={charts.pressure_chart} />
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default App;
