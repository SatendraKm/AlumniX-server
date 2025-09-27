import mongoose from "mongoose";


const reunionSchema = new mongoose.Schema({
  typeOfEvent: {
    type: String,
    required: true,
    enum: ['Alumni Meet', 'Batch Reunion', 'Farewell', 'Other'],
  },
  batch: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  venue: {
    type: String,
    required: true,
  },
  organizedBy: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  reunionphoto: {
    type: String,
    default: "",
  },
  contact: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^[0-9]{10}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid contact number!`,
    },
  },
  eligibility: {
    type: String,
    required: false,
    default: 'Open to all batches',
  },
  created_for: 
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
      },
}, {
  timestamps: true,
});




const Reunion = mongoose.model("Reunion", reunionSchema);

export default Reunion;
