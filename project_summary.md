# Carbon Footprint App — Project Summary

## ✅ Current Status

### 🔹 Frontend (React + TSX)
- **Survey.tsx**
  - Sliders: transport_km, electricity_kWh, lpg_kg, flights_hours, meat_meals, dining_out, shopping_spend, waste_kg.
  - Dropdowns: Diet, Heating Energy Source, Recycling, Cooking_With, Social Activity, subdomain, city, country.
  - Live preview for current_total_co2.
  - On submit → sends features to backend `/predict`.
  - Saves `{ categories, categoricals, flatFeatures, current_total_co2, predicted_total_co2, timestamp }` in localStorage.

- **Dashboard.tsx**
  - KPIs: Current CO₂, Predicted Next CO₂, % Change, Lifetime CO₂.
  - Charts: Pie (emission breakdown), Bar (You vs City vs Country), Line (History trend, last 5 submissions).
  - Top 3 contributors shown.
  - AI-powered recommendations from `/recommend`.
  - Scenario Simulator: sliders to reduce categories and simulate new totals.
  - Savings message: 🟢 saved vs 🔴 increased.
  - Reset Dashboard button (soft reset: clears local history, keeps model training data).
  - Peer group comparison: You vs Subdomain Avg, You vs City Avg.

---

### 🔹 Backend (FastAPI + ML)
- **Endpoints**
  - `/predict`: takes features, returns predicted_total_co2.
  - `/recommend`: returns top 3 categories with tips.
  - `/health`: model availability check.

- **Model**
  - RandomForestRegressor trained on augmented dataset (10k rows).
  - Pipeline: OneHotEncoder for categoricals + passthrough for numerics.
  - Model file: `carbon_rf.pkl`.

- **Retraining**
  - Submissions appended to `user_submissions.csv`.
  - Auto-retrain triggered after each submission (`retrain.py`).
  - Metrics: RMSE ≈ 17 kg, MAE ≈ 13 kg, R² ≈ 0.99.

---

### 🔹 Firebase Prompt (Future Setup)
- React/Next.js + Tailwind + Chart.js + Google Maps API.
- Firebase Auth, Firestore, Cloud Functions, Hosting.
- Store surveys with geohash for geo queries.
- Features:
  - Personal vs community charts.
  - Heatmap of nearby emissions.
  - Highlight top CO₂ category.
  - Lightweight ML recommender for tips.

---

## 🔄 Current Flow
1. User fills **Survey** → live preview.  
2. On submit → data sent to `/predict`.  
3. Backend predicts next month CO₂ + saves submission in CSV.  
4. Auto-retrain updates model with new data.  
5. Dashboard shows:
   - KPIs (Current, Predicted, % Change, Lifetime).  
   - Emissions breakdown & comparisons.  
   - History trend (last 5 entries).  
   - Recommendations & scenario simulator.  
   - Savings message.  
   - Peer comparison (Subdomain & City).  
6. User can Reset Dashboard (soft reset).  

---

## 📌 Completed So Far
- Survey input + live CO₂ preview.
- Backend prediction with RandomForest model.
- Recommendations endpoint.
- Auto-save + retraining pipeline.
- Dashboard with KPIs, charts, history, savings message.
- Peer group comparison.
- History limited to last 5 submissions.
- Reset functionality.