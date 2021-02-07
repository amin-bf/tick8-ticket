import { ITicketUpdatedEvent, Publisher, Subjects } from "@vanguardo/common"

export class TicketUpdatedPublisher extends Publisher<ITicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated
}
