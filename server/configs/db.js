import mongoose from "mongoose";
import dns from "dns";
dns.setServers([
  "1.1.1.1",
  "8.8.8.8"
]);

const connectDB = async () => {
    console.log("URI:", process.env.MONGODB_URI) 
    try {
        mongoose.connection.on('connected', ()=> {
            console.log("Successfully connected to MongoDB !!!"); 
        })
        await mongoose.connect(`${process.env.MONGODB_URI}/bot`)
    } catch (error) {
        console.log(`MongoDB Connection Failed : `,error);
        process.exit(1); 
        
    }
}
export default connectDB