import React, { Component } from 'react';
import { Link, Route, Switch, Redirect } from "react-router-dom";
import { Avatar, Menu, Dropdown } from 'antd';
import 'antd/lib/style/index.css';
// import asyncComponent from '../components/AsyncComponent'
import logo from "../assets/logo.svg"
import "../style/layout.css"


import Home from "./home"

import User from "./user"
import Login from "./login"
import Graph from "./graph"
import Blog from "./blog"
import DataLab from "./dataLab"
import Article from "./article"
import Tools from "./tools"

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
              !this.state.userLogo && (<div className="app-layout-nav-login">
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
