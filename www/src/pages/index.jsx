import React, { Component } from 'react';
import { Link, Route, Switch } from "react-router-dom";
import 'antd/lib/style/index.css';
import asyncComponent from '../components/AsyncComponent'
import logo from "../assets/logo.svg"
import style from "../style/index.css"

const User = asyncComponent(() => import("./user"));
const Login = asyncComponent(() => import("./login"));
const Blog = asyncComponent(() => import("./blog"));

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userLogo: "http://www.dgtle.com/uc_server/data/avatar/000/95/31/16_avatar_small.jpg",
    };
  }
  handleMouseOver() {
    this.setState({ showDropMenu: true })
  }
  handleLogout() {
    this.setState({ userLogo: "" })
  }

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
            <li><Link to="/blog">博客</Link></li>
            <li><Link to="/blog">商店</Link></li>
            <li><Link to="/user">论坛</Link></li>
          </ul>
          <div className={style.user}>
            {!this.state.userLogo && (<div className={style.login}>
              <Link to="/login">登录</Link>
            </div>)}
            {/* <div className="message"></div> */}
            {this.state.userLogo && (<div className={style.user_logo} >
              <img src={this.state.userLogo} alt="logo" />
              <ul className={style.dropdown_menu}>
                <li>个人中心</li>
                <li>控制台</li>
                <li>设置</li>
                <li onClick={this.handleLogout.bind(this)}>登出</li>
              </ul>
            </div>)}
          </div>
        </header>
        <div>
          <Switch>
            <Route path="/user" component={User} />
            <Route path="/blog" component={Blog} />
            <Route path="/login" component={Login} />
          </Switch>
        </div>
      </div>
    );
  }
}

export default App;
