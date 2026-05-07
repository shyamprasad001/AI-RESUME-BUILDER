// ============================================
// routes/index.js - Central Route Registry
// ============================================
// This file combines all route modules into one.
// All routes are prefixed with /api in app.js:
//   app.use('/api', routes);
//
// So the final URLs are:
//   /api/auth/...
//   /api/resumes/...
//   /api/ai/...
//   /api/versions/...
// Reference: Router, app.use() - reference-backend.md
// ============================================

import { Router } from 'express';
import authRoutes from './auth.routes.js';

// TODO: Import resume, ai, and version routes as you build them
import resumeRoutes from "./resume.routes.js";
import aiRoutes from "./ai.routes.js";
import versionRoutes from "./version.routes.js";


const router = Router();

// Mount route modules
router.use('/auth', authRoutes);           // → /api/auth/...

// TODO: Mount resume, ai, and version routes as you build them
router.use("/resumes", resumeRoutes);
router.use("/ai", aiRoutes);
router.use("/versions", versionRoutes);

export default router;
