const { ipcMain, dialog } = require("electron");
import { promisify } from "util";
import { readFile as _readFile, readdir as _readdir } from "fs";
import { basename } from "path";

const [readFileAsync, readdirAsync] = [_readFile, _readdir].map(promisify);

export default function({ APPDATA }) {
  ipcMain.on("readFile", async (event, filePaths) => {
    const files = await Promise.all(filePaths[0].map(async path => ({
      path,
      name: basename(path),
      content: await readFileAsync(path, "utf8")
    })));
    event.reply("readFile", files);
  });

  ipcMain.on("selectFiles", async event => {
    const selector = await dialog.showOpenDialog({ properties: ["openFile", "multiSelections"] });
    if(selector.canceled) {
      event.reply("selectFiles", "ERROR: File Select Canceled");
      return;
    }
    event.reply("selectFiles", selector.filePaths);
  });
};
