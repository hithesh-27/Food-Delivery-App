import os
from urllib.parse import urljoin

import requests
import streamlit as st

try:
    BACKEND_URL = st.secrets.get("backend_url")
except Exception:
    BACKEND_URL = None

if not BACKEND_URL:
    BACKEND_URL = os.getenv("BACKEND_URL", "https://food-del-backend-2-tho7.onrender.com")

API_PREFIX = urljoin(BACKEND_URL, "/api/")


def api_post(path, payload=None, token=None):
    try:
        headers = {"Content-Type": "application/json"}
        if token:
            headers["token"] = token
        response = requests.post(urljoin(API_PREFIX, path), json=payload or {}, headers=headers, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as exc:
        return {"success": False, "message": str(exc)}


def api_get(path, token=None):
    try:
        headers = {}
        if token:
            headers["token"] = token
        response = requests.get(urljoin(API_PREFIX, path), headers=headers, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as exc:
        return {"success": False, "message": str(exc)}


def get_food_list():
    data = api_get("food/list")
    return data.get("data", []) if data.get("success") else []


def get_cart(token):
    result = api_post("cart/get", payload={}, token=token)
    return result.get("cartData", {}) if result.get("success") else {}


def add_to_cart(item_id, token):
    return api_post("cart/add", payload={"itemId": item_id}, token=token)


def remove_from_cart(item_id, token):
    return api_post("cart/remove", payload={"itemId": item_id}, token=token)


def register_user(name, email, password):
    return api_post("user/register", payload={"name": name, "email": email, "password": password})


def login_user(email, password):
    return api_post("user/login", payload={"email": email, "password": password})


def place_order(items, amount, address, token):
    return api_post("order/place", payload={"items": items, "amount": amount, "address": address}, token=token)


def get_orders(token):
    return api_get("order/user", token=token)


if "token" not in st.session_state:
    st.session_state.token = None
if "email" not in st.session_state:
    st.session_state.email = None

st.set_page_config(page_title="Food Delivery Streamlit", page_icon="🍔", layout="wide")

st.markdown("# Food Delivery Streamlit App")
st.markdown(f"**Backend:** {BACKEND_URL}")

if st.session_state.token:
    st.sidebar.success(f"Signed in as {st.session_state.email}")
    if st.sidebar.button("Logout"):
        st.session_state.token = None
        st.session_state.email = None

    tab = st.sidebar.radio("Navigate", ["Menu", "Cart", "Orders"])

    foods = get_food_list()
    food_map = {food["_id"]: food for food in foods}
    cart_data = get_cart(st.session_state.token)

    if tab == "Menu":
        st.header("Browse Food Items")
        if not foods:
            st.warning("No food items available. Start by adding items in the backend.")
        for food in foods:
            col1, col2 = st.columns([1, 2])
            with col1:
                image_url = urljoin(BACKEND_URL, f"/images/{food.get('image', '')}")
                st.image(image_url, width=220)
            with col2:
                st.subheader(food.get("name", ""))
                st.write(food.get("description", ""))
                st.write(f"**Category:** {food.get('category', '')}")
                st.write(f"**Price:** ₹{food.get('price', 0)}")
                if st.button("Add to cart", key=f"add_{food['_id']}"):
                    result = add_to_cart(food["_id"], st.session_state.token)
                    if result.get("success"):
                        st.success("Added to cart")
                    else:
                        st.error(result.get("message", "Failed to add to cart"))

    elif tab == "Cart":
        st.header("Your Cart")
        if not cart_data:
            st.info("Your cart is empty. Add items from the Menu.")
        else:
            order_items = []
            total_amount = 0
            for item_id, count in cart_data.items():
                if count <= 0:
                    continue
                food = food_map.get(item_id)
                if not food:
                    continue
                item_total = food.get("price", 0) * count
                total_amount += item_total
                with st.expander(f"{food.get('name')} x {count}"):
                    st.write(food.get("description", ""))
                    st.write(f"Unit price: ₹{food.get('price', 0)}")
                    st.write(f"Item total: ₹{item_total}")
                    if st.button("Remove one", key=f"remove_{item_id}"):
                        result = remove_from_cart(item_id, st.session_state.token)
                        if result.get("success"):
                            st.success("Updated cart")
                        else:
                            st.error(result.get("message", "Failed to update cart"))
                order_items.append({
                    "itemId": item_id,
                    "name": food.get("name", ""),
                    "price": food.get("price", 0),
                    "quantity": count,
                })

            st.markdown(f"### Order summary: ₹{total_amount}")
            st.markdown("---")
            st.subheader("Delivery address")
            with st.form(key="address_form"):
                address_name = st.text_input("Name", value=st.session_state.get("address_name", ""))
                address_line = st.text_input("Address line", value=st.session_state.get("address_line", ""))
                city = st.text_input("City", value=st.session_state.get("city", ""))
                state = st.text_input("State", value=st.session_state.get("state", ""))
                postal_code = st.text_input("Postal code", value=st.session_state.get("postal_code", ""))
                phone = st.text_input("Phone number", value=st.session_state.get("phone", ""))
                submit_order = st.form_submit_button("Place order")
                if submit_order:
                    if not order_items:
                        st.error("Cart cannot be empty")
                    elif not address_line or not city or not state or not postal_code:
                        st.error("Please provide a complete delivery address")
                    else:
                        address = {
                            "name": address_name,
                            "line": address_line,
                            "city": city,
                            "state": state,
                            "postal_code": postal_code,
                            "phone": phone,
                        }
                        result = place_order(order_items, total_amount, address, st.session_state.token)
                        if result.get("success"):
                            st.success("Order placed successfully")
                            session_url = result.get("session_url")
                            if session_url:
                                st.markdown(f"[Complete payment here]({session_url})")
                        else:
                            st.error(result.get("message", "Failed to place order"))

    elif tab == "Orders":
        st.header("Your Orders")
        orders_result = get_orders(st.session_state.token)
        if not orders_result.get("success"):
            st.error(orders_result.get("message", "Unable to fetch orders"))
        else:
            orders = orders_result.get("orders", [])
            if not orders:
                st.info("No orders found.")
            for order in orders:
                with st.expander(f"Order {order.get('_id')} — ₹{order.get('amount')} — {order.get('status')}"):
                    st.write(f"Date: {order.get('date')}")
                    st.write(f"Delivery: {order.get('address')}")
                    for item in order.get("items", []):
                        st.write(f"- {item.get('name')} x {item.get('quantity')} @ ₹{item.get('price')}")

else:
    st.sidebar.header("Sign in")
    auth_option = st.sidebar.radio("Action", ["Login", "Register"])

    if auth_option == "Login":
        with st.form(key="login_form"):
            email = st.text_input("Email", key="login_email")
            password = st.text_input("Password", type="password", key="login_password")
            submitted = st.form_submit_button("Login")
            if submitted:
                response = login_user(email, password)
                if response.get("success"):
                    st.session_state.token = response.get("token")
                    st.session_state.email = email
                    st.success("Logged in successfully")
                else:
                    st.error(response.get("message", "Login failed"))

    else:
        with st.form(key="register_form"):
            name = st.text_input("Name", key="register_name")
            email = st.text_input("Email", key="register_email")
            password = st.text_input("Password", type="password", key="register_password")
            submitted = st.form_submit_button("Register")
            if submitted:
                response = register_user(name, email, password)
                if response.get("success"):
                    st.session_state.token = response.get("token")
                    st.session_state.email = email
                    st.success("Registered and logged in")
                else:
                    st.error(response.get("message", "Registration failed"))

st.markdown("---")
st.write("Built for the FOOD-DEL backend; run the backend first and then this Streamlit app.")
