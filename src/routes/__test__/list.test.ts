import request from "supertest"
import { app } from "../../app"
import { Ticket } from "../../models/ticket"

const createTicket = async () => {
  const ticket = Ticket.build({
    price: 300,
    title: "A Ticket",
    userId: "334k2hk5hgjh5"
  })

  await ticket.save()
}

it("has a route handler that listens to /api/tickets get requests", async () => {
  await request(app).get("/api/tickets").send().expect(200)
})

it("will return an array of all tickets", async () => {
  await createTicket()
  await createTicket()
  await createTicket()
  await createTicket()

  const response = await request(app).get("/api/tickets").send().expect(200)

  expect(response.body.length).toEqual(4)
})
