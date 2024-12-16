const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roomSchema = new Schema(
  {
    topic: { type: String, required: true },
    roomType: { type: String, required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "newUsers" },
    speakers: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "newUsers",
        },
      ],
      required: false,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Room", roomSchema, "rooms");
