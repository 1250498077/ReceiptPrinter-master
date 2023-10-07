import React from "react";
import "./App.css";

import Chatgpt from "./compoments/ChatGPT";
import Admin from "./compoments/Admin/index.js";
import AutoCode from "./compoments/AutoCode/index.js";
import Paint from "./compoments/Paint/index.js";
import { useState } from "react";
const pageRouter = {
  changeRoute: () => { },
};
function App() {
  const [target, setTaget] = useState({ id: "", data: {} });
  const changeRoute = (route) => {
    setTaget((target) => ({
      ...route,
    }));
  };

  const getParams = (url = window.location.href) => {
    const theRequest = {};
    if (url.indexOf('?') !== -1) {
      const str = url.split('?')[1];
      const strs = str.split('&');
      for (let i = 0; i < strs.length; i += 1) {
        theRequest[strs[i].split('=')[0]] = decodeURI(strs[i].split('=')[1]);
      }
    }
    return theRequest;
  }

  let Compoment = <div>...</div>;
  const setPage = () => {
    const params = getParams();
    console.log("params", params)

    if (params.admin) {
      Compoment = <Admin />;
      return;
    } else if (params.auto) {
      Compoment = <AutoCode />;
      return;
    } else if (params.paint) {
      Compoment = <Paint />;
      return;
    } else {
      Compoment = <Chatgpt />;
      return;
    }
  };

  setPage();
  console.log("111")
  return Compoment;
}

export default App;
