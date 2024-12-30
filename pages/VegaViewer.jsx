import { VegaLite } from "react-vega";
import { Box } from "@mui/material";
export function VegaViewer({ spec }) {
  return (
    <Box>
      <div>{spec && <VegaLite spec={spec} />}</div>
    </Box>
  );
}
export default VegaViewer;
