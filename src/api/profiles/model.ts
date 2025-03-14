import mongoose from "mongoose";

const userProfileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  experience: [
    {
      _id: mongoose.Schema.Types.ObjectId,
      titre: String,
      entreprise: String,
      dates: String,
      description: String,
    },
  ],
  skills: [String],
  information: {
    bio: String,
    localisation: String,
    siteWeb: String,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
});

const UserProfile = mongoose.model("UserProfile", userProfileSchema);

export default UserProfile;
