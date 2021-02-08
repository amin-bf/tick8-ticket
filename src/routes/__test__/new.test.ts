import request from "supertest"

import { app } from "../../app"
import { Ticket } from "../../models/ticket"
import { natsWrapper } from "../../nats-wrapper"

it("has a route handler listening on /api/tickets for post requests", async () => {
  const response = await request(app).post("/api/tickets").send({})

  expect(response.status).not.toEqual(404)
})

it("can only be accessed if user is signed in", async () => {
  const response = await request(app).post("/api/tickets").send({})

  expect(response.status).toEqual(401)
})

it("Should return any thing other than 401 if user is logged in", async () => {
  const cookie = global.signin()

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ test: "tes" })

  expect(response.status).not.toEqual(401)
})

it("returns an error if an invalid title is provided", async () => {
  const cookie = global.signin()
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({})

  expect(response.body.errors).toBeDefined()

  let titleHasError = response.body.errors.some(
    (error: any) => error.field === "title"
  )

  expect(titleHasError).toBeTruthy()

  await request(app).post("/api/tickets").set("Cookie", cookie).send({
    title: ""
  })

  expect(response.body.errors).toBeDefined()

  titleHasError = response.body.errors.some(
    (error: any) => error.field === "title"
  )

  expect(titleHasError).toBeTruthy()
})

it("returns an error if an invalid price is provided", async () => {
  const cookie = global.signin()
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({})

  expect(response.body.errors).toBeDefined()

  let priceHasError = response.body.errors.some(
    (error: any) => error.field === "price"
  )

  expect(priceHasError).toBeTruthy()

  await request(app).post("/api/tickets").set("Cookie", cookie).send({
    price: ""
  })

  expect(response.body.errors).toBeDefined()

  priceHasError = response.body.errors.some(
    (error: any) => error.field === "price"
  )

  expect(priceHasError).toBeTruthy()

  await request(app).post("/api/tickets").set("Cookie", cookie).send({
    price: -300
  })

  expect(response.body.errors).toBeDefined()

  priceHasError = response.body.errors.some(
    (error: any) => error.field === "price"
  )

  expect(priceHasError).toBeTruthy()
})

it("creates a ticket with valid parameters", async () => {
  let tickets = await Ticket.find({})
  expect(tickets.length).toEqual(0)

  const cookie = global.signin()
  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "ticket",
      price: 3000
    })
    .expect(201)

  tickets = await Ticket.find({})
  expect(tickets.length).toEqual(1)
  expect(tickets[0].price).toEqual(3000)
  expect(tickets[0].title).toEqual("ticket")
})

it("publishes an event", async () => {
  const cookie = global.signin()
  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "ticket",
      price: 3000
    })
    .expect(201)

  expect(natsWrapper.client.publish).toHaveBeenCalled()
})
