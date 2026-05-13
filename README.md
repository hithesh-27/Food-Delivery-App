# Food-Delivery-App

## Streamlit Deployment

This repository includes a Streamlit wrapper for the existing backend API.

### Requirements

- Python 3.9+
- `streamlit`, `requests`, `python-dotenv`

### Run locally

1. Start the backend:
   - `cd backend`
   - `npm install`
   - `npm run server`

2. Run the Streamlit app:
   - from the repository root: `pip install -r requirements.txt`
   - `streamlit run streamlit_app.py`

3. Open the Streamlit page in your browser.

### Notes

- The Streamlit app defaults to `http://localhost:4000` for the backend.
- To use a different backend URL, set the environment variable `BACKEND_URL` or provide `backend_url` in Streamlit secrets.
- The app supports login/register, menu browsing, cart management, and order placement.

## Full Deployment

### Backend Deployment

1. Create GitHub repo: `FOOD-DEL-BACKEND`
2. Push the backend code from `FOOD-DEL-BACKEND` folder
3. Deploy to Render:
   - Connect GitHub repo
   - Build: `npm install`
   - Start: `npm run server`
   - Environment variables (see `.env.example`):
     - `JWT_SECRET=demo_jwt_secret_food_del_2024`
     - `STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_TEST_SECRET_KEY` (get from Stripe test dashboard)
     - `MONGO_URI=mongodb+srv://hitheshgowdaar_db_user:yB7IbGmByVhakEis@cluster0.uxiwnnj.mongodb.net/food-del`
4. Get the deployed URL (e.g. `https://food-del-backend.onrender.com`)

### Streamlit Deployment

1. Go to https://share.streamlit.io
2. Connect GitHub repo: `hithesh-27/FOOD-DEL`
3. Main file: `streamlit_app.py`
4. Secrets: `backend_url = "https://food-del-backend.onrender.com"`
5. Deploy

Your app is now live!
