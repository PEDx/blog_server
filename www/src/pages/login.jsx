import React, { Component } from 'react';
import { Input, Button } from 'antd';
import style from "../style/login.css"

class App extends Component {
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

  handleConfirm(ev) {
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
      <div id={style.login}>
        <div className={style.ct_box}>
          <div className={style.nav}>
            <ul>
              <li onClick={this.handleClick.bind(this, "login")} className={this.state.tabName === "login" ? style.active : ""}>登录</li>
              <li onClick={this.handleClick.bind(this, "register")} className={this.state.tabName === "register" ? style.active : ""}>注册</li>
            </ul>
          </div>
          <div className={style.form}>
            {this.state.tabName === "register" &&
              (<div className={style.form_item}>
                <Input type="email" name="email" id="email" value={email} placeholder="邮箱" onChange={this.handleInput.bind(this, 'email')} />
              </div>)}
            <div className={style.form_item}>
              <Input type="text" name="username" id="username" value={username} placeholder="用户名" ref={(input) => this.input = input} onChange={this.handleInput.bind(this, 'username')} />
            </div>
            <div className={style.form_item}>
              <Input type="password" name="password" id="password" value={password} placeholder="密码" onChange={this.handleInput.bind(this, 'password')} />
            </div>
            {this.state.tabName === "register" &&
              (<div className={style.form_item}>
                <Input type="password" name="confirmPwd" id="confirmPwd" value={confirmPwd} placeholder="确认密码" onChange={this.handleInput.bind(this, 'confirmPwd')} />
              </div>)}
            <div className={style.confirm}>
              <Button className="btn" onClick={this.handleConfirm.bind(this)}>确定</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
