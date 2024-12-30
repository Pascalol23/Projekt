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

export function VegaForm({ setSpec }) {
  const [parameter, setParameter] = useState("Temperatur");
  const [date, setDate] = useState(dayjs("2023-01-01"));

  useEffect(() => {
    axios
      .get(`http://localhost:8000/specs`, {
        params: {
          parameter: parameter,
          date: date.format("YYYY-MM-DD"),
        },
      })
      .then((response) => setSpec(response.data))
      .catch((error) => console.error("Error fetching spec content:", error));
  }, [parameter, date, setSpec]);

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
          <MenuItem value="Temperatur">Temperatur</MenuItem>
          <MenuItem value="Druck">Druck</MenuItem>
          <MenuItem value="MaxTemperatur">MaxTemperatur</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Datum"
            value={date}
            onChange={(newVal) => setDate(newVal)}
          />
        </LocalizationProvider>
      </FormControl>
      <Stats date={date.format("YYYY-MM-DD")} mean={0} einheit={"-"} />
    </Stack>
  );
}
export default VegaForm;
