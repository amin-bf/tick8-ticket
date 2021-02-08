import request from "supertest"
import mongoose from "mongoose"

import { app } from "../../app"
import { Ticket } from "../../models/ticket"
import { natsWrapper } from "../../nats-wrapper"

it("has a route handler to listen on /api/tickets put requests", async () => {
  const id = new mongoose.Types.ObjectId()
  const response = await request(app).put(`/api/tickets/${id}`).send()

  expect(response.status).not.toEqual(404)
})

it("will block unauthenticated attempts", async () => {
  const id = new mongoose.Types.ObjectId()
  await request(app).put(`/api/tickets/${id}`).send().expect(401)
})

it("blocks attempt to update non-owned ticket", async () => {
  const ticket = Ticket.build({
    price: 3000,
    title: "concert",
    userId: "12345678"
  })

  await ticket.save()

  const cookie = global.signin()

  const response = await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set("Cookie", cookie)
    .send({
      title: "new title",
      price: 100
    })
    .expect(401)
})

it("will respond with error provided invalid title", async () => {
  const ticket = Ticket.build({
    price: 3000,
    title: "concert",
    userId: "1"
  })

  await ticket.save()

  const cookie = global.signin()

  let response = await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set("Cookie", cookie)
    .send({})

  expect(response.body.errors).toBeDefined()
  let titleError = response.body.errors.some(
    (err: any) => err.field === "title"
  )
  expect(titleError).toBeTruthy()
})

it("will respond with error provided invalid price", async () => {
  const ticket = Ticket.build({
    price: 3000,
    title: "concert",
    userId: "1"
  })

  await ticket.save()

  const cookie = global.signin()

  let response = await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set("Cookie", cookie)
    .send({})

  expect(response.body.errors).toBeDefined()
  let priceError = response.body.errors.some(
    (err: any) => err.field === "price"
  )
  expect(priceError).toBeTruthy()

  response = await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set("Cookie", cookie)
    .send({
      price: -20
    })

  expect(response.body.errors).toBeDefined()
  priceError = response.body.errors.some((err: any) => err.field === "price")
  expect(priceError).toBeTruthy()
})

it("will succeed provided valid parameters", async () => {
  const ticket = Ticket.build({
    price: 3000,
    title: "concert",
    userId: "1"
  })

  await ticket.save()

  const cookie = global.signin()

  let response = await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set("Cookie", cookie)
    .send({
      title: "new title",
      price: 100
    })
    .expect(200)

  expect(response.body.title).toEqual("new title")
  expect(response.body.price).toEqual(100)
})

it("Publishes an event", async () => {
  const ticket = Ticket.build({
    price: 3000,
    title: "concert",
    userId: "1"
  })

  await ticket.save()

  const cookie = global.signin()

  let response = await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set("Cookie", cookie)
    .send({
      title: "new title",
      price: 100
    })
    .expect(200)

  expect(natsWrapper.client.publish).toHaveBeenCalled()
})
