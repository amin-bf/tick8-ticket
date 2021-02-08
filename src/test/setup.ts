import { MongoMemoryServer } from "mongodb-memory-server"
import mongoose from "mongoose"
import request from "supertest"
import jwt from "jsonwebtoken"

import { app } from "../app"

declare global {
  namespace NodeJS {
    interface Global {
      signin(): string[]
    }
  }
}

jest.mock("../nats-wrapper.ts")

let mongo: any

beforeAll(async () => {
  process.env.JWT_SECRET = "dsfdgdfshgfhfadg"
  mongo = new MongoMemoryServer()
  const mongoUri = await mongo.getUri()

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
})

beforeEach(async () => {
  jest.clearAllMocks()
  const collections = await mongoose.connection.db.collections()

  for (let collection of collections) {
    await collection.deleteMany({})
  }
})

afterAll(async () => {
  await mongo.stop()
  await mongoose.connection.close()
})

global.signin = () => {
  const payload = { email: "test@test.com", id: 1 }

  const token = jwt.sign(payload, process.env.JWT_SECRET!)

  const session = { jwt: token }

  const sessionJSON = JSON.stringify(session)

  const base64 = Buffer.from(sessionJSON).toString("base64")

  return [`x76s26=${base64}`]
}
