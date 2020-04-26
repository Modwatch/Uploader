import createStore from "unistore";
import jwtDecode from "jwt-decode";

import { Notification, RemoveFirstFromTuple } from "@modwatch/types";
import { UploadUser, UploadFiles } from "../../types";
import { addNotification, removeNotification } from "@modwatch/core/src/store/index";

import { clearUserState, setUserState, getUserState, getUsers } from "./local";
import { getToken } from "./ipc";

const localUser = getUserState();
const localUsers = getUsers();

export type GlobalState = {
  users: UploadUser[];
  user: UploadUser;
  notifications: Notification[];
  awaitingIpc: boolean;
}
export type GlobalActions = {
  login(props?: {token: string}): Promise<void>,
  logout(): void,
  addFiles(files: UploadFiles),
  addNotification(...args: RemoveFirstFromTuple<Parameters<typeof addNotification>>): void,
  removeNotification(...args: RemoveFirstFromTuple<Parameters<typeof removeNotification>>): void
};

export const rawState: GlobalState = {
  users: localUsers,
  user: {
    username: undefined,
    scopes: [],
    files: {},
    ...localUser,
    authenticated: false
  },
  awaitingIpc: false,
  notifications: []
};

let _store = createStore(rawState);

export const store = _store;

export const actions = store => ({
  async login(state: GlobalState, props?: {
    token: string
  }) {
    let { token } = props || {};
    if(!token) {
      store.setState({
        awaitingIpc: true
      });
      try {
        token = await getToken();
      } catch(e) {
        store.setState({
          awaitingIpc: false,
          user: clearUserState()
        });
        throw e;
      }
      store.setState({
        awaitingIpc: false
      });
      const { sub, scopes } = jwtDecode(token);
      setUserState({
        token,
        authenticated: true,
        username: sub,
        files: {},
        scopes
      });
    }
    const { user, users } = store.getState();
    const userIndex = users.findIndex(({ username }) => username === user.username);
    return {
      user,
      users: userIndex !== -1 ? [
        ...users.slice(0, userIndex),
        user,
        ...users.slice(userIndex + 1)
      ] : users.concat(user)
    };
  },
  logout({ user, users }: GlobalState) {
    const userIndex = users.findIndex(({ username }) => username === user.username);
    return {
      user: clearUserState(),
      users: userIndex !== -1 ? [
        ...users.slice(0, userIndex),
        ...users.slice(userIndex + 1)
      ] : users
    };
  },
  addFiles({ user, users }: GlobalState, files: UploadFiles) {
    setUserState({
      ...user,
      files: {
        ...user.files,
        ...removeContentFromFiles(files)
      }
    });
    const userIndex = users.findIndex(({ username }) => username === user.username);
    return {
      user: {
        ...user,
        files: {
          ...user.files,
          ...files
        }
      },
      users: userIndex !== -1 ? [
        ...users.slice(0, userIndex),
        user,
        ...users.slice(userIndex + 1)
      ] : users.concat(user)
    };
  },
  addNotification,
  removeNotification
});

function removeContentFromFiles(files: UploadFiles) {
  const _files = {};
  for(let key in files) {
    _files[key] = {
      ...files[key],
      content: undefined
    }
  }
  return _files;
}