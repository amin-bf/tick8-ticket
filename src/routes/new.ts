import { Request, Response, Router } from "express"
import { body } from "express-validator"

import { requireAuth, validateRequest } from "@vanguardo/common"
import { Ticket } from "../models/ticket"
import { TicketCreatedPublisher } from "../events/publishers/ticket-created-publisher"
import { natsWrapper } from "../nats-wrapper"

const router = Router()

router.post(
  "/api/tickets",
  requireAuth,
  [
    body("title").trim().notEmpty().withMessage("Title is required."),
    body("price")
      .trim()
      .notEmpty()
      .isFloat({ gt: 0 })
      .withMessage("Price is required.")
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body

    const ticket = Ticket.build({
      price,
      title,
      userId: req.currentUser!.id
    })

    await ticket.save()

    await new TicketCreatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId
    })

    res.status(201).json(ticket)
  }
)

export { router as newTicketRouter }
