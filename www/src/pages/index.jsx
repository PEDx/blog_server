import React, { Component } from 'react';
import { Link, Route } from "react-router-dom";
import logo from "../assets/logo.svg"
import Blog from "./blog"
import User from "./user"
import Login from "./login"
import style from "../style/index.css"

class App extends Component {
  render() {
    return (
      <div id={style.index}>
        <header className={style.nav}>
          <div className={style.logo_box + ' f-fl'}>
            <img src={logo} className={style.logo} alt="logo" />
          </div>
          <ul>
            <li><Link to="/">首页</Link></li>
            <li><Link to="/news">当日新闻</Link></li>
            <li><Link to="/user">个人中心</Link></li>
            <li><Link to="/blog">博客</Link></li>
            <li><Link to="/blog">商店</Link></li>
            <li><Link to="/blog">论坛</Link></li>
          </ul>
          <div className={style.login}>
            <Link to="/login">登录</Link>
          </div>
        </header>
        <div>
          <Route path="/user" component={User} />
          <Route path="/blog" component={Blog} />
          <Route path="/login" component={Login} />
        </div>
      </div>
    );
  }
}

export default App;
