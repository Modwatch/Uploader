const { ipcRenderer } = require("electron");
import { Game } from "@modwatch/types";

type SelectFileProps = {
  game: Game;
  filename: string;
}

export async function getToken(): Promise<string> {
  return ipcBuilder<string>("login");
}

export async function selectFiles({ game, filename }: SelectFileProps): Promise<string | Array<string>> {
  return ipcBuilder<Array<string>>("selectFiles", { game, filename });
}

export async function readFile(path): Promise<any> {
  return ipcBuilder("readFile", path);
}

export async function ipcBuilder<T = any>(name: string, ...args): Promise<T | string> {
  console.log("ipc received");
  return new Promise((resolve, reject) => {
    ipcRenderer.send(name, args);
    console.log(`ipc: ${name} sent`);
    ipcRenderer.once(name, (event, response: T | string) => {
      console.log(`ipc: ${name} received`);
      if(typeof response !== "string" || response.indexOf("ERROR:") !== 0) {
        console.log(`ipc: ${name} resolved`);
        resolve(response);
      } else {
        console.log(`ipc: ${name} rejected`);
        reject(response.slice(6));
      }
    });
  });
}
