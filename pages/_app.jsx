import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import "../App.css";
import { useState } from "react";
import { VegaViewer } from "./VegaViewer";
import { VegaForm } from "./VegaForm";
import Grid from "@mui/material/Grid2";

export default function App() {
  const [spec, setSpec] = useState({});
  const darkTheme = createTheme({
    palette: {
      mode: "dark",
    },
  });

  return (
    <>
      <div id="side">
        <ThemeProvider theme={darkTheme}>
          <CssBaseline />
          <div id="content">
            <Grid container spacing={2}>
              <Grid size={4}>
                <VegaForm setSpec={setSpec} />
              </Grid>
              <Grid size={8}>
                <VegaViewer spec={spec.vis} />
              </Grid>
            </Grid>
          </div>
        </ThemeProvider>
      </div>
    </>
  );
}
