import React from "react";
import { BrowserRouter, Route } from "react-router-dom";
import Layout from "./pages/layout"

export default () => (
  <BrowserRouter>
    <div>
      <Route path="/" component={Layout} />
    </div>
  </BrowserRouter >
);
