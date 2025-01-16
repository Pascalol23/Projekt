import json
from datetime import datetime
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import altair as alt

app = FastAPI()

# CORS erlauben
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend-URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pfad zur Wetterdaten-JSON-Datei
file_path = "./data/meteodaten_2023_daily.json"

# Daten laden
def load_weather_data():
    try:
        with open(file_path, "r", encoding="utf-8") as jsonfile:
            return json.load(jsonfile)
    except FileNotFoundError:
        raise RuntimeError(f"Die Datei '{file_path}' wurde nicht gefunden.")

weather_data = load_weather_data()

# Funktion zum Erstellen des Liniendiagramms
async def create_linechart(parameter: str, start_date: str, end_date: str, location: str):
    try:
        data = []

        # Filtere die Wetterdaten
        for entry in weather_data:
            if entry["Standort"] == location and parameter in entry:
                datum = datetime.fromtimestamp(entry["Datum"] / 1000)
                if datetime.strptime(start_date, "%Y-%m-%d") <= datum <= datetime.strptime(end_date, "%Y-%m-%d"):
                    try:
                        wert = float(entry[parameter])  # Sicherstellen, dass der Parameter existiert
                        data.append({"Datum": datum.strftime("%Y-%m-%d"), "Wert": wert})
                    except (ValueError, KeyError):
                        continue  # Überspringe ungültige Werte

        # Keine Daten gefunden
        if not data:
            return JSONResponse(
                content={"error": "Keine Daten für diesen Filter gefunden."},
                status_code=404,
            )

        # Diagramm mit Altair erstellen
        chart = alt.Chart(alt.Data(values=data)).mark_line().encode(
            x=alt.X("Datum:T", title="Datum"),
            y=alt.Y("Wert:Q", title=f"{parameter} (Wert)"),
        ).properties(
            title=f"Liniendiagramm: {parameter} für {location}",
            width=600,
            height=400,
        )

        # Vega-Lite-Spezifikation zurückgeben
        return JSONResponse(content=chart.to_dict())

    except Exception as e:
        return JSONResponse(
            content={"error": f"Fehler bei der Verarbeitung: {str(e)}"},
            status_code=500,
        )

# API-Endpunkt für das Liniendiagramm
@app.get("/get-linechart")
async def get_linechart(
    parameter: str = Query(..., description="Parameter, z. B. T oder RainDur"),
    start_date: str = Query(..., description="Startdatum im Format YYYY-MM-DD"),
    end_date: str = Query(..., description="Enddatum im Format YYYY-MM-DD"),
    location: str = Query(..., description="Standort-Kürzel, z. B. Zch_Rosengartenstrasse"),
):
    return await create_linechart(parameter, start_date, end_date, location)
