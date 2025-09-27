import mongoose from "mongoose";

const fundSchema = new mongoose.Schema(
  {

    title: {
      type: String,
      required: [true, "Title is required"],
    },
    fundImage: {
      type: String,
      default: "",
      validate: {
        validator: function (v) {
          return (
            v === "" || /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg))$/i.test(v)
          );
        },
        message: "fund picture must be a valid URL to an image file",
      },
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    currentAmount: {
      type: Number,
      default: 0,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Fund = mongoose.model("Fund", fundSchema);
export default Fund;
