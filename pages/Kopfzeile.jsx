import { Box, Typography } from "@mui/material";

export function Kopfzeile({ charts }) {
  return (
    <Box>
      <Typography variant="h3" gutterBottom>
        Wetter der Woche <br />
      </Typography>
    </Box>
  );
}
export default Kopfzeile;
