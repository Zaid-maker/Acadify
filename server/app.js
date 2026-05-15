import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { setupSwagger } from "./config/swagger.js";

// Routes imports
import courseRoutes from "./routes/course.routes.js";
import sectionRoutes from "./routes/section.routes.js";
import lectureRoutes from "./routes/lecture.routes.js";
import enrollmentRoutes from "./routes/enrollment.routes.js";
import authRoutes from "./routes/auth.routes.js";
import progressRoutes from "./routes/progress.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import certificateRoutes from "./routes/certificate.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import moderationRoutes from "./routes/moderation.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import integrationRoutes from "./routes/integration.routes.js";
import statsRoutes from "./routes/stats.routes.js";
import liveSessionRoutes from "./routes/liveSession.routes.js";

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Setup Swagger
setupSwagger(app);

// Routes
app.use("/api/stats", statsRoutes);
app.use("/api/courses", courseRoutes)
app.use("/api/sections", sectionRoutes);
app.use("/api/lectures", lectureRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/moderation", moderationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/integrations", integrationRoutes);
app.use("/api/live-sessions", liveSessionRoutes);

app.get("/api", (req, res) => {
  res.json({ message: "API running..." });
});

export default app;
