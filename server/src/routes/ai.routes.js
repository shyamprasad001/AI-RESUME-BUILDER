import { Router } from "express";
import {
  chat,
  generateBullets,
  generateSummary,
  atsScore,
  review,
  matchJob,
  skillGaps,
  getChatHistory,
} from "../controllers/ai.controller.js";
import authenticate from "../middleware/auth.middleware.js";
import { strictLimiter } from "../middleware/rateLimiter.middleware.js";

const router = Router();

router.use(authenticate);

router.post("/chat", strictLimiter, chat);
router.post("/generate-bullets", strictLimiter, generateBullets);
router.post("/generate-summary", strictLimiter, generateSummary);
router.post("/ats-score", strictLimiter, atsScore);
router.post("/review", strictLimiter, review);
router.post("/match-job", strictLimiter, matchJob);
router.post("/skill-gaps", strictLimiter, skillGaps);
router.get("/chat-history/:resumeId", getChatHistory);

export default router;
