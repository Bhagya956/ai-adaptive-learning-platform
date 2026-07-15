"use client";

import { useEffect, useState } from "react";
import api from "@/src/services/api";

export default function ActivityPage() {

  const [activities, setActivities] =
    useState<any[]>([]);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities =
    async () => {

      try {

        const response =
          await api.get(
            "/activity"
          );

        setActivities(
          response.data
        );

      } catch (error) {

        console.error(error);

      }
    };

  return (
    <div className="p-10">

      <h1 className="text-3xl font-bold mb-8">
        Activity Timeline
      </h1>

      <div className="space-y-4">

        {activities.map(
          (activity) => (
            <div
              key={activity._id}
              className="border rounded-lg p-4 shadow-sm"
            >

              <p className="font-bold">
                {activity.activityType}
              </p>

              <p className="text-gray-700">
                {activity.description}
              </p>

              <p className="text-sm text-gray-500 mt-2">
                {new Date(
                  activity.createdAt
                ).toLocaleString()}
              </p>

            </div>
          )
        )}

      </div>

    </div>
  );
}