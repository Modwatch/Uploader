import { UploadUser } from "../../types";

export const getUsers = (): UploadUser[] => {
  const users = localStorage.getItem("modwatch.users");
  if(!users) {
    return [];
  }
  try {
    return JSON.parse(users);
  } catch (e) {
    console.log(`Failed to parse saved users: "${users}"`, e);
    return clearUsers();
  }
};

export const setUsers = (users: UploadUser[]): UploadUser[] => (
  localStorage.setItem("modwatch.users", JSON.stringify(users)), users
);

export const clearUsers = (): [] => (
  localStorage.setItem("modwatch.users", "[]"), []
);
