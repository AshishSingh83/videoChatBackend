const mongoose = require("mongoose");
const refreshSchema = mongoose.Schema(
  {
    token: {
      type: String,
      unique: true,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "newUsers",
      required: true, // Optional: if every token must have a user
    },
  },
  {
    timestamps: true, // Fixed the typo
  }
);

const RefreshToken = mongoose.model("RefreshToken", refreshSchema);

module.exports = RefreshToken;
