from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import csv
from datetime import datetime, timedelta
import altair as alt

app = FastAPI()

allow_origins = [
    "http://localhost:3000",
    "https://wettervergleich.vercel.app",
    "https://wettervergleich-git-main-jonasheinzs-projects.vercel.app/",
    "https://wettervergleich-jfglsmnhe-jonasheinzs-projects.vercel.app/"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def filter(parameter, date, interval):
    data = []
    with open("./data/wetterdaten_combined.csv", "r", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        for row in reader:
            row["Datum"] = datetime.strptime(row["Datum"], "%Y-%m-%d %H:%M:%S%z")
            row["Wert"] = float(row["Wert"])
            if row["Parameter"] == parameter and row["Standort"] == "Zch_Stampfenbachstrasse":
                data.append(row)

    endDate = date
    if interval == "jahr":
        endDate += timedelta(days=365)
    elif interval == "monat":
        endDate += timedelta(days=30)
    elif interval == "woche":
        endDate += timedelta(weeks=1)

    filtered_data = [row for row in data if date <= row["Datum"] <= endDate]
    return filtered_data

def einheit(parameter):
    if parameter == "T":
        return "°C"
    elif parameter == "RainDur":
        return "min"
    elif parameter == "StrGlo":
        return "W/m2"

@app.get("/specs/")
async def get_spec(parameter: str, date: str, year: int, interval: str):
    date = datetime.strptime(date, "%Y-%m-%d")
    dateBefore = date.replace(year=int(year))
    filtered = filter(parameter, date, interval)
    for row in filtered:
        row["Legende"] = date.year

    filteredBefore = filter(parameter, dateBefore, interval)
    for row in filteredBefore:
        row["Datum"] += timedelta(days=(date.year - int(year)) * 365)
        row["Legende"] = year

    chart = alt.Chart(filtered).mark_line().encode(
        alt.X("Datum:T", axis=alt.Axis(format="%b %d"), title=None),
        alt.Y("Wert:Q", title=einheit(parameter),
              axis=alt.Axis(titleFontSize=18)),
        alt.Color("Legende:N", scale=alt.Scale(scheme='viridis'))
    )
    chartBefore = alt.Chart(filteredBefore).mark_line().encode(
        alt.X("Datum:T", axis=alt.Axis(format="%b %d"), title=None),
        alt.Y("Wert:Q"),
        alt.Color("Legende:N", scale=alt.Scale(scheme='viridis'),
                  legend=alt.Legend(title="Jahr", labelFontSize=18, titleFontSize=18, orient='bottom'))
    ).properties(
        title=f'Wettervergleich {year} zu {date.year}',
        width=600,
        height=400,
    )

    mean = sum([row['Wert'] for row in filtered]) / len(filtered) if filtered else 0
    meanBefore = sum([row['Wert'] for row in filteredBefore]) / len(filteredBefore) if filteredBefore else 0
    chartCombined = alt.layer(chart, chartBefore).configure_axis(
        grid=False
    ).configure_view(
        stroke=None,
    ).configure_title(
        fontSize=24,
    ).to_dict()

    return JSONResponse(content={"mean": round(mean, 2), "meanBefore": round(meanBefore, 2), "einheit": einheit(parameter), "vis": chartCombined})
