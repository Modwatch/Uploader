import createStore from "unistore";
import jwtDecode from "jwt-decode";

import { Notification, RemoveFirstFromTuple } from "@modwatch/types";
import { UploadUser, UploadFiles } from "../../types";
import { addNotification, removeNotification } from "@modwatch/core/src/store/index";

import { setUsers, getUsers } from "./local";
import { getToken } from "./ipc";
import { verify } from "../store/pure";

const localUsers = getUsers();

export type GlobalState = {
  users: UploadUser[];
  notifications: Notification[];
  awaitingIpc: boolean;
}
export type GlobalActions = {
  login(props?: {token: string}): Promise<void>;
  logout(): void;
  addFiles(files: UploadFiles);
  addNotification(...args: RemoveFirstFromTuple<Parameters<typeof addNotification>>): void;
  removeNotification(...args: RemoveFirstFromTuple<Parameters<typeof removeNotification>>): void;
  getSelectedUser(): UploadUser | undefined;
};

export const rawState: GlobalState = {
  users: localUsers,
  awaitingIpc: false,
  notifications: []
};

let _store = createStore(rawState);

export const store = _store;

export const actions = store => ({
  getSelectedUser({ users }: GlobalState) {
    return users.find(({ selected }) => selected);
  },
  async login({ users }: GlobalState, props?: {
    token: string
  }) {
    let { token } = props || {};
    let _users = [...users];
    if(!token) {
      store.setState({
        awaitingIpc: true
      });
      try {
        token = await getToken();
      } catch(e) {
        store.setState({
          awaitingIpc: false
        });
        throw e;
      }
      store.setState({
        awaitingIpc: false
      });
      const { sub, scopes } = jwtDecode(token);
      _users = setUsers([
        ...users.map(user => ({
          ...user,
          selected: false
        })),
        {
          token,
          authenticated: true,
          username: sub,
          files: {},
          scopes,
          selected: true
        }
      ]);
    } else {
      try {
        await verify(token);
      } catch(e) {
        console.log("Failed to verify token parameter");
        throw e;
      }
    }
    console.log(_users);
    return {
      _users
    };
  },
  logout({ users }: GlobalState) {
    return {
      users: setUsers(users.filter(({ selected }) => !selected))
    };
  },
  addFiles({ users }: GlobalState, files: UploadFiles) {
    const userIndex = users.findIndex(({ selected }) => selected);
    return {
      users: setUsers([
        ...users.slice(0, userIndex),
        {
          ...users[userIndex],
          files: {
            ...users[userIndex].files,
            ...removeContentFromFiles(files)
          }
        },
        ...users.slice(userIndex + 1),
      ])
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
