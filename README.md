# 🌌 Faculty of Exoplanets

**Faculty of Exoplanets** is an AI-powered platform designed to transform the way researchers, students, and enthusiasts explore exoplanets.  
By combining multiple machine learning models with interactive dashboards and educational tools, our project automates exoplanet detection, predicts habitability, and makes space science accessible for everyone.

---

## 🚀 Project Overview

- **Mission-specific AI Models** for NASA datasets (TESS, Kepler, K2).  
- **Habitability Model** that predicts if a planet could potentially support life.  
- **Dual Modes**:  
  - *Researcher Mode* → advanced analytics, model retraining, probability-based predictions.  
  - *Student Mode* → simplified explanations of features and data columns.  
- **Habitable Exoplanets Catalog** → a continuously updated catalog of potentially habitable planets.  
- **Interactive Dashboards** for classification, visualization, and exploration.

---

## 🛰️ Live Project Links

- 🌐 **Main Website (Frontend – React.js):** [Insert Link Here]  
- ⚙️ **Backend API (FastAPI):** [Insert Link Here]  
- 🔬 **Habitability Model (Streamlit App):** [Insert Link Here]  
- 📂 **GitHub Repository:** This repo

---

## 🧠 AI Models

We developed **4 machine learning models**, one for each mission:  
- **Kepler** → XGBoost  
- **K2** → LightGBM  
- **TESS** → Voting Classifier (XGBoost + Random Forest)  
- **Habitability Model** → K-Nearest Neighbors (KNN)  

---

## 🛠️ Tech Stack

### AI & Data Analysis
- Python: `pandas`, `numpy`, `seaborn`, `matplotlib`, `scikit-learn`, `xgboost`, `lightgbm`

### Backend
- FastAPI

### Frontend
- React.js

### Habitability Model App
- Streamlit

### Deployment
- Streamlit Cloud (for Habitability Model)  
- Vercel/Netlify (for React frontend)  
- Render/Railway/Heroku (for FastAPI backend)

---

## 🌍 Impact

- Automates exoplanet discovery → saves researchers time.  
- Provides educational access → inspires students and future scientists.  
- Creates a bridge between AI and astronomy.  
- Offers a catalog of habitable exoplanets to guide future research.

---

## 📂 Repository Structure
faculty-of-exoplanets:
  models: "AI models (Kepler, K2, TESS, Habitability)"
  backend: "FastAPI backend"
  frontend: "React frontend"
  streamlit_app: "Habitability model (Streamlit app)"
  data: "Sample datasets"
  README.md: "Documentation"

---

## 👩‍🚀 Team

Faculty of Exoplanets was developed by a passionate team of **6 innovators** for the NASA Space Apps Challenge.  
We believe AI can help humanity take its next giant leap into the stars. 🌌✨

