from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
import json
import altair as alt


data_file_path = "./data/meteodaten_2023_daily.json"

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


def getData():
    with open(data_file_path, "r") as f:
        weather_data = json.load(f)
    return weather_data


@app.get("/api/py/data")
async def get_data(date, station):
    weather_data = getData()
    start_date = datetime.strptime(date, '%Y-%m-%dT%H:%M:%S.%fZ')
    end_date = start_date + timedelta(weeks=1)
    data = []
    for row in weather_data:
        row_date = datetime.fromtimestamp(
            row["Datum"] / 1000)
        if (
            start_date <= row_date <= end_date
            and row["Standort"] == station and row["RainDur"] and row["T"] and row["p"]
        ):
            data.append({
                "Datum": row_date.isoformat(),
                "RainDur": float(row["RainDur"]),
                "T": float(row["T"]),
                "p": float(row["p"]),
            })

    rain_chart = alt.Chart(alt.Data(values=data)).mark_line().encode(
        alt.X("Datum:T", axis=alt.Axis(format="%b %d"), title=None),
        alt.Y("RainDur:Q", title="min")
    ).properties(title='Regendauer')

    temp_chart = alt.Chart(alt.Data(values=data)).mark_line().encode(
        alt.X("Datum:T", axis=alt.Axis(format="%b %d"), title=None),
        alt.Y("T:Q", title="°C")
    ).properties(title='Temperatur')

    pressure_chart = alt.Chart(alt.Data(values=data)).mark_line().encode(
        alt.X("Datum:T", axis=alt.Axis(format="%b %d"), title=None),
        alt.Y("p:Q", title="hPa")
    ).properties(title='Luftdruck')

    rain_chart_json = rain_chart.to_dict()
    temp_chart_json = temp_chart.to_dict()
    pressure_chart_json = pressure_chart.to_dict()

    return JSONResponse(content={
        "RainDur_chart": rain_chart_json,
        "Temperatur_chart": temp_chart_json,
        "Luftdruck_chart": pressure_chart_json
    })


@app.get("/api/py/getWeatherStations")
async def fetchWeatherStations():
    weather_data = getData()
    stations = [{"key": entry["Standort"], "name": entry["Standortname"]}
                for entry in weather_data]
    unique_stations = {station["key"]: station for station in stations}.values()
    return JSONResponse(content=list(unique_stations))
