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

  const backendUrl =
    process.env.REACT_APP_BACKEND_URL ||
    (typeof window !== "undefined" && window.location.hostname === "localhost"
      ? "http://127.0.0.1:8000"
      : "https://projektarbeitwid.vercel.app");

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
        `${backendUrl}/api/py/data?date=${date}&station=${station}`
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
              <TableCell>
                <strong>Regendauer [Minuten]</strong>
              </TableCell>
              <TableCell>
                <strong>Durchschnittliche Temperatur [°C]</strong>
              </TableCell>
              <TableCell>
                <strong>Luftdruck [hPa]</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data && data.length > 0 ? (
              data.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.Standortname}</TableCell>
                  <TableCell>{row.RainDur}</TableCell>
                  <TableCell>{row.T}</TableCell>
                  <TableCell>{row.p}</TableCell>
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
