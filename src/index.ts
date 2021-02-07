import mongoose from "mongoose"
import { DatabaseConnectionError } from "@vanguardo/common"
import dotEnv from "dotenv"

import { app } from "./app"
import { natsWrapper } from "./nats-wrapper"

dotEnv.config()
const start = async () => {
  if (!process.env.JWT_SECRET)
    throw new Error("JWT_SECRET environment variable missing")
  if (!process.env.MONGO_URI)
    throw new Error("MONGO_URI environment variable missing")
  try {
    await natsWrapper.connect("tick8", "ticket-service", "http://nats-srv:4222")

    natsWrapper.client.on("close", () => {
      console.log("NATS connection closed!")
      process.exit()
    })

    process.on("SIGINT", () => natsWrapper.client.close())
    process.on("SIGTERM", () => natsWrapper.client.close())

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    })
    console.log("connected to mongodb")
  } catch (err) {
    console.log("[Error]", err)

    throw new DatabaseConnectionError()
  }

  app.listen(1367, () => {
    console.log("Listening on Ticket service!!!")
  })
}

start()
