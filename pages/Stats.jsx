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
export function Stats({ date, year, meanBefore, mean, einheit }) {
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
                  <b>{date.year()}</b>
                </TableCell>
                <TableCell align="left">Durchschnitt:</TableCell>
                <TableCell align="left">
                  {mean} {einheit}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left">
                  <b>{year}</b>
                </TableCell>
                <TableCell align="left">Durchschnitt:</TableCell>
                <TableCell align="left">
                  {meanBefore} {einheit}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell />

                <TableCell align="left">
                  <b>Differenz:</b>
                </TableCell>
                <TableCell
                  align="left"
                  style={{
                    backgroundColor: mean - meanBefore > 0 ? "green" : "red",
                  }}
                >
                  <b>
                    {Math.round((mean - meanBefore) * 100) / 100} {einheit}
                  </b>
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
