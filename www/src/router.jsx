import React from "react";
import { BrowserRouter, Route } from "react-router-dom";
import Layout from "./pages/layout"

export default () => (
  <BrowserRouter forceRefresh={true}>
      <Route path="/" component={Layout} />
  </BrowserRouter>
);
