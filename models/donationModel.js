import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    projectID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    donationFrom: {
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

const Donation = mongoose.model("Donation", donationSchema);
export default Donation;
