import { VegaLite } from "react-vega";
import { Box, Typography } from "@mui/material";

function LineChart({ spec }) {
  return (
    <Box>
      {spec ? (
        <VegaLite spec={spec} />
      ) : (
        <Typography variant="h6" align="center">
          Kein Diagramm verfügbar. Bitte Daten abrufen.
        </Typography>
      )}
    </Box>
  );
}

export default LineChart;
