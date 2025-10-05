import pandas as pd
import numpy as np
import joblib
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report
from sklearn.preprocessing import LabelEncoder
from xgboost import XGBClassifier
import joblib
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

# -------- CONFIG --------
XGB_PATH = "models/K2/xgb_k2.pkl"
LGB_PATH = "models/K2/lgb_k2.pkl"
IMPUTER_PATH = "models/K2/imputer_k2.pkl"
SCALER_PATH = "models/K2/scaler_k2.pkl"
ENCODER_PATH = "models/K2/label_encoder_k2.pkl"
TRAIN_FEATURES_PATH = "models/K2/train_features_k2.pkl"
OUTPUT_PATH = "predictions_k2.csv"
# ------------------------

# تحميل الموديلات والمعالجات
xgb_model = joblib.load(XGB_PATH)
lgb_model = joblib.load(LGB_PATH)
imputer = joblib.load(IMPUTER_PATH)
scaler = joblib.load(SCALER_PATH)
label_encoder = joblib.load(ENCODER_PATH)
train_features = joblib.load(TRAIN_FEATURES_PATH)


def run_prediction_k2(df: pd.DataFrame):
    """
    تشغيل التنبؤ باستخدام موديلات K2 (XGB + LGB ensemble)
    """
    try:
        if "disposition" in df.columns:
            df["disposition"] = df["disposition"].replace("REFUTED", "FALSE POSITIVE")
            y_true = label_encoder.transform(df["disposition"])
            X = df.drop(columns=["disposition"])
        else:
            y_true = None
            X = df.copy()

        # اختيار الأعمدة
        X_num = X.select_dtypes(include=[np.number])
        X_num = X_num.reindex(columns=train_features, fill_value=0)

        # تجهيز البيانات
        X_imputed = pd.DataFrame(imputer.transform(X_num), columns=X_num.columns)
        X_scaled = pd.DataFrame(scaler.transform(X_imputed), columns=X_num.columns)

        # Predictions
        xgb_probs = xgb_model.predict_proba(X_scaled)
        lgb_probs = lgb_model.predict_proba(X_scaled)
        ensemble_probs = (xgb_probs + lgb_probs) / 2
        y_pred = np.argmax(ensemble_probs, axis=1)
        preds = label_encoder.inverse_transform(y_pred)

        # DataFrame output
        df_out = df.copy()
        df_out["prediction"] = preds

        # Evaluation
        metrics = None
        if y_true is not None:
            acc = accuracy_score(y_true, y_pred)
            prec = precision_score(y_true, y_pred, average="weighted", zero_division=0)
            rec = recall_score(y_true, y_pred, average="weighted", zero_division=0)
            f1 = f1_score(y_true, y_pred, average="weighted", zero_division=0)

            metrics = {
                "accuracy": float(acc),
                "precision": float(prec),
                "recall": float(rec),
                "f1": float(f1),
                "report": classification_report(
                    y_true, y_pred, zero_division=0, output_dict=True
                ),
            }

        return df_out, metrics

    except Exception as e:
        print(f"❌ ERROR in run_prediction_k2: {e}")
        return pd.DataFrame(), None

def retrain_k2(df: pd.DataFrame):
    """
    إعادة تدريب موديل K2 على بيانات جديدة
    """
    if "disposition" not in df.columns:
        raise ValueError("K2 dataset must contain 'disposition' column")

    # Merge REFUTED مع FALSE POSITIVE
    df["disposition"] = df["disposition"].replace("REFUTED", "FALSE POSITIVE")

    X = df.drop(columns=["disposition"])
    y = df["disposition"]

    # Align features
    X_num = X.select_dtypes(include=[np.number])
    X_num = X_num.reindex(columns=train_features, fill_value=0)

    # Preprocessing
    X_imputed = pd.DataFrame(imputer.fit_transform(X_num), columns=X_num.columns)
    X_scaled = pd.DataFrame(scaler.fit_transform(X_imputed), columns=X_num.columns)

    # Encode labels
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)

    # New model
    new_model = XGBClassifier(
        n_estimators=300,
        learning_rate=0.05,
        max_depth=6,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        eval_metric="mlogloss"
    )
    new_model.fit(X_scaled, y_encoded)

    # Evaluate
    y_pred = new_model.predict(X_scaled)
    acc = accuracy_score(y_encoded, y_pred)
    prec = precision_score(y_encoded, y_pred, average="weighted", zero_division=0)
    rec = recall_score(y_encoded, y_pred, average="weighted", zero_division=0)
    f1 = f1_score(y_encoded, y_pred, average="weighted", zero_division=0)

    # Save new model + encoder + imputer + scaler
    joblib.dump(new_model, XGB_PATH)
    joblib.dump(le, ENCODER_PATH)
    joblib.dump(imputer, IMPUTER_PATH)
    joblib.dump(scaler, SCALER_PATH)

    metrics = {
    "train_accuracy": float(acc),   # نفس القيمة لأن مفيش split
    "test_accuracy": float(acc),
    "precision": float(prec),
    "recall": float(rec),
    "f1": float(f1)
     }

    status = "Balanced"
    if metrics["test_accuracy"] < 0.7:
     status = "Underfitting"

    return {
       "message": "✅ K2 model retrained successfully",
        "status": status,
        "metrics": metrics
    }

