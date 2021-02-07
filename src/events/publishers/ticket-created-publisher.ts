import { ITicketCreatedEvent, Publisher, Subjects } from "@vanguardo/common"

export class TicketCreatedPublisher extends Publisher<ITicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated
}
