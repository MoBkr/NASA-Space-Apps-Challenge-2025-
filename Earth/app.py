# app.py
import streamlit as st
import pandas as pd
import numpy as np
import joblib
import matplotlib.pyplot as plt

st.set_page_config(page_title="Exoplanet Habitability Dashboard", layout="wide")

# ===========================
# إعداد: أسماء الميزات وخرائط اللابل
# ===========================
FEATURE_COLS = [
    "P_PERIOD", "P_FLUX", "P_TEMP_EQUIL", "P_TYPE",
    "P_HABZONE_OPT", "P_RADIUS_EST", "P_MASS_EST", "S_TYPE_TEMP"
]

LABEL_MAP = {
    0: "Inhabitable ❌",
    1: "Conservatively Habitable ✅",
    2: "Optimistically Habitable 🌱"
}

# ===========================
# Sidebar: شرح الأعمدة
# ===========================
st.sidebar.header("ℹ️ Column explanations")
st.sidebar.markdown("""
- **P_PERIOD**: Orbital period of the planet (in Earth days).  
- **P_FLUX**: Stellar radiation received by the planet (relative flux).  
- **P_TEMP_EQUIL**: Estimated equilibrium temperature of the planet (Kelvin).  
- **P_TYPE**: Planet type (Jovian, Superterran, Neptunian, Subterran, Terran, Miniterran).  
- **P_HABZONE_OPT**: Is the planet in the optimistic habitable zone? (0 or 1).  
- **P_RADIUS_EST**: Estimated planetary radius (relative to Earth).  
- **P_MASS_EST**: Estimated planetary mass (relative to Earth or Jupiter).  
- **S_TYPE_TEMP**: Stellar spectral type (O, B, A, F, G, K, M).
""")

st.title("🌍 Exoplanet Habitability — Dashboard")
st.write("Upload a CSV or enter planet features manually. The pipeline must be in the same folder as this file (`knn_pipeline.pkl`).")

# ===========================
# Load pipeline safely
# ===========================
loaded_pipeline = None
try:
    with open(r"C:\Users\Lenovo\Desktop\Nasa Space APPS\Earth\knn_pipeline.pkl", "rb") as f:
        loaded_pipeline = joblib.load(f)
except Exception as e:
    st.error(f"Could not load pipeline file 'knn_pipeline.pkl'.\nMake sure the file exists and is a saved pipeline. Error: {e}")
    st.stop()  # stop further execution because pipeline is required

# helper: get classes & human labels order for probabilities
def get_classes_order(pipe):
    # find classes_ from pipeline or final estimator
    classes = None
    if hasattr(pipe, "classes_"):
        classes = pipe.classes_
    else:
        # try to get last estimator in pipeline
        try:
            last = list(pipe.named_steps.values())[-1]
            classes = getattr(last, "classes_", None)
        except Exception:
            classes = None
    if classes is None:
        # fallback to [0,1,2]
        classes = np.array([0, 1, 2])
    return classes.astype(int)

CLASS_ORDER = get_classes_order(loaded_pipeline)
HUMAN_LABELS = [LABEL_MAP.get(int(c), str(c)) for c in CLASS_ORDER]

# ===========================
# Upload CSV — bulk predictions
# ===========================
st.header("📂 Bulk prediction — Upload CSV")
uploaded_file = st.file_uploader("Upload CSV file containing planet rows (CSV)", type=["csv"])

