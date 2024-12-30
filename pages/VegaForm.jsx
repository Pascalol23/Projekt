import {
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  Stack,
} from "@mui/material";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import { useState, useEffect } from "react";
import axios from "axios";
import { Stats } from "./Stats";

export function VegaForm({ setSpec, spec }) {
  const [parameter, setParameter] = useState("T");
  const [date, setDate] = useState(dayjs("2022-04-17"));
  const [year, setYear] = useState(2000);
  const [interval, setInterval] = useState("woche");

  const years = [];
  for (let i = parameter == "RainDur" ? 1999 : 1993; i <= 2023; i++) {
    years.push(i);
  }
  useEffect(() => {
    axios
      .get(`http://localhost:8000/specs`, {
        params: {
          parameter: parameter,
          date: date.format(),
          year: year,
          interval: interval,
        },
      })
      .then((response) => setSpec(response.data))
      .catch((error) => console.error("Error fetching spec content:", error));
  }, [parameter, date, year, interval, setSpec]);

  return (
    <Stack spacing={2} direction="column">
      <FormControl fullWidth>
        <InputLabel id="parameter-lbl">Parameter</InputLabel>
        <Select
          labelId="parameter-lbl"
          label="Parameter"
          value={parameter}
          onChange={(e) => setParameter(e.target.value)}
        >
          <MenuItem value="T">Temperatur</MenuItem>
          <MenuItem value="RainDur">Niederschlagsdauer</MenuItem>
          <MenuItem value="StrGlo">Globalstrahlung</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            minDate={
              parameter == "RainDur" ? dayjs("1999-06-25") : dayjs("1993-01-01")
            }
            maxDate={
              interval == "jahr" ? dayjs("2023-12-01") : dayjs("2024-11-01")
            }
            label="Start Datum"
            value={date}
            onChange={(newVal) => setDate(newVal)}
          />
        </LocalizationProvider>
      </FormControl>
      <FormControl fullWidth>
        <InputLabel id="jahr-lbl">Vergleich mit Jahr</InputLabel>
        <Select
          labelId="jahr-lbl"
          label="Jahr"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        >
          {years.map((i) => (
            <MenuItem key={i} value={i}>
              {i}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <InputLabel id="intervall-lbl">Intervall</InputLabel>
        <Select
          labelId="intervall-lbl"
          label="Intervall"
          value={interval}
          onChange={(e) => setInterval(e.target.value)}
        >
          <MenuItem value="woche">Woche</MenuItem>
          <MenuItem value="monat">Monat </MenuItem>
          <MenuItem value="jahr">Jahr</MenuItem>
        </Select>
      </FormControl>
      <Stats
        date={date}
        year={year}
        meanBefore={spec.meanBefore}
        mean={spec.mean}
        einheit={spec.einheit}
      />
    </Stack>
  );
}
export default VegaForm;
