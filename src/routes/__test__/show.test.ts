import mongoose from "mongoose"
import request from "supertest"
import { app } from "../../app"

it("returns a ticket provided the id", async () => {
  const cookie = global.signin()
  const title = "A Ticket"
  const price = 3000

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title,
      price
    })

  const tickerResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200)

  expect(tickerResponse.body.title).toEqual(title)
  expect(tickerResponse.body.price).toEqual(price)
})
