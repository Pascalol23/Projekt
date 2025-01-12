import { VegaLite } from "react-vega";
import { Box } from "@mui/material";

function LineChart({ spec }) {
  return <Box>{spec && <VegaLite spec={spec} />}</Box>;
}

export default LineChart;
