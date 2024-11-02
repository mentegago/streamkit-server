import type { Request, Response } from "express";
import { getUserInfo } from "../services/twitchService";

/**
 * Controller to handle fetching user info from Twitch
 */
export const getUserInfoController = async (req: Request, res: Response) => {
  const username = req.params.username;

  try {
    const userInfo = await getUserInfo(username);

    if (!userInfo) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({
      id: userInfo.id,
      login: userInfo.login,
      display_name: userInfo.display_name,
      profile_image_url: userInfo.profile_image_url,
      type: userInfo.type,
      broadcaster_type: userInfo.broadcaster_type,
      description: userInfo.description,
      view_count: userInfo.view_count,
      offline_image_url: userInfo.offline_image_url,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
