from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import csv

app = FastAPI()

# CORS konfigurieren
origins = [
    "http://localhost:3000",  # Frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Relativer Pfad zur CSV-Datei
file_path = "./data/wetterdaten_combined.csv"

@app.get("/get-parameter")
def get_parameters():
    # Liste von Parametern, die wir aus der CSV-Datei extrahieren möchten
    parameters = ["Temperatur", "MaxTemperatur", "Druck"]
    return {"parameters": parameters}
