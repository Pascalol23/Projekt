import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import Header from "./Header"; // Header importieren

function App() {
  const [parameter, setParameter] = useState(""); // State für das ausgewählte Dropdown
  const [parameters, setParameters] = useState([]); // State für die Parameter aus der API

  // API-Aufruf, um die Parameter zu bekommen
  useEffect(() => {
    fetch("http://localhost:8000/get-parameter")
      .then((response) => response.json())
      .then((data) => {
        setParameters(data.parameters); // Parameter aus API setzen
      });
  }, []);

  const handleChange = (event) => {
    setParameter(event.target.value); // Aktualisiert den ausgewählten Parameter
  };

  return (
    <Box sx={{ p: 3 }}>
      <Header />
      <Typography variant="h4" sx={{ mb: 2 }}>
        Wählen Sie einen Parameter aus
      </Typography>
      <FormControl fullWidth>
        <InputLabel id="parameter-label">Parameter</InputLabel>
        <Select
          labelId="parameter-label"
          value={parameter}
          onChange={handleChange}
          label="Parameter"
        >
          {/* Dropdown mit den aus der API abgerufenen Parametern */}
          {parameters.map((param) => (
            <MenuItem key={param} value={param}>
              {param}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Anzeige des ausgewählten Parameters */}
      <Typography variant="h6" sx={{ mt: 2 }}>
        Ausgewählter Parameter: {parameter}
      </Typography>
    </Box>
  );
}

export default App;
