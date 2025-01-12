from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from diagrams import create_linechart

app = FastAPI()

# CORS erlauben
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend-URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Endpunkt für das Liniendiagramm
@app.get("/get-linechart")
async def get_linechart(
    parameter: str = Query(..., description="Parameter, z. B. T oder RainDur"),
    start_date: str = Query(..., description="Startdatum im Format YYYY-MM-DD"),
    end_date: str = Query(..., description="Enddatum im Format YYYY-MM-DD"),
    location: str = Query(..., description="Standort-Kürzel, z. B. Zch_Rosengartenstrasse"),
):
    return await create_linechart(parameter, start_date, end_date, location)
