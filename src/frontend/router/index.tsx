import { h, Component } from "preact";
import Router, { route } from "preact-router";
import { createHashHistory } from "history";
import AsyncRoute from "../components/asyncRoute";

import NotFound from "./notFound";
import Landing from "./landing";
import Upload from "./upload";
// import Post from "../components/post";

import { GlobalState, GlobalActions } from "../store/index";
// import { RouteProps, StoreProps } from "../types";

const ROUTE_TRANSITION_TIMEOUT = 150; // needs to match transition duration in src/global.css

export default class Routes extends Component<
  GlobalState & GlobalActions,
  {}
  // { fading: boolean; timeout: boolean }
> {
  // state = {
  //   fading: false,
  //   timeout: false
  // };
  // cancelRouteChange = false;
  // wrappedImport = async importedComponent => {
  //   await importedComponent;
  //   this.setState(() => ({
  //     fading: false
  //   }));
  //   return importedComponent;
  // };
  // importPost = async (url, cb, props) => {
  //   const DynamicPost = await this.wrappedImport(import(`./${props.title}.js`));
  //   return <Post {...DynamicPost.metadata} content={DynamicPost.default} />;
  // };
  routeChange = e => {
  //   if (this.cancelRouteChange) {
  //     this.cancelRouteChange = false;
  //     return;
  //   }
  //   if (this.state.fading || this.state.timeout) {
  //     return;
  //   }
  //   e.previous && route(e.previous, true);
  //   setTimeout(() => {
  //     this.setState(
  //       () => ({
  //         timeout: false
  //       }),
  //       () => {
  //         if (e.previous) {
  //           this.cancelRouteChange = true;
  //           route(e.url, true);
  //         }
  //       }
  //     );
  //   }, ROUTE_TRANSITION_TIMEOUT);
  //   this.setState(() => ({
  //     fading: true,
  //     timeout: true
  //   }));
  };
  render() {
    return (
      <div
        class="router-wrapper"
      >
        <Router onChange={this.routeChange} history={createHashHistory()}>
          <Landing
            key={"landing"}
            path="/"
            {...this.props}
          />
          <Upload
            key="upload"
            path="/upload/:username?"
            {...this.props}
          />
          <NotFound
            key="404"
            default
            {...this.props}
          />
        </Router>
      </div>
    );
  }
}
