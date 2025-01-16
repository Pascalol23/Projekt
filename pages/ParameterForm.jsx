import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Button,
  Box,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useState } from "react";
import dayjs from "dayjs";
import axios from "axios";

function ParameterForm({ setChartSpec }) {
  const [parameter, setParameter] = useState("T");
  const [location, setLocation] = useState("Zch_Rosengartenstrasse");
  const [selectedDate, setSelectedDate] = useState(dayjs("2023-01-01"));

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "https://pro-lime-tau.vercel.app";

  const fetchData = async () => {
    try {
      const response = await axios.get(`${apiUrl}/get-linechart`, {
        params: {
          parameter,
          date: selectedDate.format("YYYY-MM-DD"),
          location,
        },
      });

      if (response.data) {
        setChartSpec(response.data); // Diagrammdaten setzen
      } else {
        console.error("Keine Daten zurückgegeben.");
      }
    } catch (error) {
      console.error("Fehler beim Abrufen der Daten:", error);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="parameter-label">Parameter</InputLabel>
          <Select
            labelId="parameter-label"
            value={parameter}
            onChange={(e) => setParameter(e.target.value)}
          >
            <MenuItem value="T">Temperatur</MenuItem>
            <MenuItem value="RainDur">Niederschlagsdauer</MenuItem>
            <MenuItem value="p">Luftdruck</MenuItem>
            <MenuItem value="T_max_h1">Maximale Temperatur</MenuItem>
            <MenuItem value="StrGlo">Globalstrahlung</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="location-label">Standort</InputLabel>
          <Select
            labelId="location-label"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <MenuItem value="Zch_Rosengartenstrasse">
              Zürich Rosengartenstrasse
            </MenuItem>
            <MenuItem value="Zch_Schimmelstrasse">
              Zürich Schimmelstrasse
            </MenuItem>
            <MenuItem value="Zch_Stampfenbachstrasse">
              Zürich Stampfenbachstrasse
            </MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <DatePicker
            label="Datum"
            minDate={dayjs("2023-01-01")}
            maxDate={dayjs("2023-12-31")}
            value={selectedDate}
            onChange={(newValue) => setSelectedDate(newValue)}
          />
        </Box>
        <Button variant="contained" onClick={fetchData}>
          Daten abrufen
        </Button>
      </Box>
    </LocalizationProvider>
  );
}

export default ParameterForm;
