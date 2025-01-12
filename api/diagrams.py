import csv
from datetime import datetime
from fastapi.responses import JSONResponse
import altair as alt

file_path = "./data/wetterdaten_combined.csv"

async def create_linechart(parameter: str, start_date: str, end_date: str, location: str):
    try:
        data = []
        with open(file_path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile, delimiter=';')
            for row in reader:
                if row["Standort"] == location and parameter in row:
                    datum = datetime.strptime(row["Datum"], "%d.%m.%Y")
                    if datetime.strptime(start_date, "%Y-%m-%d") <= datum <= datetime.strptime(end_date, "%Y-%m-%d"):
                        data.append({"Datum": datum, "Wert": float(row[parameter])})

        if not data:
            return {"error": "Keine Daten für diesen Filter gefunden."}

        chart = alt.Chart(alt.Data(values=data)).mark_line().encode(
            x=alt.X("Datum:T", title="Datum"),
            y=alt.Y("Wert:Q", title=f"{parameter} (Wert)"),
        ).properties(
            title=f"Liniendiagramm: {parameter} für {location}",
            width=600,
            height=400,
        )

        return JSONResponse(content=chart.to_dict())

    except Exception as e:
        return {"error": str(e)}
