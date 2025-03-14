import express from "express";
import {
  getAllProfiles,
  getProfileById,
  createProfile,
  updateProfile,
  deleteProfile,
  addExperience,
  deleteExperience,
  addSkill,
  deleteSkill,
  updateInformation,
} from "./controller";

const router = express.Router();

router.get("/", getAllProfiles);
router.get("/:id", getProfileById);
router.post("/", createProfile);
router.put("/:id", updateProfile);
router.delete("/:id", deleteProfile);

router.post("/:id/experience", addExperience);
router.delete("/:id/experience/:exp", deleteExperience);

router.post("/:id/skills", addSkill);
router.delete("/:id/skills/:skill", deleteSkill);

router.put("/:id/information", updateInformation);

export default router;
