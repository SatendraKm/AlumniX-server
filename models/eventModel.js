import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Event title is required"],
    },
    eventphoto: {
      type: String,
      default: "",
      validate: {
        validator: function (v) {
          return (
            v === "" || /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg))$/i.test(v)
          );
        },
        message: "event picture must be a valid URL to an image file",
      },
    },
    type: {
      type: String,
      enum: ["workshop", "seminar", "conference", "webinar", "training"],
      required: [true, "Event type is required"],
    },
    mode: {
      type: String,
      enum: ["Online", "Offline"],
      required: [true, "Mode of event (Online/Offline) is required"],
    },
    venue: {
      type: String,
      default: "",
    },
    link: {
      type: String,
      default: "",
    },
    date: {
      type: Date,
      required: [true, "Event date is required"],
    },
    time: {
      type: String,
      required: [true, "Event time is required"],
    },
    eventDescription: {
      type: String,
      required: [true, "Event description is required"],
    },

    eventCoordinator: {
      type: String,
      default: "",
    },

    coordinatorphone: {
      type: String,
      validate: {
        validator: function (v) {
          return /\d{10}/.test(v); // Ensures a 10-digit phone number
        },
        message: "Phone must contain exactly 10 digits!",
      },
    },
    tagsTopic: {
      type: [String],
      required: true,
      validate: {
        validator: function (tagsTopicArray) {
          return tagsTopicArray.length > 0;
        },
        message: "At least one Tag/Topic is required.",
      },
    },
    eligibility: {
      type: String,
      default: "",
    },
    speaker: {
      type: String,
      default: "",
    },
    organizedBy: {
      type: String,
      default: "",
    },

    reminder: {
      type: String,
      enum: ["15 minutes before", "30 minutes before", "1 hour before"],
      default: "15 minutes before",
    },
    registeredUser: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to users who liked the event
      },
    ],
    dislikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to users who disliked the event
      },
    ],
    created_for: 
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
      },
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);

export default Event;
