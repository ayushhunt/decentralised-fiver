import exppress from "express";
import  userRouter  from "./routers/user";
import workerRouter from "./routers/worker";
import cors from "cors";

const app = exppress();

app.use(exppress.json());
app.use(cors())


app.use("/v1/user",userRouter);
app.use("/v1/worker",workerRouter);


app.listen(3001)
console.log("Server is running on port 3001");