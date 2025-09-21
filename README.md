Steps :
1. cd workspace
2. cd shadcn-ui
3. npm i
4. npm install gsap chart.js react-chartjs-2 ngeohash firebase
5.npm install @radix-ui/react-dialog lucide-react
6. npm run dev
Steps to run py scripts file:
cd workspace
cd shadcn-ui
 cd src
cd data
 python process_with_factors.py



 # 🌱 Carbon FootPrint Project

This project tracks and visualizes carbon emissions for users, areas, and peer groups.  
It includes a **FastAPI backend** (prediction, retraining, history, recommendations) and a **React frontend** (interactive dashboard with charts).  

---

## ✅ Things We’ve Accomplished So Far

### **Backend (FastAPI)**
- **Model & Retraining**
  - Loads `RandomForest` model (`carbon_rf.pkl`) at startup.  
  - Auto-retrain after 50 submissions (`retrain_counter.txt`).  
  - Baseline dataset bootstrapping (`Carbon_Emission_Cleaned.csv`).  
  - Added **area type flags**: Residential, Corporate, Industrial, Vehicular, Construction, Airport.  

- **Prediction API (`/predict`)**
  - Accepts numeric + categorical + city + area features.  
  - Expands area → one-hot flags via `AREA_MAPPING`.  
  - Returns:
    - `current_total_co2`  
    - `predicted_total_co2`  
    - `peer_comparison` (area/city/India averages)  
    - `area_context` (name, highest emission type, tags, breakdown, breakdown_pct)  
    - `retrain_status`  

- **History API (`/history`)** → last 5 submissions + peer summary.  
- **Recommendations API (`/recommend`)** → top 3 categories with tips + sliders.  
- **Baseline Scaling** → ~600–900 kg/person/month baseline for realism.  
- **Breakdown Enhancements** → weighted distribution, dataset averages, breakdown_pct.  

---

### **Frontend (React)**
- **Survey Page (`Survey.tsx`)**
  - Sliders for numeric inputs, dropdowns for categorical features.  
  - Calls `/predict` → stores result in localStorage.  
- **Dashboard Page (`Dashboard.tsx`)**
  - KPI Cards (Current, Predicted, % Change, Lifetime CO₂).  
  - Pie Chart (user breakdown, tooltips with kg + %).  
  - Area Context Card → shows area name, highest type, tags + mini bar chart.  
  - Peer Group Comparison (text vs Area/City/India).  
  - Community Comparison Bar Chart (You vs Averages).  
  - Top 3 Contributors card.  
  - Recommendations with sliders.  
  - Scenario Simulator → compare Current vs Adjusted.  
  - Trend Line of history.  
  - History Table → last 5 submissions.  
  - Actions → Map, Update survey, PowerBI, Export, Reset.  
- **UI Enhancements**
  - GSAP animations.  
  - Progress bar in survey.  
  - Tooltips improved.  
  - Error handling for missing data.  

---

## ⏳ Things We Parked for Later

### **Dashboard Polish**
- [ ] Show note for hidden (0%) categories.  
- [ ] Legends with percentages → *Residential (32%)*.  
- [ ] Skeleton loaders / shimmer while data loads.  
- [ ] Friendly eco-themed error states.  

### **Data & Insights**
- [ ] Bundle `/predict`, `/recommend`, `/history` into one response.  
- [ ] Peer comparison: add absolute kg difference (e.g., *12% less ≈ 80 kg*).  
- [ ] Trend line toggle → daily / monthly / yearly.  
- [ ] Export → PDF/Excel with charts embedded.  

### **Interactivity**
- [ ] Interactive map → emissions heatmap for Mumbai/Navi Mumbai, zoomable.  
- [ ] Scenario simulator+ → multi-adjustment side by side.  
- [ ] Gamification → badges (Eco Warrior, Green Saver).  
- [ ] Leaderboard / Community view → compare with friends/groups.  

### **Future Integrations**
- [ ] PowerBI / analytics integration.  
- [ ] Firebase + Auth → multiple users, persistent dashboards.  
- [ ] Notifications → monthly CO₂ report emails/reminders.  

---

## 📂 Project Paths & Files

### 🔹 Backend (FastAPI + ML)
- **ML service** → `workspace/shadcn-ui/api/ml_service.py`  
- **Retraining script** → `workspace/shadcn-ui/api/retrain.py`  
- **Saved model** → `workspace/shadcn-ui/api/models/carbon_rf.pkl`  
- **User submissions** → `workspace/shadcn-ui/api/data/user_submissions.csv`  
- **Base dataset** → `workspace/shadcn-ui/api/data/carbon_emission_augmented_extended.csv`  

**Run retrain manually:**
```bash
cd workspace/shadcn-ui/api
python retrain.py
Run backend server:

bash
Copy code
cd workspace/shadcn-ui/api
uvicorn ml_service:app --reload --port 8000
