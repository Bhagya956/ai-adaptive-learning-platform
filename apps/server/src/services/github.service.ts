import axios from "axios";

export const getGithubProfile =
  async (
    username: string
  ) => {
    const profileResponse =
      await axios.get(
        `https://api.github.com/users/${username}`
      );

    const reposResponse =
      await axios.get(
        `https://api.github.com/users/${username}/repos`
      );

    return {
      profile:
        profileResponse.data,
      repos:
        reposResponse.data,
    };
  };