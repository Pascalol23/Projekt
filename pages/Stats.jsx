import {
  Box,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  Paper,
  TableRow,
  Typography,
} from "@mui/material";

export function Stats({ date, mean, einheit }) {
  return (
    <Box>
      {
        <TableContainer component={Paper}>
          <Typography
            variant="h5"
            component="h2"
            sx={{ padding: "16px", textAlign: "center" }}
          >
            Wetterstatistik
          </Typography>
          <Table aria-label="simple table">
            <TableBody>
              <TableRow>
                <TableCell align="left">
                  <b>{date}</b>
                </TableCell>
                <TableCell align="left">Durchschnitt:</TableCell>
                <TableCell align="left">
                  {mean} {einheit}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      }
    </Box>
  );
}
export default Stats;
