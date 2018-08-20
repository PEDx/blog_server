import React, { Component } from 'react';
import style from '../style/main.css';
class App extends Component {
  render() {
    return (
      <div className="user">
        <header className={style.app_sap}>
          <h1 className="app_sap_title">Welcome to user</h1>
        </header>
      </div>
    );
  }
}

export default App;
