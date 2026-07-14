"use client";

import { useEffect, useState } from "react";
import api from "@/src/services/api";

export default function AdminUsersPage() {
  const [users, setUsers] =
    useState<any[]>([]);

  const [search, setSearch] =
    useState("");

  const [selectedUser, setSelectedUser] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response =
        await api.get(
          "/admin/users"
        );

      setUsers(response.data);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const viewUser = async (
    userId: string
  ) => {
    try {
      const response =
        await api.get(
          `/admin/users/${userId}`
        );

      setSelectedUser(
        response.data
      );

    } catch (error) {
      console.error(error);
    }
  };

  const deleteUser = async (
    userId: string
  ) => {
    const confirmed =
      window.confirm(
        "Delete this user?"
      );

    if (!confirmed) return;

    try {
      await api.delete(
        `/admin/users/${userId}`
      );

      fetchUsers();

      if (
        selectedUser?._id ===
        userId
      ) {
        setSelectedUser(
          null
        );
      }

    } catch (error) {
      console.error(error);
    }
  };

  const filteredUsers =
    users.filter((user) =>
      user.name
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        ) ||
      user.email
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  if (loading) {
    return (
      <div className="p-10">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-10">

      <h1 className="text-3xl font-bold mb-6">
        User Management
      </h1>

      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) =>
          setSearch(
            e.target.value
          )
        }
        className="border rounded px-4 py-2 mb-6 w-full"
      />

      <div className="border rounded overflow-hidden">

        <table className="w-full">

          <thead>

            <tr className="bg-gray-100">

              <th className="p-3 text-left">
                Name
              </th>

              <th className="p-3 text-left">
                Email
              </th>

              <th className="p-3 text-left">
                Role
              </th>

              <th className="p-3 text-left">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredUsers.map(
              (user) => (
                <tr
                  key={user._id}
                  className="border-t"
                >
                  <td className="p-3">
                    {user.name}
                  </td>

                  <td className="p-3">
                    {user.email}
                  </td>

                  <td className="p-3">
                    {user.role}
                  </td>

                  <td className="p-3 space-x-2">

                    <button
                      onClick={() =>
                        viewUser(
                          user._id
                        )
                      }
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                    >
                      View
                    </button>

                    <button
                      onClick={() =>
                        deleteUser(
                          user._id
                        )
                      }
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>

                  </td>

                </tr>
              )
            )}

          </tbody>

        </table>

      </div>

      {selectedUser && (
        <div className="mt-8 border rounded p-6">

          <h2 className="text-2xl font-bold mb-4">
            User Details
          </h2>

          <p>
            <strong>Name:</strong>
            {" "}
            {selectedUser.name}
          </p>

          <p>
            <strong>Email:</strong>
            {" "}
            {selectedUser.email}
          </p>

          <p>
            <strong>Role:</strong>
            {" "}
            {selectedUser.role}
          </p>

          <p>
            <strong>Experience:</strong>
            {" "}
            {
              selectedUser.experience
            }
          </p>

          <p>
            <strong>Career Goal:</strong>
            {" "}
            {
              selectedUser.careerGoal
            }
          </p>

        </div>
      )}

    </div>
  );
}