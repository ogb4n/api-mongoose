import { Request, Response } from "express";
import UserProfile from "./model";

// Récupérer tous les profils avec fonctionnalités de recherche et filtrage
export const getAllProfiles = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      search,
      skills,
      location,
      page = "1",
      limit = "10",
      sort = "name",
    } = req.query;

    const query: any = { deleted: { $ne: true } };

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (skills) {
      const skillsArray = Array.isArray(skills)
        ? skills
        : skills.toString().split(",");
      query.skills = { $in: skillsArray };
    }

    if (location) {
      query["information.localisation"] = { $regex: location, $options: "i" };
    }

    const pageNum = parseInt(page.toString(), 10);
    const limitNum = parseInt(limit.toString(), 10);
    const skip = (pageNum - 1) * limitNum;

    const profiles = await UserProfile.find(query)
      .sort(
        sort.toString().startsWith("-")
          ? { [sort.toString().substring(1)]: -1 }
          : { [sort.toString()]: 1 }
      )
      .skip(skip)
      .limit(limitNum);

    const total = await UserProfile.countDocuments(query);

    res.status(200).json({
      profiles,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des profils", error });
  }
};

// Récupérer un profil par ID
export const getProfileById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const profile = await UserProfile.findOne({
      _id: req.params.id,
      deleted: { $ne: true },
    });
    if (!profile) {
      res.status(404).json({ message: "Profil non trouvé" });
      return;
    }
    res.status(200).json(profile);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération du profil", error });
  }
};

// Créer un nouveau profil (uniquement nom et email)
export const createProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      res.status(400).json({ message: "Le nom et l'email sont requis" });
      return;
    }

    const newProfile = new UserProfile({
      name,
      email,
      experience: [],
      skills: [],
      information: {},
    });

    const savedProfile = await newProfile.save();
    res.status(201).json(savedProfile);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la création du profil", error });
  }
};

// Mettre à jour un profil par ID (uniquement nom et email)
export const updateProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email } = req.body;

    if (!name && !email) {
      res.status(400).json({ message: "Le nom ou l'email doit être fourni" });
      return;
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const updatedProfile = await UserProfile.findOneAndUpdate(
      { _id: req.params.id, deleted: { $ne: true } },
      { $set: updateData },
      { new: true }
    );

    if (!updatedProfile) {
      res.status(404).json({ message: "Profil non trouvé" });
      return;
    }

    res.status(200).json(updatedProfile);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour du profil", error });
  }
};

// Supprimer un profil par ID (Soft-Delete)
export const deleteProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const deletedProfile = await UserProfile.findByIdAndUpdate(
      req.params.id,
      { $set: { deleted: true } },
      { new: true }
    );

    if (!deletedProfile) {
      res.status(404).json({ message: "Profil non trouvé" });
      return;
    }

    res.status(200).json({ message: "Profil supprimé avec succès" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression du profil", error });
  }
};

// Ajouter une expérience à un profil
export const addExperience = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { titre, entreprise, dates, description } = req.body;

    if (!titre || !entreprise) {
      res.status(400).json({ message: "Le titre et l'entreprise sont requis" });
      return;
    }

    const profile = await UserProfile.findOneAndUpdate(
      { _id: req.params.id, deleted: { $ne: true } },
      { $push: { experience: { titre, entreprise, dates, description } } },
      { new: true }
    );

    if (!profile) {
      res.status(404).json({ message: "Profil non trouvé" });
      return;
    }

    res.status(201).json(profile);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de l'ajout de l'expérience", error });
  }
};

// Supprimer une expérience d'un profil
export const deleteExperience = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const profile = await UserProfile.findOneAndUpdate(
      { _id: req.params.id, deleted: { $ne: true } },
      { $pull: { experience: { _id: req.params.exp } } },
      { new: true }
    );

    if (!profile) {
      res.status(404).json({ message: "Profil ou expérience non trouvé" });
      return;
    }

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la suppression de l'expérience",
      error,
    });
  }
};

// Ajouter une compétence à un profil
export const addSkill = async (req: Request, res: Response): Promise<void> => {
  try {
    const skill = req.body.skill;

    if (!skill) {
      res.status(400).json({ message: "La compétence est requise" });
      return;
    }

    const profile = await UserProfile.findOneAndUpdate(
      { _id: req.params.id, deleted: { $ne: true } },
      { $addToSet: { skills: skill } },
      { new: true }
    );

    if (!profile) {
      res.status(404).json({ message: "Profil non trouvé" });
      return;
    }

    res.status(201).json(profile);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de l'ajout de la compétence", error });
  }
};

// Supprimer une compétence d'un profil
export const deleteSkill = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const profile = await UserProfile.findOneAndUpdate(
      { _id: req.params.id, deleted: { $ne: true } },
      { $pull: { skills: req.params.skill } },
      { new: true }
    );

    if (!profile) {
      res.status(404).json({ message: "Profil non trouvé" });
      return;
    }

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la suppression de la compétence",
      error,
    });
  }
};

// Mettre à jour les informations d'un profil
export const updateInformation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { bio, localisation, siteWeb } = req.body;

    const updateData: any = {};
    if (bio !== undefined) updateData["information.bio"] = bio;
    if (localisation !== undefined)
      updateData["information.localisation"] = localisation;
    if (siteWeb !== undefined) updateData["information.siteWeb"] = siteWeb;

    if (Object.keys(updateData).length === 0) {
      res
        .status(400)
        .json({ message: "Aucune information fournie pour la mise à jour" });
      return;
    }

    const profile = await UserProfile.findOneAndUpdate(
      { _id: req.params.id, deleted: { $ne: true } },
      { $set: updateData },
      { new: true }
    );

    if (!profile) {
      res.status(404).json({ message: "Profil non trouvé" });
      return;
    }

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la mise à jour des informations",
      error,
    });
  }
};
