import React, { Component } from 'react';
import { Link, Route, Switch } from "react-router-dom";
import { Avatar, Menu, Dropdown } from 'antd';
import 'antd/lib/style/index.css';
import asyncComponent from '../components/AsyncComponent'
import logo from "../assets/logo.svg"
import style from "../style/layout.css"


import Home from "./home"

const User = asyncComponent(() => import("./user"));
const Login = asyncComponent(() => import("./login"));
const Blog = asyncComponent(() => import("./blog"));

const menu = function(){
  return (
    <Menu >
      <Menu.Item>
        <a target="_blank" rel="noopener noreferrer">个人中心</a>
      </Menu.Item>
      <Menu.Item>
        <a target="_blank" rel="noopener noreferrer">控制台</a>
      </Menu.Item>
      <Menu.Item>
        <a target="_blank" rel="noopener noreferrer">设置</a>
      </Menu.Item>
      <Menu.Item onClick={this.handleLogout.bind(this)}>
        <a target="_blank" rel="noopener noreferrer" >登出</a>
      </Menu.Item>
    </Menu>
  );
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userLogo: "http://www.dgtle.com/uc_server/data/avatar/000/95/31/16_avatar_small.jpg",
      user: "Edward",
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
            <li><Link to="/home">首页</Link></li>
            <li><Link to="/news">新闻</Link></li>
            <li><Link to="/blog">博客</Link></li>
            <li><Link to="/blog">商店</Link></li>
            <li><Link to="/user">论坛</Link></li>
          </ul>
          <div className={style.user}>
            {
              !this.state.userLogo && (<div className={style.login}>
                <Link to="/login">登录</Link>
              </div>)
            }
            {/* <div className="message"></div> */}
            {
              this.state.userLogo && (
                <Dropdown overlay={menu.bind(this)()} placement="bottomCenter">
                  <Avatar style={{ verticalAlign: 'middle' }} size="large" >
                    {this.state.user}
                  </Avatar>
                </Dropdown>
              )
            }
          </div>
        </header>
        <div>
          <Switch>
            {/* <Route path="/" component={Home} /> */}
            <Route path="/home" component={Home} />
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
