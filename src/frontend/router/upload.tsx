import { Component, h } from "preact";

import { Modlist, Game } from "@modwatch/types";
import { GlobalState, GlobalActions } from "../store/index";
import FileIcon from "../components/fileIcon";
import { selectFiles, readFile } from "../store/ipc";
import { getModlist } from "../store/pure";

import { UploadFile, UploadFiles, SelectOption, UploadForm } from "../../types";

const games: Array<SelectOption> = [
  {
    display: "Skyrim",
    value: "skyrim"
  }, {
    display: "Skyrim Special Edition",
    value: "skyrimse"
  }, {
    display: "Skyrim VR",
    value: "skyrimvr"
  }, {
    display: "Fallout 4",
    value: "fallout4"
  }, {
    display: "Fallout 4 VR",
    value: "fallout4vr"
  }
];

const modManagers: Array<SelectOption> = [{
  display: "Vortex",
  value: "vortex"
}, {
  display: "Nexus Mod Manager",
  value: "nexusmodmanager"
}, {
  display: "Mod Organizer",
  value: "modorganizer"
}, {
  display: "Mod Organizer 2",
  value: "modorganizer2"
}, {
  display: "Other",
  value: "other"
}];

interface UploadProps extends GlobalActions, GlobalState {
  local?: boolean;
}
export default class Upload extends Component<UploadProps, {
  form: UploadForm;
  readingFiles: boolean;
}> {
  state = {
    form: {
      username: "",
      password: "",
      tag: "",
      enb: "",
      plugins: null,
      modlist: null,
      ini: null,
      prefsini: null,
      game: "" as Game,
      modmanager: ""
    },
    readingFiles: false
  }
  setForm = ev => {
    const key = ev.target.id;
    const value = ev.target.value;
    this.setState(({ form }) => ({
      form: {
        ...form,
        [key]: value
      }
    }));
  }
  selectFiles = async ({ game, filename}) => {
    this.setState(() => ({
      readingFiles: true
    }));
    const filePaths = await selectFiles({ game, filename });
    const rawFiles = await readFile(filePaths);
    this.setState(() => ({
      readingFiles: false
    }));
    const mapped: UploadFile[] = rawFiles.map(rawFile => ({
      ...rawFile,
      content: rawFile.content.replace(/\r/g, "").split("\n")
    }));
    const files: UploadFiles = {};
    const filenames: string[] = [];
    for(const value of mapped) {
      let name;
      if(value.name.includes("plugins")) {
        name = "plugins";
      } else if(value.name.includes("modlist")) {
        name = "modlist";
      } else if(value.name.includes("prefs")) {
        name = "prefs";
      } else if(value.name.includes("ini")) {
        name = "ini";
      } else {
        console.log("error mapping filename");
        this.props.addNotification("Filename not recognized", {
          type: "error"
        });
        continue;
      }
      files[name] = value;
      filenames.push(name);
    }
    this.props.addFiles(files);
  }
  async componentDidMount() {
    const user = this.props.getSelectedUser();
    if(user && user.username) {
      if(!this.props.local) {
        const modlist = await getModlist({ username: user.username });
        this.setState(({ form }) => ({
          form: {
            ...form,
            tag: modlist.tag,
            end: modlist.enb
          }
        }))
      } else {
        let filesToAdd = {};
        this.setState(() => ({
          readingFiles: true
        }));
        for(const key in user.files) {
          filesToAdd[key] = await readFile(user.files[key].path);
        }
        this.setState(() => ({
          readingFiles: false
        }));
        this.props.addFiles(filesToAdd);
      }
    }
  }
  render() {
    const user = this.props.getSelectedUser();
    return (
      <section>
        <h1>Upload</h1>
        <form class="upload-form">
          {!user.authenticated ? <div>
            <div>
              <label class="sr-only" for="username">Username</label>
              <input required id="username" name="username" placeholder="Username" onChange={this.setForm} type="text"/>
            </div>
            <div>
              <label class="sr-only" for="password">Password</label>
              <input required id="password" name="password" placeholder="Password" onChange={this.setForm} type="password"/>
            </div>
          </div> : <div>{user.username}</div>}
          <div>
            <div>
              <label class="sr-only" for="tag">Tag</label>
              <input id="tag" name="tag" placeholder="Tag" onChange={this.setForm} value={this.state.form.tag} type="text"/>
            </div>
            <div>
              <label class="sr-only" for="enb">ENB</label>
              <input id="enb" name="enb" placeholder="ENB" onChange={this.setForm} value={this.state.form.enb} type="text"/>
            </div>
          </div>
          <div>
            <div class="full-width">
              <label class="sr-only" for="game">Game</label>
              <select required id="game" name="game" onChange={this.setForm}>
                <option value="" disabled selected={this.state.form.game as string === ""}>Game</option>
                {games.map(game => (
                  <option value={game.value}>{game.display}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <div class="full-width">
              <label class="sr-only" for="modmanager">Mod Manager</label>
              <select required id="modmanager" name="modmanager" onChange={this.setForm}>
                <option value="" disabled selected={this.state.form.modmanager as string === ""}>Mod Manager (optional)</option>
                {modManagers.map(modManager => (
                  <option value={modManager.value}>{modManager.display}</option>
                ))}
              </select>
            </div>
          </div>
          <div class="files" disabled={this.state.readingFiles}>
            <div class="file" onClick={e => this.selectFiles({ filename: "plugins", game: this.state.form.game })}>
              <FileIcon />
              <span>plugins.txt</span>
            </div>
            {this.state.form.modmanager !== "nexusmodmanager" && <div class="file" onClick={e => this.selectFiles({ filename: "plugins", game: this.state.form.game })}>
              <FileIcon />
              <span>modlist.txt</span>
            </div>}
            <div class="file" onClick={e => this.selectFiles({ filename: "plugins", game: this.state.form.game })}>
              <FileIcon />
              <span>{this.state.form.game || "game"}.ini</span>
            </div>
            <div class="file" onClick={e => this.selectFiles({ filename: "plugins", game: this.state.form.game })}>
              <FileIcon />
              <span>{this.state.form.game || "game"}prefs.ini</span>
            </div>
          </div>
        </form>
      </section>
    );
  }
}
