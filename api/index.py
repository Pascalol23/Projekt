from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
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

    data = pd.read_csv("./data/wetterdaten_combined.csv")

    data["Datum"] = pd.to_datetime(data["Datum"])
    endDate = date
    if interval == "jahr":
        endDate += pd.DateOffset(years=1)
    elif interval == "monat":
        endDate += pd.DateOffset(months=1)
    elif interval == "woche":
        endDate += pd.DateOffset(weeks=1)

    data = data[data["Datum"] >= date]

    data = data[data["Datum"] <= endDate]

    data = data[data["Parameter"] == parameter]
    data = data[data["Standort"] == "Zch_Stampfenbachstrasse"]

    return data


def einheit(parameter):
    if parameter == "T":
        return "°C"
    elif parameter == "RainDur":
        return "min"
    elif parameter == "StrGlo":
        return "W/m2"


@app.get("/specs/")
async def get_spec(parameter, date, year, interval):
    date = pd.to_datetime(date)
    dateBefore = date.replace(year=int(year))
    filtered = filter(parameter, date, interval)
    filtered["Legende"] = date.year
    filteredBefore = filter(parameter, dateBefore, interval)
    filteredBefore["Datum"] += pd.DateOffset(years=int(date.year)-int(year))
    filteredBefore["Legende"] = year

    chart = alt.Chart(filtered).mark_line().encode(
        alt.X("Datum:T", axis=alt.Axis(format="%b %d"), title=None),
        alt.Y("Wert:Q", title=einheit(parameter),
              axis=alt.Axis(titleFontSize=18)), #so
        alt.Color("Legende:N",  scale=alt.Scale(scheme='viridis'))
    )
    chartBefore = alt.Chart(filteredBefore).mark_line().encode(
        alt.X("Datum:T", axis=alt.Axis(format="%b %d"), title=None),
        alt.Y("Wert:Q"),
        alt.Color("Legende:N",  scale=alt.Scale(scheme='viridis'),
                  legend=alt.Legend(title="Jahr", labelFontSize=18,  titleFontSize=18, orient='bottom',
                                    ))
    ).properties(
        title=f'Wettervergleich {year} zu {date.year}',
        width=600,
        height=400,
    )

    mean = filtered['Wert'].mean().round(2)
    meanBefore = filteredBefore['Wert'].mean().round(2)
    chartCombined = alt.layer(chart, chartBefore).configure_axis(
        grid=False
    ).configure_view(
        stroke=None,
    ).configure_title(
        fontSize=24,
    ).to_dict()

    return JSONResponse(content={"mean": mean, "meanBefore": meanBefore, "einheit": einheit(parameter), "vis": chartCombined})
