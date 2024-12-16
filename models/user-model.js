const mongoose = require("mongoose");
const userSchema = mongoose.Schema(
  {
    phone: {
      type: String,
      unique: true,
      required: true,
    },
    name: {
      type: String,
      required: false,
    },
    avatar: {
      type: String,
      required: false,
      // get: (avatar) => {
      //   if (avatar) {
      //     return `${avatar}`;
      //   }
      //   return avatar;
      // },
    },
    activated: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
  }
);
const userModel = mongoose.model("newUsers", userSchema);
module.exports = userModel;
