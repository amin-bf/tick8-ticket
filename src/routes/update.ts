import {
  NotAuthorizedError,
  requireAuth,
  validateRequest
} from "@vanguardo/common"
import { Router, Request, Response } from "express"
import { body } from "express-validator"
import { TicketUpdatedPublisher } from "../events/publishers/ticket-updated-publisher"

import { Ticket, ITicketDoc } from "../models/ticket"
import { natsWrapper } from "../nats-wrapper"

const router = Router()

router.put(
  "/api/tickets/:id",
  requireAuth,
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("price")
      .trim()
      .notEmpty()
      .isFloat({ gt: 0 })
      .withMessage("Price must be a number greater than 0")
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const ticket: ITicketDoc = await Ticket.findById(req.params.id)

    if (ticket.userId.toString() !== req.currentUser!.id.toString())
      throw new NotAuthorizedError()

    const { title, price } = req.body

    ticket.title = title
    ticket.price = price

    await ticket.save()

    await new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId
    })

    res.send(ticket)
  }
)

export { router as ticketUpdateRouter }
