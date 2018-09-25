import React, { Component } from 'react';
import { Link, Route, Switch, Redirect } from "react-router-dom";
import { Avatar, Menu, Dropdown } from 'antd';
import 'antd/lib/style/index.css';
import asyncComponent from '../components/AsyncComponent'
import logo from "../assets/logo.svg"
import "../style/layout.css"
// import request from "../utils/request"

import Home from "./home"

const User = asyncComponent(() => import("./user"));
const Login = asyncComponent(() => import("./login"));
const Graph = asyncComponent(() => import("./graph"));
const Blog = asyncComponent(() => import("./blog"));
const DataLab = asyncComponent(() => import("./dataLab"));
const Article = asyncComponent(() => import("./article"));
const Tools = asyncComponent(() => import("./tools"));

const menu = function () {
  return (
    <Menu >
      <Menu.Item>
        <Link to="/user">个人中心</Link>
      </Menu.Item>
      <Menu.Item>
        <a target="_blank" rel="noopener noreferrer">控制台</a>
      </Menu.Item>
      <Menu.Item>
        <Link to="/tools">工具</Link>
      </Menu.Item>
      <Menu.Item onClick={this.handleLogout.bind(this)}>
        登出
      </Menu.Item>
    </Menu>
  );
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: window.bootstrap || {}
    };
  }
  handleMouseOver() {
    this.setState({ showDropMenu: true })
  }
  handleLogout() {
    this.setState({ userLogo: "" })
  }

  render() {
    const { userInfo } = this.state
    return (
      <div className="app-layout">
        <header className="app-layout-nav">
          <div className="app-layout-nav-box f-fl">
            <img src={logo} className="app-layout-nav-logo" alt="logo" />
          </div>
          <ul>
            <li><Link to="/home">首页</Link></li>
            <li><Link to="/blog">博客</Link></li>
            <li><Link to="/graph">图形</Link></li>
            <li><Link to="/dataLab">数据实验室<span className="app-layout-nav-badge">α</span></Link></li>
          </ul>
          <div className="app-layout-nav-user">
            {
              !userInfo.title && (<div className="app-layout-nav-login">
                <Link to="/login">登录</Link>
              </div>)
            }
            {/* <div className="message"></div> */}
            {
              userInfo.title && (
                <Dropdown overlay={menu.bind(this)()} placement="bottomCenter">
                  <Avatar style={{ verticalAlign: 'middle' }} size="large" src={userInfo.icon}>
                  </Avatar>
                </Dropdown>
              )
            }
          </div>
        </header>
        <div style={{
          height: "100%",
          overflow: "scroll"
        }}>
          <Switch>
            <Route exact path="/" render={() => (<Redirect to="/home" />)} />
            <Route path="/home" component={Home} />
            <Route path="/user" component={User} />
            <Route path="/graph" component={Graph} />
            <Route path="/dataLab" component={DataLab} />
            <Route path="/blog" component={Blog} />
            <Route path="/tools" component={Tools} />
            <Route path="/article" component={Article} />
            <Route path="/login" component={Login} />
          </Switch>
        </div>
      </div>
    );
  }
}

export default App;
