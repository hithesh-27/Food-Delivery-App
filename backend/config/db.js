import mongoose from "mongoose";
export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://hitheshgowdaar_db_user:yB7IbGmByVhakEis@cluster0.uxiwnnj.mongodb.net/food-del').then(() =>console.log("DB Connected"));
}