if uploaded_file is not None:
    try:
        df = pd.read_csv(uploaded_file)
    except Exception as e:
        st.error(f"Could not read uploaded file as CSV: {e}")
        df = None

    if df is not None:
        st.subheader("Preview (first 5 rows)")
        st.dataframe(df.head())

        # check required columns
        missing = [c for c in FEATURE_COLS if c not in df.columns]
        if missing:
            st.error(f"The uploaded file is missing required columns: {missing}")
            st.info(f"Required columns: {FEATURE_COLS}")
        else:
            # run predictions (pipeline expected to handle encoding/scaling internally)
            try:
                X = df[FEATURE_COLS]
                preds = loaded_pipeline.predict(X)
                # probabilities if available
                if hasattr(loaded_pipeline, "predict_proba"):
                    probs = loaded_pipeline.predict_proba(X)
                    probs_df = pd.DataFrame(probs, columns=HUMAN_LABELS)
                    # append to original df
                    for col in probs_df.columns:
                        df[col] = probs_df[col]
                else:
                    probs = None

                # map labels
                df["Prediction"] = [LABEL_MAP.get(int(p), p) for p in preds]

                st.success("✅ Predictions generated")
                st.subheader("Results preview")
                st.dataframe(df.head(50))

                # quick summary chart
                st.subheader("Distribution of Predictions")
                counts = df["Prediction"].value_counts().reindex(list(LABEL_MAP.values()), fill_value=0)
                fig1, ax1 = plt.subplots()
                ax1.pie(counts.values, labels=counts.index, autopct="%1.1f%%", startangle=90)
                ax1.axis("equal")
                st.pyplot(fig1)

                # show top rows by probability for conservative class (example)
                if probs is not None:
                    # choose index of conservative class in order
                    try:
                        cons_idx = list(CLASS_ORDER).index(1)
                        top_cons = df.iloc[np.argsort(-probs[:, cons_idx])][:10]
                        st.subheader("Top 10 planets with highest probability for 'Conservatively Habitable'")
                        st.dataframe(top_cons[[*FEATURE_COLS, HUMAN_LABELS[cons_idx], "Prediction"]].head(10))
                    except ValueError:
                        pass

            except Exception as e:
                st.error(f"Prediction failed: {e}")

# ===========================
# Manual input — single prediction
# ===========================
st.header("✍️ Manual Input (single planet)")

with st.form("manual_input"):
    col1, col2, col3 = st.columns(3)
    with col1:
        P_PERIOD = st.number_input("P_PERIOD (days)", min_value=0.0, value=365.0, step=0.1)
        P_FLUX = st.number_input("P_FLUX (flux)", min_value=0.0, value=1.0, step=0.01)
        P_TEMP_EQUIL = st.number_input("P_TEMP_EQUIL (K)", min_value=0.0, value=288.0, step=0.1)
    with col2:
        P_RADIUS_EST = st.number_input("P_RADIUS_EST (Earth radii)", min_value=0.0, value=1.0, step=0.01)
        P_MASS_EST = st.number_input("P_MASS_EST (mass)", min_value=0.0, value=1.0, step=0.01)
        P_HABZONE_OPT = st.selectbox("P_HABZONE_OPT (optimistic hab zone)", [0, 1], index=1)
    with col3:
        P_TYPE = st.selectbox("P_TYPE (planet type)", ["Jovian", "Superterran", "Neptunian", "Subterran", "Terran", "Miniterran"])
        S_TYPE_TEMP = st.selectbox("S_TYPE_TEMP (star spectral class)", ["K", "G", "M", "F", "B", "A", "O"])

    submitted = st.form_submit_button("🔮 Predict single planet")

if submitted:
    input_df = pd.DataFrame([{
        "P_PERIOD": P_PERIOD,
        "P_FLUX": P_FLUX,
        "P_TEMP_EQUIL": P_TEMP_EQUIL,
        "P_RADIUS_EST": P_RADIUS_EST,
        "P_MASS_EST": P_MASS_EST,
        "S_TYPE_TEMP": S_TYPE_TEMP,
        "P_TYPE": P_TYPE,
        "P_HABZONE_OPT": P_HABZONE_OPT
    }])

    # predict
    try:
        pred = loaded_pipeline.predict(input_df)[0]
    except Exception as e:
        st.error(f"Prediction error: {e}")
        pred = None

    if pred is not None:
        st.markdown(f"### 🪐 Prediction: **{LABEL_MAP.get(int(pred), pred)}**")

        if hasattr(loaded_pipeline, "predict_proba"):
            proba = loaded_pipeline.predict_proba(input_df)[0]
            # Make DataFrame with correct class labels order
            proba_df = pd.DataFrame([proba], columns=HUMAN_LABELS)
            st.subheader("📊 Probabilities")
            st.dataframe(proba_df.T.rename(columns={0:"Probability"}))
            # also show bar
            st.bar_chart(proba_df.T)
        else:
            st.info("Model does not support predict_proba(). Only class prediction shown.")

st.markdown("---")
st.caption("Make sure `knn_pipeline.pkl` (the trained pipeline) is in the same folder as this app. The pipeline must include all preprocessing steps (encoders, scalers) so you can pass raw DataFrame rows directly.")
