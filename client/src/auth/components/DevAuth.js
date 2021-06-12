import { useEffect, useCallback, useState } from "react";

import { getService } from "../../services/service.js";
import { googleOAuth } from "../googleAuth.js";
import { userActions } from "../../redux/User/userActions.js"
import { store } from "../../redux/store.js"

export default function DevAuth() {
  const [auth, setAuth] = useState();

  const loginHandler = useCallback(async () => {
    const googleResponse = await auth.signIn();

    const userRes = await getService().localService.user.login(googleResponse.qc.id_token)
    userActions.setUser(userRes.data.user);
  }, [auth]);

  useEffect( async () => {
    window.onGoogleScriptLoad = googleOAuth.onGoogleScriptLoad(setAuth);
    googleOAuth.loadGoogleScript();
    const isAuthRes = await getService().localService.user.checkAuth();

    console.log(isAuthRes);
  }, [setAuth]);

  useEffect(() => {
    if (auth) {
      const isSignedIn = auth.isSignedIn.he;
      const user = store.getState().user;
      
      if (!isSignedIn || !user._id) {
        loginHandler();
      }
    }
  }, [auth, loginHandler]);

  return <></>;
}
