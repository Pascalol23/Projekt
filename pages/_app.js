import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { Vega } from "react-vega";
import axios from "axios";

const App = () => {
  const [date, setDate] = useState("");
  const [station, setStation] = useState("");
  const [stations, setStations] = useState([]);
  const [data, setData] = useState([]);
  const [charts, setCharts] = useState(null);
  const [parameter, setParameter] = useState("all"); // Neuer Zustand für Parameter

  const backendUrl =
    process.env.REACT_APP_BACKEND_URL ||
    (typeof window !== "undefined" && window.location.hostname === "localhost"
      ? "http://127.0.0.1:8000"
      : "https://pro-lime-tau.vercel.app/");

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/py/stations`);
        console.log("Fetched stations:", response.data);
        setStations(response.data);
      } catch (error) {
        console.error("Error fetching stations:", error);
      }
    };

    fetchStations();
  }, [backendUrl]);

  const handleFetchData = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/py/data?date=${date}&station=${station}&parameter=${parameter}`
      );
      setData([]);
      setData(response.data);

      const month = new Date(date).getMonth() + 1;
      const year = new Date(date).getFullYear();
      const chartsResponse = await axios.get(
        `${backendUrl}/api/py/monthly_charts?month=${month}&year=${year}&station=${station}`
      );
      setCharts(chartsResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Wetterdaten 2023 Zürich <br />
        Stationen: <br />
        -Rosengartenstrasse <br />
        -Schimmelstrasse
        <br />
        -Stampfenbachstrasse
      </Typography>
      <TextField
        label="Datum (YYYY-MM-DD)"
        variant="outlined"
        fullWidth
        margin="normal"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <FormControl fullWidth margin="normal">
        <InputLabel id="station-label">Wetterstation</InputLabel>
        <Select
          labelId="station-label"
          value={station}
          onChange={(e) => setStation(e.target.value)}
        >
          {stations.length > 0 ? (
            stations.map((station) => (
              <MenuItem key={station.key} value={station.key}>
                {station.name}
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>Keine Stationen verfügbar</MenuItem>
          )}
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal">
        <InputLabel id="parameter-label">Parameter</InputLabel>
        <Select
          labelId="parameter-label"
          value={parameter}
          onChange={(e) => setParameter(e.target.value)}
        >
          <MenuItem value="all">Alle</MenuItem>
          <MenuItem value="RainDur">Niederschlagsdauer</MenuItem>
          <MenuItem value="T">Temperatur</MenuItem>
          <MenuItem value="p">Luftdruck</MenuItem>
        </Select>
      </FormControl>

      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleFetchData}
        style={{ marginTop: "16px" }}
      >
        Daten abrufen
      </Button>

      <TableContainer component={Paper} style={{ marginTop: "20px" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Standortname</strong>
              </TableCell>
              {parameter === "all" || parameter === "RainDur" ? (
                <TableCell>
                  <strong>Regendauer [Minuten]</strong>
                </TableCell>
              ) : null}
              {parameter === "all" || parameter === "T" ? (
                <TableCell>
                  <strong>Durchschnittliche Temperatur [°C]</strong>
                </TableCell>
              ) : null}
              {parameter === "all" || parameter === "p" ? (
                <TableCell>
                  <strong>Luftdruck [hPa]</strong>
                </TableCell>
              ) : null}
            </TableRow>
          </TableHead>
          <TableBody>
            {data && data.length > 0 ? (
              data.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.Standortname}</TableCell>
                  {parameter === "all" || parameter === "RainDur" ? (
                    <TableCell>{row.RainDur}</TableCell>
                  ) : null}
                  {parameter === "all" || parameter === "T" ? (
                    <TableCell>{row.T}</TableCell>
                  ) : null}
                  {parameter === "all" || parameter === "p" ? (
                    <TableCell>{row.p}</TableCell>
                  ) : null}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Keine Daten verfügbar
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {charts && (
        <div style={{ marginTop: "40px", textAlign: "center" }}>
          <Typography variant="h5" gutterBottom>
            Visualisierungen
          </Typography>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div style={{ width: "80%", margin: "10px 0" }}>
              <Vega spec={charts.rain_chart} />
            </div>
            <div style={{ width: "80%", margin: "10px 0" }}>
              <Vega spec={charts.temp_chart} />
            </div>
            <div style={{ width: "80%", margin: "10px 0" }}>
              <Vega spec={charts.pressure_chart} />
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default App;
