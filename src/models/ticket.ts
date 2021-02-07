import mongoose from "mongoose"

// An interface to describe the properties of new user
interface ITicketAttrs {
  title: string
  price: number
  userId: string
}

// An interface to describe the properties of User Model
interface TicketModel extends mongoose.Model<ITicketDoc> {
  build(userAttrs: ITicketAttrs): ITicketDoc
}

// An interface to describe properties of UserDoc
interface ITicketDoc extends mongoose.Document {
  _id: object
  title: string
  price: number
  userId: string
  updatedAt: string
  createdAt: string
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    userId: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret, options) => {
        delete ret.__v
        ret.id = ret._id
        delete ret._id
      }
    }
  }
)

ticketSchema.statics.build = (ticketDoc: ITicketAttrs): ITicketDoc => {
  return new Ticket(ticketDoc)
}

const Ticket = mongoose.model<ITicketDoc, TicketModel>("Ticket", ticketSchema)

export { Ticket, ITicketDoc }
