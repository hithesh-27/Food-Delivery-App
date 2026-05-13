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
