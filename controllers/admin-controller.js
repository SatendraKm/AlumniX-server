import transporter from "../config/nodemailerConfig.js";
import User from "../models/userModel.js";

// Function to make a user a mentor
export const makeMentor = async (req, res) => {
  try {
    const userId = req.params.userid;

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Set the user as a mentor
    if (user.isMentor) {
      return res.status(400).json({ message: "User is already a mentor" });
    }

    user.isMentor = true;
    await user.save();

    res.status(200).json({
      message: "User has been made a mentor successfully",
      user: {
        id: user._id,
        isMentor: user.isMentor,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Function to remove a user's mentor status
export const removeMentor = async (req, res) => {
  try {
    const userId = req.params.userid;

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove mentor status
    if (!user.isMentor) {
      return res.status(400).json({ message: "User is not a mentor" });
    }

    user.isMentor = false;
    await user.save();

    res.status(200).json({
      message: "Mentor status removed successfully",
      user: {
        id: user._id,
        isMentor: user.isMentor,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const bulkmail = async (req, res) => {
  try {
    const { university_id, role, batch, subject, message, email } = req.body; // Assuming university_id, role, batch, and email are sent in the body

    // Validate that subject, message, and email are provided
    if (!subject || !message || !email) {
      return res.status(400).json({ error: "Subject, message, and email are required." });
    }

    // Validate that university_id and role are provided
    if (!university_id || !role) {
      return res.status(400).json({ error: "University ID and role are required." });
    }

    // 1. Find users who belong to the specified university (organization)
    const users = await User.find({ organization: university_id });

    // 2. Filter users by role
    let filteredUsers = users.filter((user) => user.role === role);

    // 3. Further filter students and alumni by batch if provided
    if (role === "student" || role === "alumni") {
      if (batch) {
        filteredUsers = filteredUsers.filter((user) => user.batch === batch);
      }
    }

    // 4. If no users are found after filtering, return a 404
    if (!filteredUsers.length) {
      return res.status(404).json({ message: "No users found for the specified criteria." });
    }

    // 5. Collect the email addresses of filtered users
    const emailAddresses = filteredUsers.map((user) => user.email);

    // Add the email from the request body to the list (avoid duplicates)
    if (!emailAddresses.includes(email)) {
      emailAddresses.push(email);
    }

    // 6. Send email to all users in the list
    const mailOptions = {
      from: process.env.USER,
      to: emailAddresses,
      subject: subject,
      text: message,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: `Emails sent to ${emailAddresses.length} users.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send emails." });
  }
};


// export const bulkmail123 = async (req, res) => {
//   try {
//     const { batch, subject, message } = req.body;

//     if (!batch || !subject || !message) {
//       return res
//         .status(400)
//         .json({ error: "Batch, subject, and message are required." });
//     }

//     // Find users with the specified batch and select their emails
//     const users = await User.find({ batch }).select("email");

//     if (!users.length) {
//       return res
//         .status(404)
//         .json({ message: "No users found for the specified batch." });
//     }

//     const emailAddresses = users.map((user) => user.email);

//     // Send email to all users
//     const mailOptions = {
//       from: process.env.USER,
//       to: emailAddresses,
//       subject: subject,
//       text: message,
//     };

//     await transporter.sendMail(mailOptions);

//     res
//       .status(200)
//       .json({ message: `Emails sent to ${emailAddresses.length} users.` });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Failed to send emails." });
//   }
// };
