import React, { Component } from 'react';
import { Input } from 'antd';
import Highlight from 'react-highlight'


import "./editor.css"
import "./codeTheme.css"

const { TextArea } = Input;

export default class extends Component {
  constructor(props) {
    super(props);
    this.highlightElement = null
    this.state = {
      code: '',
    }
  }
  handleColorChange(value, e) {
    this.setState({
      langColor: value,
    })
  }
  onTextScroll(e) {
    var t = this.highlightElement.getElementsByTagName("code")[0]
    t.scrollTop = e.target.scrollTop
    t.scrollLeft = e.target.scrollLeft
  }
  textChange(e) {
    this.setState({
      code: e.target.value
    })
  }
  getCodeHtml() {
    return this.highlightElement.innerHTML || ""
  }
  clearCode() {
    this.setState({
      code: ""
    })
  }
  render() {
    return (
      <div className="code-editor">
        <div className="code-editor-window">
          <span className="mac-window">
            <i></i><i></i><i></i>
            <span className="mac-window-title">{this.props.langVis}</span>
          </span>
        </div>
        <div className="code-editor-content">
          <TextArea  value={this.state.code} onChange={this.textChange.bind(this)} onScroll={this.onTextScroll.bind(this)}
            style={{
              fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace",
              // color: "red", // debug
              fontSize: "12px",
              lineHeight: "12px",
              color: "transparent",
              border: "none",
              padding: "20px",
              position: "absolute",
              top: "24px",
              left: "0px",
              width: "100%",
              height: "378px",
              backgroundColor: "transparent",
              whiteSpace: "nowrap",
              overflowX: "auto",
              caretColor: this.props.theme === "hljs" ? "#333" : "#eee" /* 光标颜色 */
            }}/>
          <div style={{
            fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace",
            width: "100%",
            height: "378px",
            overflow: "auto",
          }}  ref={(e) => { this.highlightElement = e; }} className="hl-box">
            <Highlight className={`${this.props.lang}  ${this.props.theme}`} >
              {(this.state.code || "") + "\n"}
            </Highlight>
          </div>
        </div>
      </div>
    )
  }
}