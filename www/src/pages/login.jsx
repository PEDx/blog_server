import React, { Component } from 'react';
import style from "../style/login.css"
class App extends Component {
  constructor(props) {
    super(props);
    this.state = { tabName: "login" };
  }

  handleClick(tabName, e) {

    this.setState({ tabName: tabName });
  }

  render() {
    return (
      <div id={style.login}>
        <div className={style.ct_box}>
          <div className={style.nav}>
            <ul>
              <li onClick={this.handleClick.bind(this, "login")}>登录</li>
              <li onClick={this.handleClick.bind(this, "register")}>注册</li>
            </ul>
          </div>
          <TabContent tabName={this.state.tabName} />
        </div>
      </div>
    );
  }
}

function TabContent(props) {
  return (
    <div className={style.form}>
      {props.tabName === "register" ?
        (<div className={style.form_item}>
          <label htmlFor="username">邮箱</label>
          <input type="email" name="username" id="username" />
        </div>) : ""}
      <div className={style.form_item}>
        <label htmlFor="username">用户名</label>
        <input type="text" name="username" id="username" />
      </div>
      <div className={style.form_item}>
        <label htmlFor="password">密码</label>
        <input type="text" name="password" id="password" />
      </div>
      <div className={style.submit}>
        <input type="submit" value="上传" />
      </div>
    </div>
  )
}
export default App;
