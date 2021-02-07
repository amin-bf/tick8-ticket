import { Router, Response, Request } from "express"
import { body } from "express-validator"
import { NotFoundError } from "@vanguardo/common"

import { Ticket } from "../models/ticket"

const router = Router()

router.get("/api/tickets/:id", async (req: Request, res: Response) => {
  const id = req.params.id

  const ticket = await Ticket.findById(id)

  if (!ticket) throw new NotFoundError()

  res.json(ticket)
})

export { router as showTicketRouter }
