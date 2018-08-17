import React from "react";
import { BrowserRouter, Route } from "react-router-dom";
import Index from "./pages"
import "./style/router.css"

export default () => (
  <BrowserRouter>
    <div>
      <Route path="/" component={Index} />
    </div>
  </BrowserRouter >
);
