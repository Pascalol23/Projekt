import { Vega } from "react-vega";
import { Box, Stack } from "@mui/material";

export function Diagramm({ charts }) {
  return (
    <Box>
      <Stack spacing={2}>
        <Vega spec={charts.RainDur_chart} />

        <Vega spec={charts.Temperatur_chart} />

        <Vega spec={charts.Luftdruck_chart} />
      </Stack>
    </Box>
  );
}
export default Diagramm;
