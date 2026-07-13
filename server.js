import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import config from "./src/config/config.js";
import {redis} from "./src/config/redis.js";


const port = config.PORT || 3000;
//Connect to Database
connectDB();

await redis.set("test", "Redis is working fine");
const value = await redis.get("test");
console.log("Redis test value:", value);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
