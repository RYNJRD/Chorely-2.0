import type { Express } from "express";
import type { Server } from "http";
import { storage, isUserAdminOfFamily } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post(api.families.create.path, async (req, res) => {
    try {
      const input = api.families.create.input.parse(req.body);
      const family = await storage.createFamily(input);
      res.status(201).json(family);
    } catch (e) {
      if (e instanceof z.ZodError) res.status(400).json({ message: e.errors[0].message });
      else res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.families.get.path, async (req, res) => {
    const family = await storage.getFamily(Number(req.params.id));
    if (!family) return res.status(404).json({ message: "Not found" });
    res.json(family);
  });

  app.get(api.families.getByCode.path, async (req, res) => {
    const family = await storage.getFamilyByCode(req.params.code);
    if (!family) return res.status(404).json({ message: "Not found" });
    res.json(family);
  });

  app.get(api.families.getUsers.path, async (req, res) => {
    const users = await storage.getFamilyUsers(Number(req.params.id));
    res.json(users);
  });

  app.get(api.families.getChores.path, async (req, res) => {
    const chores = await storage.getFamilyChores(Number(req.params.id));
    res.json(chores);
  });

  app.get(api.families.getLeaderboard.path, async (req, res) => {
    const users = await storage.getFamilyUsers(Number(req.params.id));
    res.json(users);
  });

  app.get(api.families.getInviteInfo.path, async (req, res) => {
    const familyId = Number(req.params.id);
    const userId = Number(req.query.userId);
    
    if (!userId || isNaN(userId) || isNaN(familyId)) {
      return res.status(400).json({ message: "Invalid request" });
    }
    
    const isAdmin = await isUserAdminOfFamily(userId, familyId);
    
    if (!isAdmin) {
      return res.status(403).json({ message: "Only admins can view invite codes" });
    }
    
    const family = await storage.getFamily(familyId);
    if (!family) {
      return res.status(404).json({ message: "Family not found" });
    }
    
    const inviteUrl = `${req.protocol}://${req.get('host')}/join/${family.inviteCode}`;
    res.json({ inviteCode: family.inviteCode, inviteUrl });
  });

  app.post(api.users.create.path, async (req, res) => {
    try {
      const input = api.users.create.input.parse(req.body);
      if (input.firebaseUid) {
        const existing = await storage.getUserByFirebaseUid(input.firebaseUid);
        if (existing) {
          return res.status(409).json({ message: "Account already has a profile", user: existing });
        }
      }
      const user = await storage.createUser(input);
      res.status(201).json(user);
    } catch (e) {
      if (e instanceof z.ZodError) res.status(400).json({ message: e.errors[0].message });
      else res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.users.get.path, async (req, res) => {
    const user = await storage.getUser(Number(req.params.id));
    if (!user) return res.status(404).json({ message: "Not found" });
    res.json(user);
  });

  app.patch(api.users.updateAvatar.path, async (req, res) => {
    try {
      const input = api.users.updateAvatar.input.parse(req.body);
      const user = await storage.updateUserAvatar(Number(req.params.id), input.avatarConfig);
      res.json(user);
    } catch (e) {
      if (e instanceof z.ZodError) res.status(400).json({ message: e.errors[0].message });
      else res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch(api.users.toggleLeaderboard.path, async (req, res) => {
    try {
      const input = api.users.toggleLeaderboard.input.parse(req.body);
      const userId = Number(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user id" });
      }
      const user = await storage.updateUserLeaderboard(userId, input.hideFromLeaderboard);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (e) {
      if (e instanceof z.ZodError) res.status(400).json({ message: e.errors[0].message });
      else res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.users.getByFirebaseUid.path, async (req, res) => {
    const user = await storage.getUserByFirebaseUid(req.params.uid);
    if (!user) return res.status(404).json({ message: "Not found" });
    res.json(user);
  });

  app.patch(api.users.updateRole.path, async (req, res) => {
    try {
      const input = api.users.updateRole.input.parse(req.body);
      const userId = Number(req.params.id);
      const requestingUserId = Number(req.query.requestingUserId);
      if (isNaN(userId) || isNaN(requestingUserId)) {
        return res.status(400).json({ message: "Invalid request" });
      }
      const targetUser = await storage.getUser(userId);
      if (!targetUser || !targetUser.familyId) {
        return res.status(404).json({ message: "User not found" });
      }
      const isAdmin = await isUserAdminOfFamily(requestingUserId, targetUser.familyId);
      if (!isAdmin) {
        return res.status(403).json({ message: "Only admins can change roles" });
      }
      const user = await storage.updateUserRole(userId, input.role);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (e) {
      if (e instanceof z.ZodError) res.status(400).json({ message: e.errors[0].message });
      else res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.messages.list.path, async (req, res) => {
    const msgs = await storage.getMessages(Number(req.params.id));
    res.json(msgs);
  });

  app.post(api.messages.create.path, async (req, res) => {
    try {
      const input = api.messages.create.input.parse(req.body);
      const msg = await storage.createMessage(input);
      res.status(201).json(msg);
    } catch (e) {
      if (e instanceof z.ZodError) res.status(400).json({ message: e.errors[0].message });
      else res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.chores.create.path, async (req, res) => {
    try {
      const input = api.chores.create.input.parse(req.body);
      const chore = await storage.createChore(input);
      res.status(201).json(chore);
    } catch (e) {
      if (e instanceof z.ZodError) res.status(400).json({ message: e.errors[0].message });
      else res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch(api.chores.update.path, async (req, res) => {
    try {
      const input = api.chores.update.input.parse(req.body);
      const chore = await storage.updateChore(Number(req.params.id), input);
      res.json(chore);
    } catch (e) {
      if (e instanceof z.ZodError) res.status(400).json({ message: e.errors[0].message });
      else res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.chores.complete.path, async (req, res) => {
    try {
      const input = api.chores.complete.input.parse(req.body);
      const result = await storage.completeChore(Number(req.params.id), input.userId);
      res.json(result);
    } catch (e) {
      if (e instanceof z.ZodError) res.status(400).json({ message: e.errors[0].message });
      else res.status(404).json({ message: e instanceof Error ? e.message : "Not found" });
    }
  });

  app.get(api.rewards.list.path, async (req, res) => {
    const rewards = await storage.getRewards(Number(req.params.id));
    res.json(rewards);
  });

  app.post(api.rewards.create.path, async (req, res) => {
    try {
      const input = api.rewards.create.input.parse(req.body);
      const reward = await storage.createReward(input);
      res.status(201).json(reward);
    } catch (e) {
      if (e instanceof z.ZodError) res.status(400).json({ message: e.errors[0].message });
      else res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.rewards.claim.path, async (req, res) => {
    try {
      const input = api.rewards.claim.input.parse(req.body);
      const result = await storage.claimReward(Number(req.params.id), input.userId, input.quantity);
      res.json(result);
    } catch (e) {
      if (e instanceof z.ZodError) res.status(400).json({ message: e.errors[0].message });
      else res.status(400).json({ message: e instanceof Error ? e.message : "Error claiming reward" });
    }
  });

  app.post(api.demo.setup.path, async (req, res) => {
    try {
      const family = await storage.getOrCreateCurrentDemo();
      res.status(201).json(family);
    } catch (e) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
