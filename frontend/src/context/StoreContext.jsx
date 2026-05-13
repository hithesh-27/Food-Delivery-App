import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { food_list as fallbackFoodList } from "../assets/assets";
export const StoreContext = createContext(null)

const StoreContextProvider = (props) => {

    const [cartItems, setCartItems] = useState({});
    const url = "http://localhost:4000"
    const [token, setToken] = useState("");
    const [food_list, setFoodList] = useState([])
    const url = import.meta.env.VITE_BACKEND_URL || "https://food-del-backend-2-tho7.onrender.com"

    const addToCart = async (itemId) => {
        setCartItems((prev) => {
            const updated = { ...prev, [itemId]: prev[itemId] ? prev[itemId] + 1 : 1 };
            // persist locally
            localStorage.setItem("cartItems", JSON.stringify(updated));
            return updated;
        });
        if (token) {
            await axios.post(url + "/api/cart/add", { itemId }, { headers: { token } })
        }
    }

    const removeFromCart = async (itemId) => {
        setCartItems((prev) => {
            const updated = { ...prev, [itemId]: prev[itemId] - 1 };
            localStorage.setItem("cartItems", JSON.stringify(updated));
            return updated;
        });
        if (token) {
            await axios.post(url + "/api/cart/remove", { itemId }, { headers: { token } })
        }
    }

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                let itemInfo = food_list.find((product) => product._id === item);
                totalAmount += itemInfo.price * cartItems[item];
            }

        }
        return totalAmount;
    }

    const fetchFoodList = async () => {
        try {
            const response = await axios.get(url + "/api/food/list");
            if (response.data?.success && Array.isArray(response.data.data)) {
                setFoodList(response.data.data);
            } else {
                setFoodList(fallbackFoodList);
            }
        } catch (error) {
            console.error("Unable to load food list, using fallback data:", error);
            setFoodList(fallbackFoodList);
        }
    }

    const loadCartData = async (token) => {
        const response = await axios.post(url + "/api/cart/get", {}, { headers: { token } });
        setCartItems(response.data.cartData);

    }

    useEffect(() => {

        async function loadData() {
            await fetchFoodList();
            // restore cart from local storage first
            const localCart = localStorage.getItem("cartItems");
            if (localCart) {
                try {
                    setCartItems(JSON.parse(localCart));
                } catch {}
            }
            if (localStorage.getItem("token")) {
                const tok = localStorage.getItem("token");
                setToken(tok);
                await loadCartData(tok);
            }
        }
        loadData();
    }, [])

    // whenever cartItems change while unauthenticated, persist locally
    useEffect(() => {
        localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }, [cartItems]);

    // clear cart storage when user logs out
    useEffect(() => {
        if (!token) {
            localStorage.removeItem("cartItems");
        }
    }, [token]);

    const contextValue = {
        food_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        url,
        token,
        setToken

    }

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    )

}

export default StoreContextProvider;