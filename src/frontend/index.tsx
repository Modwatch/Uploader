import "preact/debug"; ///DEV_ONLY
import { render, h, Component } from "preact";
import { Link, route } from "preact-router";
import { Provider, connect } from "unistore/preact";

import "@modwatch/core/src/properties.css";
import "@modwatch/core/src/global.css";
import "./custom.css";

import Router from "./router/index";
import { GlobalState, GlobalActions, rawState, store, actions } from "./store";
import { verify } from "./store/pure";

import "@modwatch/core/src/components/modwatch-notifications.css";
import { ModwatchNotifications } from "@modwatch/core/src/components/modwatch-notifications";

import "@modwatch/core/src/components/modwatch-nav.css";
import ModwatchNav from "@modwatch/core/src/components/modwatch-nav";

console.log(`Modwatch Uploader:
VERSION:\t${process.env.VERSION}
NODE_ENV:\t${process.env.NODE_ENV}`);

class Root extends Component<GlobalState & GlobalActions, {}> {
  componentDidMount = async () => {
    if (this.props.user && this.props.user.token && await verify(this.props.user.token)) {
      await this.props.login({ token: this.props.user.token });
      setTimeout(
        () =>
          this.props.addNotification(
            `Welcome Back, ${this.props.user.username}`
          ),
        1
      );
      route("/upload");
    } else  {
      this.props.logout();
    }
  }
  login = async () => {
    await this.props.login();
    this.props.addNotification(`Welcome, ${this.props.user.username}`);
    route("/upload");
  }
  logout = async () => {
    await this.props.logout();
    this.props.addNotification(`Logged Out`);
  }
  render() {
    return (
      <div class={this.props.awaitingIpc ? "loading" : ""}>
        <ModwatchNotifications {...this.props} />
        <ModwatchNav {...this.props}>
          {!this.props.user.authenticated ?
            <div class="nav-block" onClick={e => this.login()}>Login</div> :
            <div class="nav-block" onClick={e => this.logout()}>Logout</div>
          }
          <div class="nav-block">Settings</div>
        </ModwatchNav>
        <header>
          <h1 class="header">
            <Link class="no-underline" href="/">
              MODWATCH
            </Link>
          </h1>
        </header>
        <div class="content-wrapper">
          <div class="view-wrapper">
            <Router {...this.props} />
          </div>
        </div>
      </div>
    );
  }
}

const Connector = connect(
  Object.keys(rawState),
  actions
)(props => (
  //@ts-ignore I don't know how to pass types to connect
  h(Root, {...props})
));

render(
  h(Provider, { store },
    h(Connector, {})
  ),
  document.getElementById("modwatch-app")
);
