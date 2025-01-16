import csv
from datetime import datetime
from fastapi.responses import JSONResponse
import altair as alt

file_path = "./data/wetterdaten_combined.csv"

async def create_linechart(parameter: str, start_date: str, end_date: str, location: str):
    try:
        data = []

        # CSV-Datei lesen und filtern
        with open(file_path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile, delimiter=';')
            for row in reader:
                if row["Standort"] == location and parameter in row:
                    # Datum korrekt parsen
                    datum = datetime.strptime(row["Datum"], "%d.%m.%Y")
                    # Filter nach Datum
                    if datetime.strptime(start_date, "%Y-%m-%d") <= datum <= datetime.strptime(end_date, "%Y-%m-%d"):
                        # Daten sammeln
                        try:
                            wert = float(row[parameter])  # Sicherstellen, dass der Parameter existiert
                            data.append({"Datum": datum.strftime("%Y-%m-%d"), "Wert": wert})
                        except ValueError:
                            continue  # Überspringe leere oder ungültige Werte

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
