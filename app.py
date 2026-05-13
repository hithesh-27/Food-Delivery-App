import streamlit as st
import streamlit.components.v1 as components

st.title("Food Delivery App")

# Embed the deployed React frontend
components.html("""
<iframe src="https://food-del-frontend.onrender.com/" width="100%" height="800" frameborder="0"></iframe>
""", height=800)