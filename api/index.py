from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import json
from datetime import datetime
import os
import calendar
import altair as alt


app = FastAPI(docs_url="/docs", openapi_url="/openapi.json")


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://projektarbeitwid.vercel.app",
        "http://localhost:3000",               
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


data_file_path = os.path.join(os.path.dirname(__file__), "../src/meteodaten_2023_daily.json")


try:
    with open(data_file_path, "r") as f:
        weather_data = json.load(f)
except FileNotFoundError:
    raise RuntimeError(f"Die Datei 'meteodaten_2023_daily.json' wurde im Ordner 'src' nicht gefunden.")


@app.get("/api/py/stations")
def get_stations():
    stations = [{"key": entry["Standort"], "name": entry["Standortname"]} for entry in weather_data]
    unique_stations = {station["key"]: station for station in stations}.values()
    return JSONResponse(content=list(unique_stations))


@app.get("/api/py/data")
def get_data(date: str, station: str = Query(None)):
    try:
        
        print(f"Request received: date={date}, station={station}")

        
        timestamp = int(datetime.strptime(date, "%Y-%m-%d").timestamp()) * 1000
        print(f"Converted timestamp: {timestamp}")

        
        filtered_data = [
            {
                "Standortname": entry["Standortname"],
                "RainDur": entry["RainDur"],
                "T": entry["T"],
                "p": entry["p"]
            }
            for entry in weather_data
            if abs(entry["Datum"] - timestamp) < 86400000
            and (station is None or entry["Standort"].strip().lower() == station.strip().lower())
        ]

        
        unique_data = {
            f'{d["Standortname"]}-{d["RainDur"]}-{d["T"]}-{d["p"]}': d
            for d in filtered_data
        }.values()

        
        print(f"Filtered and deduplicated data: {list(unique_data)}")
        return JSONResponse(content=list(unique_data))

    except ValueError as e:
        return JSONResponse(content={"error": str(e)}, status_code=400)


@app.get("/api/py/monthly_charts")
def get_monthly_charts(month: int, year: int, station: str):
    try:
        _, last_day = calendar.monthrange(year, month)
        start_timestamp = int(datetime(year, month, 1).timestamp()) * 1000
        end_timestamp = int(datetime(year, month, last_day).timestamp()) * 1000

        monthly_data = [
            entry for entry in weather_data
            if start_timestamp <= entry["Datum"] <= end_timestamp and entry["Standort"] == station
        ]

        altair_data = [
            {
                "day": datetime.fromtimestamp(entry["Datum"] / 1000).day,
                "RainDur": entry["RainDur"],
                "Temperature": entry["T"],
                "Pressure": entry["p"]
            }
            for entry in monthly_data
        ]

        base = alt.Chart(alt.Data(values=altair_data)).encode(x="day:O")

        rain_chart = base.mark_line(color="blue").encode(
            y="RainDur:Q"
        ).properties(title="Regendauer über einen Monat pro Tag in Minuten")

        temp_chart = base.mark_line(color="red").encode(
            y="Temperature:Q"
        ).properties(title="Temperatur über einen Monat pro Tag in °C")

        pressure_chart = base.mark_line(color="green").encode(
            y="Pressure:Q"
        ).properties(title="Luftdruck über einen Monat pro Tag in hPa")

        charts = {
            "rain_chart": rain_chart.to_dict(),
            "temp_chart": temp_chart.to_dict(),
            "pressure_chart": pressure_chart.to_dict()
        }
        return JSONResponse(content=charts)

    except ValueError as e:
        return JSONResponse(content={"error": str(e)}, status_code=400)