import { User, FileName, Game } from "@modwatch/types";

type UploadFile = {
  content?: string[];
  path: string;
  name: string;
}
type UploadFiles = {
  [key: string]: UploadFile;
}
interface UploadUser extends User {
  files: UploadFiles;
}
type SelectOption = {
  display: string;
  value: string;
}
type UploadForm = {
  username: string;
  password: string;
  tag: string;
  enb: string;
  plugins?: UploadFile;
  modlist?: UploadFile;
  ini?: UploadFile;
  prefsini?: UploadFile;
  game: Game;
  modmanager: string;
}
