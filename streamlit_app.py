"""
Food Delivery — React (Vite) frontend embedded in Streamlit.

The Streamlit static file server serves unknown extensions as text/plain, so a normal
`dist/` folder cannot load .js modules. This app embeds a single-file HTML build instead.

Local setup:
  cd frontend && npm install && npm run build:streamlit

Optional Streamlit secrets (same as before for the Python UI):
  backend_url = "https://your-api.example.com"

If you skip the local bundle (e.g. on Streamlit Community Cloud without committing
the large HTML file), host the regular `npm run build` output elsewhere and set:
  react_app_url = "https://your-static-host.example.com/"
Or environment variable: STREAMLIT_REACT_URL
"""

from __future__ import annotations

import os
from pathlib import Path

import streamlit as st

ROOT = Path(__file__).resolve().parent
STREAMLIT_BUNDLE = ROOT / "streamlit_embed" / "index.html"


def _secret(name: str):
    try:
        return st.secrets[name]
    except Exception:
        return None


st.set_page_config(page_title="Food Delivery", page_icon="🍔", layout="wide", initial_sidebar_state="collapsed")

try:
    backend_url = _secret("backend_url")
except Exception:
    backend_url = None
if not backend_url:
    backend_url = os.getenv("BACKEND_URL", "https://food-del-backend-2-tho7.onrender.com")

react_iframe_url = os.getenv("STREAMLIT_REACT_URL") or _secret("react_app_url")

with st.sidebar:
    st.markdown("### Food Delivery")
    st.caption(f"Backend API base: `{backend_url}`")
    st.caption(
        "React runs inside Streamlit (st.iframe). Rebuild the bundle after frontend "
        "changes: `cd frontend && npm run build:streamlit`."
    )
    st.caption(
        "The React app uses `VITE_BACKEND_URL` at **build** time (see `frontend` env). "
        "Match it to this backend, or rebuild with the correct value."
    )

if STREAMLIT_BUNDLE.is_file():
    st.iframe(STREAMLIT_BUNDLE, height=1100, width="stretch")
elif react_iframe_url:
    st.iframe(react_iframe_url, height=1100, width="stretch")
else:
    st.error(
        "No embedded React bundle found and no `react_app_url` / `STREAMLIT_REACT_URL` set."
    )
    st.markdown(
        """
1. **Recommended (local / full embed):** from the repo root, run:

   `cd frontend && npm install && npm run build:streamlit`

   That writes `streamlit_embed/index.html` (large file; gitignored by default).

2. **Alternative (Streamlit Cloud):** deploy the Vite `npm run build` output to any static host,
   then add a Streamlit secret `react_app_url` pointing to that site’s URL (trailing slash optional).

3. **Pure Python UI:** run `streamlit run streamlit_native_ui.py` instead of this file.
"""
    )
