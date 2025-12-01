import mongoose from "mongoose";

const policySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["shipping", "return", "payment", "privacy", "terms"],
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Policy", policySchema);
