import pandas as pd
import numpy as np
import pickle
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report
from sklearn.preprocessing import LabelEncoder
from xgboost import XGBClassifier
import joblib
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import os
from sklearn.impute import SimpleImputer
from sklearn.model_selection import train_test_split

# -------- CONFIG --------
MODEL_PATH = "models/xgb_kepler.pkl"
ENCODER_PATH = "models/label_encoder_kepler.pkl"
FEATURES_PATH = "models/top_features_kepler.pkl"
IMPUTER_PATH = "models/imputer_kepler.pkl"
OUTPUT_PATH = "predictions.csv"
# ------------------------

# تحميل الموديل والملفات مرة واحدة (عند الاستدعاء الأول)
with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)
with open(ENCODER_PATH, "rb") as f:
    label_encoder = pickle.load(f)
with open(FEATURES_PATH, "rb") as f:
    top_features = pickle.load(f)
with open(IMPUTER_PATH, "rb") as f:
    imputer = pickle.load(f)


    # Separate features and labels
def run_prediction(df: pd.DataFrame):
    """
    تشغيل التنبؤ باستخدام موديل كيبلر
    """
    # Separate features and labels
    if "koi_disposition" in df.columns:
        X = df.drop(columns=["koi_disposition"])
        y_true = df["koi_disposition"]

        if hasattr(label_encoder, "transform"):
            y_true_encoded = label_encoder.transform(y_true)
        else:
            # لو مجرد array، نعمل mapping
            classes = np.array(label_encoder)
            y_true_encoded = np.array([np.where(classes == val)[0][0] if val in classes else -1 for val in y_true])
    else:
        X = df.copy()
        y_true, y_true_encoded = None, None

    # Align features
    X = X.reindex(columns=top_features, fill_value=np.nan)
    X = X.apply(pd.to_numeric, errors="coerce")
    
    # Imputation 
    if hasattr(imputer, "transform"):
        X_imputed = pd.DataFrame(imputer.transform(X), columns=top_features)
    else:
        X_imputed = X.fillna(0)

    # Predict
    y_pred_encoded = model.predict(X_imputed)
    
    # Probability
    probs = model.predict_proba(X_imputed)  # الحصول على الاحتمالات
    prob_class_1 = probs[:, 1]  # نسبة الاحتمال للتصنيف "CONFIRMED" (الصف 1)

    if hasattr(label_encoder, "inverse_transform"):
        y_pred = label_encoder.inverse_transform(y_pred_encoded)
    else:
        classes = np.array(label_encoder)
        y_pred = classes[y_pred_encoded]

    # Build result dataframe
    df_out = df.copy()
    df_out["prediction"] = [str(p).upper() for p in y_pred]
    df_out["prediction_prob_1"] = prob_class_1  # إضافة الاحتمال للتصنيف "CONFIRMED"

    # Metrics
    metrics = None
    if y_true_encoded is not None and -1 not in y_true_encoded:
        acc = accuracy_score(y_true_encoded, y_pred_encoded)
        prec = precision_score(y_true_encoded, y_pred_encoded, average="weighted", zero_division=0)
        rec = recall_score(y_true_encoded, y_pred_encoded, average="weighted", zero_division=0)
        f1 = f1_score(y_true_encoded, y_pred_encoded, average="weighted", zero_division=0)

        metrics = {
            "accuracy": float(acc),
            "precision": float(prec),
            "recall": float(rec),
            "f1": float(f1),
            "report": classification_report(y_true_encoded, y_pred_encoded, zero_division=0, output_dict=True),
        }
        
    return df_out, metrics

def retrain_kepler(df: pd.DataFrame, learning_rate=0.1, max_depth=6, n_estimators=100):
    # ✅ التأكد من وجود العمود koi_disposition
    if "koi_disposition" not in df.columns:
        raise ValueError(f"'koi_disposition' column not found in dataset. Available columns: {list(df.columns)}")

    # فصل الـ features عن الـ target
    X = df.drop(columns=["koi_disposition"])
    y_raw = df["koi_disposition"]

    # ✅ تحويل القيم النصية لأرقام
    le = LabelEncoder()
    y = le.fit_transform(y_raw)

    # Train/Test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # إنشاء الموديل بالـ hyperparams
    model_new = XGBClassifier(
        n_estimators=n_estimators,
        learning_rate=learning_rate,
        max_depth=max_depth,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        eval_metric="mlogloss",
        use_label_encoder=False
    )

    # ✅ تدريب الموديل
    model_new.fit(X_train, y_train)

    # ✅ التنبؤ
    y_train_pred = model_new.predict(X_train)
    y_test_pred = model_new.predict(X_test)

    # حساب المقاييس
    train_acc = accuracy_score(y_train, y_train_pred)
    test_acc = accuracy_score(y_test, y_test_pred)
    prec = precision_score(y_test, y_test_pred, average="weighted", zero_division=0)
    rec = recall_score(y_test, y_test_pred, average="weighted", zero_division=0)
    f1 = f1_score(y_test, y_test_pred, average="weighted", zero_division=0)

    # تحديد حالة الموديل
    status = "Balanced"
    if train_acc - test_acc > 0.15:
        status = "Overfitting"
    elif test_acc < 0.7:
        status = "Underfitting"

    metrics = {
        "train_accuracy": float(train_acc),
        "test_accuracy": float(test_acc),
        "precision": float(prec),
        "recall": float(rec),
        "f1": float(f1)
    }

    os.makedirs("models/KeplerRetrained", exist_ok=True)
    with open("models/KeplerRetrained/xgb_kepler_retrained.pkl", "wb") as f:
        pickle.dump(model_new, f)
    with open("models/KeplerRetrained/label_encoder_kepler_retrained.pkl", "wb") as f:
        pickle.dump(le, f)

    return {
        "message": "✅ Kepler retrained with custom hyperparams (and saved separately)",
        "status": status,
        "metrics": metrics,
        "model_path": "models/KeplerRetrained/xgb_kepler_retrained.pkl"
    }