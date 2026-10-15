# Open Fabric – Frontend Web Application Service

> 🌐 **Deployment Notice**: This repository is dedicated solely to the **Frontend Web Application Deployment** of the Open Fabric Transaction Reconciliation Platform (hosted on Vercel).
>
> 📁 **Main Repository & Test Datasets**: For the complete monorepo, backend code, architectural documentation, and all individual test scenario CSV files (`scenario_1.csv` through `scenario_7.csv`, plus `all_scenarios_1_to_7.csv`), please visit the **Main Monorepo**:  
> 👉 **[OF-assement-backup on GitHub](https://github.com/kishore2818/OF-assement-backup)**

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20App-of--frontend.vercel.app-1EC8A5?style=for-the-badge&logo=vercel&logoColor=white)](https://of-frontend.vercel.app/)
[![Backend API](https://img.shields.io/badge/⚡%20Backend%20API-Render%20Online-0F1B4C?style=for-the-badge&logo=render&logoColor=white)](https://of-backend.onrender.com)
[![Main Monorepo](https://img.shields.io/badge/📦%20Main%20Repo-OF--assement--backup-0F1B4C?style=for-the-badge&logo=github&logoColor=white)](https://github.com/kishore2818/OF-assement-backup)

---

## 🌐 Live Application & Credentials
- **Live URL**: `https://of-frontend.vercel.app`
- **Default Auditor Login**: Username `admin` | Password `admin`

---

## 🧪 Testing Scenarios (Deployed & Local)

All individual scenario datasets are available in the [Main Monorepo](https://github.com/kishore2818/OF-assement-backup):

| Scenario | Dataset File | Description |
| :--- | :--- | :--- |
| **Scenario 1** | `scenario_1.csv` | Exact 1-to-1 match via lifecycle ID |
| **Scenario 2** | `scenario_2.csv` | Partial under-settlement warning |
| **Scenario 3** | `scenario_3.csv` | Legitimate return credit / refund |
| **Scenario 4** | `scenario_4.csv` | Critical over-settlement detection |
| **Scenario 5** | `scenario_5.csv` | Missing lifecycle ID with composite key fallback |
| **Scenario 6** | `scenario_6.csv` | Multi-tranche settlement progression |
| **Scenario 7** | `scenario_7.csv` | Complex partial settlement + refund |
| **Master Batch**| `all_scenarios_1_to_7.csv` | Ingests all 10 records simultaneously |

### How to Test:
1. **On the Deployed Site**: Navigate to [of-frontend.vercel.app](https://of-frontend.vercel.app/), log in, and click **Reconcile New Data** in the top navbar to upload or paste any scenario CSV.
2. **On Local Environment**:
   ```bash
   npm install
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 📦 Core Frontend Stack
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with custom fintech design system and responsive mobile layouts
- **Routing**: React Router v6
- **Visual Analytics**: Recharts, Lucide React icons
- **Export Engines**: PDF generation via `jspdf` & `jspdf-autotable`, CSV client-side exports
