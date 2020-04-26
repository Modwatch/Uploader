import { h, Fragment } from "preact";
import { useState } from 'preact/hooks';
import { route } from "preact-router";
import { GlobalState, GlobalActions } from "../store/index";

export default function(props: GlobalState & GlobalActions) {
  const [token, setToken] = useState(props.users[0]?.token);
  return (
    <Fragment>
      <section class="link" onClick={async e => (await props.logout(), route("/upload"))}>
        <h1>New User</h1>
        <p>If you have not used the Modwat.ch uploader before, or you want to create a new profile, click here</p>
      </section>
      <section class="link" onClick={async e => {
        try {
          await props.login();
          route(`/upload/${props.user.username}`);
        } catch(e) {
          props.addNotification("Login Failed", {
            type: "error"
          });
        }
      }}>
        <h1>Existing User</h1>
        <p>If you have used any version of the Modwat.ch uploader before, log in to your existing account by clicking here</p>
      </section>
      {props.users.length > 0 && <section>
        <h1>Your Users</h1>
        <select onChange={e => setToken(e.target.value)}>
          {props.users.map(user => (
            <option value={user.token}>{user.username}</option>
          ))}
        </select>
        <button onClick={async e => {
          try {
            await props.login({ token });
            route(`/upload/${props.user.username}?local=true`)
          } catch(e) {
            props.addNotification("Login Failed", {
              type: "error"
            });
          }
        }}>Login</button>
        <p>If you have already logged in from this machine, you can select a username from the list above</p>
      </section>}
    </Fragment>
  );
}
