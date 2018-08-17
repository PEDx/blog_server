import React, { Component } from 'react';
import { Link, Route } from "react-router-dom";
import logo from "../assets/logo.svg"
import Blog from "./blog"
import User from "./user"
import "../style/index.css"

class App extends Component {
  render() {
    return (
      <div className="index">
        <header className="nav">
          <div className="f-fl logo-box">
            <img src={logo} className="logo" alt="logo" />
          </div>
          <ul>
            <li><Link to="/">首页</Link></li>
            <li><Link to="/news">当日新闻</Link></li>
            <li><Link to="/user">个人中心</Link></li>
            <li><Link to="/blog">博客</Link></li>
            <li><Link to="/blog">商店</Link></li>
            <li><Link to="/blog">论坛</Link></li>
          </ul>
          <div className="login">
          <a>登录</a>
          </div>
        </header>
        <div className="body">
          <div className="content">
            <Route path="/user" component={User} />
            <Route path="/blog" component={Blog} />
          </div>
          <div className="right-box">{this.props.children}</div>
        </div>
      </div>
    );
  }
}

export default App;
