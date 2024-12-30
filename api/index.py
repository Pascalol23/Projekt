from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import altair as alt

app = FastAPI()

allow_origins = [
    "https://pro-lime-tau.vercel.app",
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_headers=["*"],
    allow_methods=["*"],
)

def filter(parameter, date):
    data = pd.read_csv("./data/wetterdaten_combined.csv")

    data["Datum"] = pd.to_datetime(data["Datum"])
    data = data[data["Datum"] == date]

    if parameter == "Druck":
        data = data[data["Parameter"] == "p"]
    elif parameter == "Temperatur":
        data = data[data["Parameter"] == "T"]
    elif parameter == "MaxTemperatur":
        data = data[data["Parameter"] == "T_max_h1"]

    return data

def einheit(parameter):
    if parameter == "Temperatur" or parameter == "MaxTemperatur":
        return "°C"
    elif parameter == "Druck":
        return "hPa"

@app.get("/specs/")
async def get_spec(parameter: str, date: str):
    date = pd.to_datetime(date)
    filtered = filter(parameter, date)

    if filtered.empty:
        return JSONResponse(content={"error": "Keine Daten verfügbar."}, status_code=404)

    chart = alt.Chart(filtered).mark_line().encode(
        x=alt.X("Datum:T", title=None),
        y=alt.Y("Wert:Q", title=einheit(parameter)),
        color=alt.Color("Parameter:N", title="Parameter")
    ).properties(
        title=f"{parameter} am {date.strftime('%Y-%m-%d')}",
        width=600,
        height=400
    ).to_dict()

    mean = filtered["Wert"].mean().round(2)

    return JSONResponse(content={"mean": mean, "einheit": einheit(parameter), "vis": chart})
