from fastapi import FastAPI, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import pandas as pd
import numpy as np
import io, os, json

# ✅ Import models
from tess_model import predict_tess
from kepler_model import run_prediction as run_kepler, retrain_kepler, OUTPUT_PATH as KEPLER_OUTPUT
from k2_model import run_prediction_k2 as run_k2, retrain_k2, OUTPUT_PATH as K2_OUTPUT

app = FastAPI()

# ✅ Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ======================================================
# 🔮 Prediction Endpoint (File or JSON)
# ======================================================
@app.post("/predict")
async def predict(request: Request, mission: str = Form(None), file: UploadFile = File(None), features: str = Form(None)):
    try:
        # ---------- Handle input ----------
        if file:
            contents = await file.read()
            df = pd.read_csv(io.BytesIO(contents))
        elif features:  # if sent as form-data string
            feat_dict = json.loads(features)
            df = pd.DataFrame([feat_dict])
        elif request.headers.get("content-type", "").startswith("application/json"):
            body = await request.json()
            mission = body.get("mission")
            df = pd.DataFrame([body.get("features", {})])
        else:
            return {"error": "No valid input provided"}

        if not mission:
            return {"error": "Mission not specified"}

        # ---------- Run selected model ----------
        mission = mission.lower()
        if mission == "kepler":
             df_out, metrics = run_kepler(df)
        elif mission == "k2":
             df_out, metrics = run_k2(df)
        elif mission == "tess":
             df_out, counts = predict_tess(df)  # Direct call to the predict_tess function
             metrics = {}  # No need for metrics for TESS in this version
        else:
             return {"error": f"Mission '{mission}' not supported"}

        # ---------- Format output ----------
        counts = df_out["prediction"].astype(str).str.title().value_counts().to_dict()
        sample = df_out.head(10).replace({np.nan: None}).to_dict(orient="records")

        return {
            "mission": mission,
            "counts": counts,
            "metrics": metrics or {},
            "sample": sample
        }

    except Exception as e:
        return {"error": f"Prediction failed: {str(e)}"}
# ======================================================
# 🧠 Retrain Endpoint
# ======================================================
@app.post("/retrain")
async def retrain(mission: str = Form(...), file: UploadFile = File(...)):
    contents = await file.read()
    df = pd.read_csv(io.BytesIO(contents))

    if mission.lower() == "kepler":
        result = retrain_kepler(df)
    elif mission.lower() == "k2":
        result = retrain_k2(df)
    elif mission == "tess":
        return {"error": "Retraining is not supported for TESS, use the pre-trained model."}
    else:
        return {"error": f"Mission '{mission}' not supported"}

    return result

# ======================================================
# 💾 Model Download
# ======================================================
@app.get("/download_model")
async def download_model(mission: str = "kepler", retrained: bool = False):
    mission = mission.lower()

    if mission == "kepler":
        path = "models/KeplerRetrained/xgb_kepler_retrained.pkl" if retrained else "models/Kepler/xgb_kepler.pkl"
    elif mission == "k2":
        path = "models/K2Retrained/xgb_k2_retrained.pkl" if retrained else "models/K2/xgb_k2.pkl"
    elif mission == "tess":
        path = "models/Tess_Model.pkl"
    else:
        return {"error": f"Mission '{mission}' not supported"}

    if os.path.exists(path):
        return FileResponse(path, filename=os.path.basename(path))
    return {"error": "Model not found"}

# ======================================================
# 🌍 Researcher Insights (unchanged)
# ======================================================
@app.get("/api/researcher/insights")
def researcher_insights():
    data_path = "Data_DR25.csv"
    if not os.path.exists(data_path):
        return {"error": "Data_DR25.csv not found on server"}

    df = pd.read_csv(data_path)
    if "koi_prad" not in df or "koi_insol" not in df:
        return {"error": "Missing required columns"}

    df["planet_id"] = [f"Candidate_{i+1}" for i in range(len(df))]
    df["estimated_temp_K"] = 278 * (df["koi_insol"] ** 0.25)

    def classify_planet_type(r):
        if pd.isna(r): return "Unknown"
        elif r < 1.5: return "Rocky / Earth-like"
        elif r < 2.5: return "Super-Earth"
        elif r < 4: return "Mini-Neptune"
        else: return "Gas Giant"

    df["planet_type"] = df["koi_prad"].apply(classify_planet_type)

    habitable = df[(df["koi_prad"].between(0.8, 1.5)) & (df["koi_insol"].between(0.25, 2.0))].copy()
    habitable["habitability_score"] = (
        (1 - abs(1 - habitable["koi_insol"])) * 0.6 +
        (1.5 - abs(1 - habitable["koi_prad"])) * 0.4
    )

    top20 = habitable.nlargest(20, "habitability_score")[
        ["planet_id", "koi_prad", "koi_insol", "habitability_score"]
    ]

    type_counts = (
        df["planet_type"].value_counts().reset_index()
        .rename(columns={"index": "type", "planet_type": "count"})
        .to_dict(orient="records")
    )

    return {
        "total_rows": len(df),
        "planet_types": type_counts,
        "temperature_range": {
            "min": float(df["estimated_temp_K"].min()),
            "max": float(df["estimated_temp_K"].max()),
            "mean": float(df["estimated_temp_K"].mean()),
        },
        "top_habitable": top20.to_dict(orient="records"),
    }