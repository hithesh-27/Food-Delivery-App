@echo off
echo Starting Food Delivery App Deployment...

echo Step 1: Pushing backend to GitHub
cd "c:\Users\hithe\OneDrive\Desktop\FOOD-DEL-BACKEND"
git push -u origin master

echo Step 2: Deploy backend to Render
echo Go to https://render.com and create new Web Service
echo Connect GitHub repo: hithesh-27/FOOD-DEL-BACKEND
echo Set Root Directory: (empty)
echo Build Command: npm install
echo Start Command: npm run server
echo Add environment variables (demo values):
echo JWT_SECRET=demo_jwt_secret_food_del_2024
echo STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_TEST_SECRET_KEY (get from https://dashboard.stripe.com/test/apikeys)
echo MONGO_URI=mongodb+srv://hitheshgowdaar_db_user:yB7IbGmByVhakEis@cluster0.uxiwnnj.mongodb.net/food-del
echo Then deploy and get the URL

echo Step 3: Update Streamlit with backend URL
echo In Streamlit Cloud app settings, add secret: backend_url = "YOUR_BACKEND_URL"
echo Redeploy Streamlit

echo Deployment complete!