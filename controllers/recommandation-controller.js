import Event from "../models/eventModel.js";
import User from "../models/userModel.js";

export const getSuggestedUsers = async (req, res) => {
  try {
    const targetUserId = req.params.userId;

    // Fetch the target user by ID
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Extract the target user's skills
    const targetSkills = targetUser.skills.map((skill) => skill.skillName);

    // Exclude the target user and users the target user is following
    const followingSet = new Set(
      targetUser.following.map((id) => id.toString())
    );
    followingSet.add(targetUserId);

    // Fetch all other users excluding the target user
    const allUsers = await User.find({ _id: { $nin: [...followingSet] } });






    // Filter users based on matched skills
    const matchedUsers = allUsers.filter((user) => {
      const userSkills = user.skills.map((skill) => skill.skillName);
      return userSkills.some((skill) => targetSkills.includes(skill));
    });

    // Sort matched users by the number of shared skills
    const sortedMatchedUsers = matchedUsers
      .map((user) => {
        const userSkills = user.skills.map((skill) => skill.skillName);
        const sharedSkills = userSkills.filter((skill) =>
          targetSkills.includes(skill)
        );
        return { userId: user._id, matchScore: sharedSkills.length };
      })
      .sort((a, b) => b.matchScore - a.matchScore);

    // Get up to 3 matched users
    const matchedUserIds = sortedMatchedUsers
      .slice(0, 3)
      .map((user) => user.userId);

    // If less than 3 matched users, fill the rest with random users
    if (matchedUserIds.length < 3) {
      const matchedUserIdsSet = new Set(
        matchedUserIds.map((id) => id.toString())
      );

      // Get random users excluding the matched users and following users
      const remainingUsers = allUsers.filter(
        (user) => !matchedUserIdsSet.has(user._id.toString())
      );

      const randomUserIds = remainingUsers
        .map((user) => user._id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3 - matchedUserIds.length);

      matchedUserIds.push(...randomUserIds);
    }

    res.json({ success: true, data: matchedUserIds });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUpcomingEvents = async (req, res) => {
  try {
    // Get the current date and time
    const currentDate = new Date();

    // Fetch the next three upcoming events sorted by date
    const upcomingEvents = await Event.find({ date: { $gte: currentDate } })
      .sort({ date: 1 })
      .limit(3)
      .select("_id"); // Select only the event ID

    // Extract only the IDs from the documents
    const eventIds = upcomingEvents.map((event) => event._id);

    // Check if events are found
    if (eventIds.length === 0) {
      return res.status(404).json({ message: "No upcoming events found" });
    }

    res.status(200).json(eventIds);
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
};
