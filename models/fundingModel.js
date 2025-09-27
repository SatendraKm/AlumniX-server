import mongoose from "mongoose";

const fundingSchema = new mongoose.Schema(
  {
    fundingID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fund",
      required: true,
    },
    fundingFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    transactionID: {
      type: String,
      required: false,
    },
    invoicePdfURL: {
      type: String,
      required: true
    },
    invoiceID: {
      type: String,
      unique: true,
    },
    amount: {
      type: Number,
      required: true
    },
    createdAt: {
      type: Date,
      required: true
    },
    created_for: 
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
      },
  },
  {
    timestamps: true,
  }
);

const Funding = mongoose.model("Funding", fundingSchema);
export default Funding;
