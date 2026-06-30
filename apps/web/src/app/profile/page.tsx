"use client";

import { useEffect, useState } from "react";

import api from "@/src/services/api";

interface Profile {
  name: string;
  email: string;
  currentRole: string;
  experience: number;                   
  skills: string[];
  interestedDomains: string[];
  careerGoal: string;
  education: string;
}

export default function ProfilePage() {
  const [profile, setProfile] =
    useState<Profile | null>(null);
    const [skillInput, setSkillInput] =
  useState("");

const [domainInput, setDomainInput] =
  useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = JSON.parse(
        localStorage.getItem("auth-storage") || "{}"
      )?.state?.token;

      const response = await api.get(
        "/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProfile(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const updateProfile = async () => {
  try {
    const token = JSON.parse(
      localStorage.getItem("auth-storage") || "{}"
    )?.state?.token;

    await api.put(
      "/profile",
      profile,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Profile updated successfully");
  } catch (error) {
    console.error(error);
  }
};


const addSkill = () => {
  if (!profile || !skillInput.trim())
    return;

  setProfile({
    ...profile,
    skills: [
      ...profile.skills,
      skillInput,
    ],
  });

  setSkillInput("");
};

const removeSkill = (
  index: number
) => {
  if (!profile) return;

  const updatedSkills =
    profile.skills.filter(
      (_, i) => i !== index
    );

  setProfile({
    ...profile,
    skills: updatedSkills,
  });
};

const addDomain = () => {
  if (
    !profile ||
    !domainInput.trim()
  )
    return;

  setProfile({
    ...profile,
    interestedDomains: [
      ...profile.interestedDomains,
      domainInput,
    ],
  });

  setDomainInput("");
};


const removeDomain = (
  index: number
) => {
  if (!profile) return;

  const updatedDomains =
    profile.interestedDomains.filter(
      (_, i) => i !== index
    );

  setProfile({
    ...profile,
    interestedDomains:
      updatedDomains,
  });
};
  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">
        Profile
      </h1>

      {profile ? (
        <div className="space-y-3">
          <p>
            <strong>Name:</strong>{" "}
            {profile.name}
          </p>

          <p>
            <strong>Email:</strong>{" "}
            {profile.email}
          </p>

     <div>
  <label className="font-bold">
    Current Role
  </label>

  <input
    type="text"
    value={profile.currentRole}
    onChange={(e) =>
      setProfile({
        ...profile,
        currentRole:
          e.target.value,
      })
    }
    className="border p-2 rounded w-full"
  />
</div>

       <div>
  <label className="font-bold">
    Experience (Years)
  </label>

  <input
    type="number"
    value={profile.experience}
    onChange={(e) =>
      setProfile({
        ...profile,
        experience: Number(
          e.target.value
        ),
      })
    }
    className="border p-2 rounded w-full"
  />
</div>

      <div>
  <label className="font-bold">
    Career Goal
  </label>

  <input
    type="text"
    value={profile.careerGoal}
    onChange={(e) =>
      setProfile({
        ...profile,
        careerGoal:
          e.target.value,
      })
    }
    className="border p-2 rounded w-full"
  />
</div>

          <div className="mt-6">
  <h2 className="font-bold">
    Interested Domains
  </h2>

  <div className="flex gap-2 mt-2">
    <input
      type="text"
      value={domainInput}
      onChange={(e) =>
        setDomainInput(
          e.target.value
        )
      }
      placeholder="Add Domain"
      className="border p-2 rounded"
    />

    <button
      onClick={addDomain}
      className="bg-green-500 text-white px-3 py-2 rounded"
    >
      Add
    </button>
  </div>

  <div className="mt-4">
    {profile?.interestedDomains.map(
      (domain, index) => (
        <div
          key={index}
          className="flex items-center gap-3 mb-2"
        >
          <span>{domain}</span>

          <button
            onClick={() =>
              removeDomain(index)
            }
            className="bg-red-500 text-white px-2 rounded"
          >
            Remove
          </button>
        </div>
      )
    )}
  </div>
</div>

          <div className="mt-6">
  <h2 className="font-bold">
    Skills
  </h2>

  <div className="flex gap-2 mt-2">
    <input
      type="text"
      value={skillInput}
      onChange={(e) =>
        setSkillInput(
          e.target.value
        )
      }
      placeholder="Add Skill"
      className="border p-2 rounded"
    />

    <button
      onClick={addSkill}
      className="bg-green-500 text-white px-3 py-2 rounded"
    >
      Add
    </button>
  </div>

  <div className="mt-4">
    {profile?.skills.map(
      (skill, index) => (
        <div
          key={index}
          className="flex items-center gap-3 mb-2"
        >
          <span>{skill}</span>

          <button
            onClick={() =>
              removeSkill(index)
            }
            className="bg-red-500 text-white px-2 rounded"
          >
            Remove
          </button>
        </div>
      )
    )}
  </div>
</div>



   <div>
  <label className="font-bold">
    Education
  </label>

  <input
    type="text"
    value={profile.education}
    onChange={(e) =>
      setProfile({
        ...profile,
        education:
          e.target.value,
      })
    }
    className="border p-2 rounded w-full"
  />
</div>
          <button
  onClick={updateProfile}
  className="bg-blue-500 text-white px-4 py-2 rounded"
>
  Save Profile
</button>
        </div>

      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}