from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import altair as alt

app = FastAPI()

allow_origins = [
    "https://pro-lime-tau.vercel.app",
    "http://localhost:3000",
    "https://pro-git-master-pascals-projects-7247a725.vercel.app",
    "https://pro-2eciu1m2u-pascals-projects-7247a725.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_headers=["*"],
    allow_methods=["*"],
)

def filter_data(parameter: str, date: pd.Timestamp, interval: str):
    try:
        data = pd.read_csv("./data/wetterdaten_combined.csv")
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="CSV-Datei 'wetterdaten_combined.csv' nicht gefunden.")
    
    try:
        data["Datum"] = pd.to_datetime(data["Datum"], errors="coerce")
    except Exception:
        raise HTTPException(status_code=400, detail="Fehler bei der Verarbeitung der Datumsspalte.")

    if data["Datum"].isnull().all():
        raise HTTPException(status_code=400, detail="Alle Datumswerte in der Datei sind ungültig.")

    end_date = date
    if interval == "jahr":
        end_date += pd.DateOffset(years=1)
    elif interval == "monat":
        end_date += pd.DateOffset(months=1)
    elif interval == "woche":
        end_date += pd.DateOffset(weeks=1)
    else:
        raise HTTPException(status_code=400, detail="Ungültiges Intervall. Erlaubt sind: 'jahr', 'monat', 'woche'.")

    filtered = data[(data["Datum"] >= date) & (data["Datum"] <= end_date)]
    filtered = filtered[filtered["Parameter"] == parameter]
    filtered = filtered[filtered["Standort"] == "Zch_Stampfenbachstrasse"]

    if filtered.empty:
        raise HTTPException(status_code=404, detail="Keine Daten für den angegebenen Zeitraum und Parameter gefunden.")
    
    return filtered

def get_unit(parameter: str):
    unit_map = {
        "T": "°C",
        "RainDur": "min",
        "StrGlo": "W/m2",
    }
    return unit_map.get(parameter, "Unbekannte Einheit")

@app.get("/specs/")
async def get_spec(parameter: str, date: str, year: str, interval: str):
    try:
        date = pd.to_datetime(date, errors="coerce")
        if pd.isnull(date):
            raise HTTPException(status_code=400, detail="Ungültiges Datumsformat.")
    except Exception:
        raise HTTPException(status_code=400, detail="Fehler bei der Datumskonvertierung.")

    try:
        date_before = date.replace(year=int(year))
    except Exception:
        raise HTTPException(status_code=400, detail="Ungültiges Jahr für Vergleich.")

    filtered = filter_data(parameter, date, interval)
    filtered["Legende"] = date.year

    filtered_before = filter_data(parameter, date_before, interval)
    filtered_before["Datum"] += pd.DateOffset(years=int(date.year) - int(year))
    filtered_before["Legende"] = year

    chart = alt.Chart(filtered).mark_line().encode(
        alt.X("Datum:T", axis=alt.Axis(format="%b %d"), title=None),
        alt.Y("Wert:Q", title=get_unit(parameter), axis=alt.Axis(titleFontSize=18)),
        alt.Color("Legende:N", scale=alt.Scale(scheme='viridis'))
    )

    chart_before = alt.Chart(filtered_before).mark_line().encode(
        alt.X("Datum:T", axis=alt.Axis(format="%b %d"), title=None),
        alt.Y("Wert:Q"),
        alt.Color("Legende:N", scale=alt.Scale(scheme='viridis'),
                  legend=alt.Legend(title="Jahr", labelFontSize=18, titleFontSize=18, orient='bottom'))
    ).properties(
        title=f'Wettervergleich {year} zu {date.year}',
        width=600,
        height=400,
    )

    mean = filtered['Wert'].mean().round(2)
    mean_before = filtered_before['Wert'].mean().round(2)

    chart_combined = alt.layer(chart, chart_before).configure_axis(
        grid=False
    ).configure_view(
        stroke=None,
    ).configure_title(
        fontSize=24,
    ).to_dict()

    return JSONResponse(content={"mean": mean, "meanBefore": mean_before, "einheit": get_unit(parameter), "vis": chart_combined}
    )