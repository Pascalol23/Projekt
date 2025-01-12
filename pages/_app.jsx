import { Box } from "@mui/material";
import ParameterForm from "./ParameterForm";
import LineChart from "./LineChart";
import { useState } from "react";

function App() {
  const [chartSpec, setChartSpec] = useState(null);

  return (
    <Box sx={{ p: 3 }}>
      <h1>Wetterapp</h1>
      <p>Wählen Sie einen Parameter aus</p>
      <ParameterForm setChartSpec={setChartSpec} />
      {chartSpec && <LineChart spec={chartSpec} />}
    </Box>
  );
}

export default App;
