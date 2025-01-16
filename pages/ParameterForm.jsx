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
  const [startDate, setStartDate] = useState(dayjs("2023-01-01"));
  const [endDate, setEndDate] = useState(dayjs("2023-12-31"));

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "https://pro-lime-tau.vercel.app";

  const fetchData = async () => {
    try {
      const response = await axios.get(`${apiUrl}/get-linechart`, {
        params: {
          parameter,
          start_date: startDate.format("YYYY-MM-DD"),
          end_date: endDate.format("YYYY-MM-DD"),
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
            label="Startdatum"
            minDate={dayjs("2023-01-01")}
            maxDate={dayjs("2023-12-31")}
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
          />
          <DatePicker
            label="Enddatum"
            minDate={dayjs("2023-01-01")}
            maxDate={dayjs("2023-12-31")}
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
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
