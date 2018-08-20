import React, { Component } from 'react';
import style from '../style/main.css';

class App extends Component {
  render() {
    return (
      <div className="blog">
        <header className={style.app_sap}>
          <h1 className="app_sap_title">Welcome to blog</h1>
        </header>
      </div>
    );
  }
}

export default App;
