import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: {
        type: String,
        enum: ["student", "instructor", "admin"],
        default: "student",
    },
    avatar: { type: String, default: "" },
    bio: { type: String, default: "" },
    headline: { type: String, default: "" },
    website: { type: String, default: "" },
    phone: { type: String, default: "" },
    socialLinks: {
        twitter: { type: String, default: "" },
        linkedin: { type: String, default: "" },
        github: { type: String, default: "" },
    },
    isPublic: {
        type: Boolean,
        default: true,
    },
    isShadowBanned: {
    type: Boolean,
    default: false,
  },
  isFlagged: {
    type: Boolean,
    default: false,
  },
  moderationNotes: {
    type: String,
    default: "",
  },
  integrations: {
    slackWebhook: { type: String, default: "" },
    slackEnabled: { type: Boolean, default: false },
    discordWebhook: { type: String, default: "" },
    discordEnabled: { type: Boolean, default: false },
    googleCalendarEnabled: { type: Boolean, default: false },
    googleAccessToken: { type: String },
    googleRefreshToken: { type: String },
    googleIdToken: { type: String },
  },
}, { timestamps: true });

// 🔐 hash before save
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// 🔐 compare password
userSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);
