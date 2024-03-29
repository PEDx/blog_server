import React, { Component } from 'react';
import { Input, Button } from 'antd';
import "../style/login.css"
import request from "../utils/request"
export default class  extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tabName: "login",
      username: "",
      password: "",
      confirmPwd: "",
      email: ""
    };
  }

  handleClick(tabName, e) {
    this.setState({
      tabName: tabName,
      username: "",
      password: "",
      confirmPwd: "",
      email: ""
    });
  }
  // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1Mzc0MjU5ODEsImlkIjoxNiwibmJmIjoxNTM3NDI1OTgxLCJ1c2VybmFtZSI6InBlZCJ9.8J8QtBfwDuPPPnqB-nn3i6xnQGHKCP-myEkhnRpmOIE
  async handleConfirm(ev) {
    if (this.state.tabName === "login") {
      const res = await request('login', {
        method: "POST",
        body: {
          username: this.state.username,
          password: this.state.password
        }
      })
      if(res.code === 0) {
        this.props.history.replace(`/user`);
      }
    }
  }
  handleInput(type, event) {
    this.setState({ [type]: event.target.value })
  }
  componentDidMount() {
    this.input.focus()
  }
  render() {
    const { username, password, confirmPwd, email } = this.state
    return (
      <div className="app-login">
        <div className="app-login-box">
          <div className="app-login-nav">
            <ul>
              <li onClick={this.handleClick.bind(this, "login")} className={this.state.tabName === "login" ? "app-login-active" : ""}>登录</li>
              <li onClick={this.handleClick.bind(this, "register")} className={this.state.tabName === "register" ? "app-login-active" : ""}>注册</li>
            </ul>
          </div>
          <div className="app-login-form">
            {this.state.tabName === "register" &&
              (<div className="app-login-form-item">
                <Input type="email" name="email" id="email" value={email} placeholder="邮箱" onChange={this.handleInput.bind(this, 'email')} />
              </div>)}
            <div className="app-login-form-item">
              <Input type="text" name="username" id="username" value={username} placeholder="用户名" ref={(input) => this.input = input} onChange={this.handleInput.bind(this, 'username')} />
            </div>
            <div className="app-login-form-item">
              <Input type="password" name="password" id="password" value={password} placeholder="密码" onChange={this.handleInput.bind(this, 'password')} />
            </div>
            {this.state.tabName === "register" &&
              (<div className="app-login-form-item">
                <Input type="password" name="confirmPwd" id="confirmPwd" value={confirmPwd} placeholder="确认密码" onChange={this.handleInput.bind(this, 'confirmPwd')} />
              </div>)}
            <div className="app-login-confirm">
              <Button className="app-login-btn" onClick={this.handleConfirm.bind(this)}>确定</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
