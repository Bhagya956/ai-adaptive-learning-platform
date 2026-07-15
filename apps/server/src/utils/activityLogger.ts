import Activity
from "../models/activity.model";

export const logActivity =
  async (
    userId: string,
    activityType: string,
    description: string
  ) => {

    try {

      await Activity.create({
        userId,
        activityType,
        description,
      });

    } catch (error) {

      console.error(
        "ACTIVITY LOG ERROR:",
        error
      );

    }
  };