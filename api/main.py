from collections import defaultdict
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
import json
import os

data_file_path = os.path.join(os.getcwd(), "..", "src", "meteodaten_2023_daily.json")


app = FastAPI(docs_url="/docs", openapi_url="/openapi.json")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://pro-lime-tau.vercel.app/",
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    with open(data_file_path, "r") as f:
        weather_data = json.load(f)
except FileNotFoundError:
    raise RuntimeError(f"Die Datei 'meteodaten_2023_daily.json' wurde im Ordner 'src' nicht gefunden.")

@app.get("/api/py/data")
def get_data(date: str, station: str = Query(None)):
    try:
        timestamp = int(datetime.strptime(date, "%Y-%m-%d").timestamp()) * 1000
        daily_data = defaultdict(list)

        for entry in weather_data:
            if abs(entry["Datum"] - timestamp) < 86400000 and (station is None or entry["Station"].strip().lower() == station.strip().lower()):
                day = datetime.fromtimestamp(entry["Datum"] / 1000).date()
                daily_data[day].append(entry)

        aggregated_data = []
        for day, entries in daily_data.items():
            avg_rain_dur = sum(entry["RainDur"] for entry in entries) / len(entries)
            avg_temp = sum(entry["T"] for entry in entries) / len(entries)
            avg_pressure = sum(entry["p"] for entry in entries) / len(entries)
            aggregated_data.append({
                "Stationsname": entries[0]["Stationsname"],
                "Datum": str(day),
                "Durchschnittliche Regendauer": avg_rain_dur,
                "Durchschnittliche Temperatur": avg_temp,
                "Durchschnittlicher Luftdruck": avg_pressure
            })

        return JSONResponse(content=aggregated_data)
    except ValueError as e:
        return JSONResponse(content={"error": str(e)}, status_code=400)

@app.get("/api/py/getWeatherStations")
def fetchWeatherStations():
    stations = [{"key": entry["Station"], "name": entry["Stationsname"]} for entry in weather_data]
    unique_stations = {station["key"]: station for station in stations}.values()
    return JSONResponse(content=list(unique_stations))
