import { useState } from "react";
import ParameterForm from "./ParameterForm";
import LineChart from "./LineChart";
import Header from "./Header";

function App() {
  const [chartSpec, setChartSpec] = useState(null); // Zustand für das Diagramm

  return (
    <div>
      <Header />
      <ParameterForm setChartSpec={setChartSpec} />
      <LineChart spec={chartSpec} /> {/* Diagramm anzeigen */}
    </div>
  );
}

export default App;
