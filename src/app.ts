import express from "express"
import "express-async-errors"
import cookieSession from "cookie-session"
import { errorHandler, NotFoundError, currentUser } from "@vanguardo/common"

import * as router from "./routes"

const app = express()
app.set("trust proxy", true)
app.use(express.json())
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
    name: "x76s26"
  })
)
app.use(currentUser)

Object.values(router).forEach(routerItem => {
  app.use(routerItem)
})

app.all("*", async (req, res, next) => {
  throw new NotFoundError()
})

app.use(errorHandler)

export { app }
