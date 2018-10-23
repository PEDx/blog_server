import React, { Component } from 'react';
import { Modal, Input, Select } from 'antd';
import { exec, init } from 'pell'
import "../../node_modules/pell/dist/pell.min.css"
import "./editor.css"
import Highlight from 'react-highlight'

import "./codeTheme.css"

const { TextArea } = Input;
const Option = Select.Option;

export default class extends Component {
  constructor(props) {
    super(props);
    this.options = props.options
    this.state = {
      html: null,
      lang: 'javascript',
      langColor: 'hljs hljs-dark',
      langVis: 'Javascript',
    }
    this.editorActiveEle = null
    this.DomHandle()
  }
  DomHandle() {
    this.isDOM = (typeof HTMLElement === 'object') ?
      function (obj) {
        return obj instanceof HTMLElement;
      } :
      function (obj) {
        return obj && typeof obj === 'object' && typeof obj.nodeName === 'string';
      }
    this.isTextNode = (node) => {
      return this.isDOM(node) && node.nodeType === 3
    }
  }
  componentDidMount() {
    init({
      element: this.editorElement,
      onChange: html => {
        this.setState({
          html: html,
          visible: false,
          code: ""
        })
      },
      actions: [
        "bold",
        "italic",
        "underline",
        "strikethrough",
        "heading1",
        "heading2",
        {
          name: 'heading3',
          icon: '<div style="font-weight: bold;">H<sub>3</sub></div>',
          title: 'Custom Action',
          result: () => exec('formatBlock', '<h3>')
        },
        "paragraph",
        "quote",
        "olist",
        "ulist",
        // {
        //   icon: '&#8213;',
        //   title: 'Horizontal Line',
        //   result: () => {
        //     exec('insertHorizontalRule');
        //     exec("formatBlock", '<pre>')
        //   }
        // },
        {
          icon: 'code',
          title: 'code',
          result: () => {
            this.setState({
              visible: true,
            })
          }
        },
        {
          icon: 'link',
          title: 'link',
          result: () => {
            const url = window.prompt('Enter the link URL')
            if (url) exec('createLink', url)
          }
        },
        {
          icon: 'img',
          title: 'Image',
          result: () => {
            const url = window.prompt('Enter the image URL')
            if (url) exec('insertImage', url)
          }
        }
      ],
      defaultParagraphSeparator: 'p',
      styleWithCSS: true,
    })

    // editor.content.innerHTML = '<p><br/></p>'


    let pellContent = document.getElementsByClassName("pell-content")[0]
    pellContent.focus()
    this.editorActiveEle = pellContent.getElementsByTagName("p")[0]
    pellContent.addEventListener("mouseup", () => {
      let node = window.getSelection().focusNode
      this.editorActiveEle = node
      // console.log(node);

    })
    pellContent.addEventListener("keyup", () => {
      let node = window.getSelection().focusNode
      this.editorActiveEle = node
      // console.log(node);
    })

  }
  insertLastRow(parent) {
    let _p = document.createElement("p")
    _p.innerHTML = "<br/>"
    parent.appendChild(_p)
    this.editorActiveEle = _p
  }
  insertOneRow(targetEl) {
    let _p = document.createElement("p")
    _p.innerHTML = "<br/>"
    this.insertAfter(_p, targetEl)
    this.editorActiveEle = _p
  }
  insertTextAfterOneRow(targetEl) {
    let _p = document.createElement("p")
    _p.innerHTML = "<br/>"
    this.insertAfter(_p, targetEl.parentNode)
    this.editorActiveEle = _p
  }
  replaceOneRow(node) {
    let _p = document.createElement("p")
    _p.innerHTML = "<br/>"
    node.parentNode.replaceChild(_p, node)
    this.editorActiveEle = _p
  }
  insertAfter(newEl, targetEl) {
    var parentEl = targetEl.parentNode;
    if (parentEl.lastChild === targetEl) {
      parentEl.appendChild(newEl);
    } else {
      parentEl.insertBefore(newEl, targetEl.nextSibling);
    }
  }
  getContentHtml() {
    return `<div class="article-content">${this.state.html}<div>` || ""
  }
  handleOk() {
    let _html = document.getElementsByClassName("hl-box")[0].innerHTML
    let pellContent = document.getElementsByClassName("pell-content")[0]
    let flag = false
    // debugger
    if (this.isTextNode(this.editorActiveEle)) {
      this.insertTextAfterOneRow(this.editorActiveEle)
      flag = true
      // console.log("isTextNode");
    }
    // // 内部为空时插入一行
    if (!this.editorActiveEle || this.editorActiveEle.className === "pell-content") {
      this.insertLastRow(pellContent)
      flag = true
      // console.log("editorActiveEle");
    }
    let focusNode = this.editorActiveEle;

    // console.log(focusNode.parentNode);
    // console.log(focusNode);

    // 使用创建 dom 元素来兼容 IE
    // let codeNode = document.createElement("pre");
    // codeNode.innerHTML = `<span class="mac-window"><i></i><i></i><i></i><span class="mac-window-title">${this.state.langVis}</span></span>${_html}`
    // pellContent.replaceChild(codeNode, focusNode)
    // this.insertOneRow(codeNode) // 插入代码后空行一格

    pellContent.focus()
    var range = window.getSelection();
    range.selectAllChildren(focusNode)
    range.collapseToEnd();
    let PID = `${this.generateRandomAlphaNum(10)}`
    if (flag) focusNode && pellContent.removeChild(focusNode) // 不移除会有 bug
    exec("insertHTML", `<pre id="${PID}" contenteditable="false"><span class="mac-window"><i></i><i></i><i></i><span class="mac-window-title">${this.state.langVis}</span></span>${_html}</pre>`)
    this.codeElement = document.getElementById(PID)
    let _p = document.createElement("p")
    _p.innerHTML = "<br/>"
    this.insertAfter(_p, this.codeElement)
    this.editorActiveEle = _p
    // pellContent.focus()

    this.setState({
      html: pellContent.innerHTML,
      code: "",
      visible: false
    })
  }
  generateRandomAlphaNum(len) {
    var rdmString = "";
    for (; rdmString.length < len; rdmString += Math.random().toString(36).substr(2));
    return rdmString.substr(0, len);
  }
  handleCancel() {
    this.setState({
      code: "",
      visible: false
    })
  }
  handleChange(value, e) {
    this.setState({
      lang: value,
      langVis: e.props.children
    })
  }
  handleColorChange(value, e) {
    this.setState({
      langColor: value,
    })
  }
  onTextScroll(e) {
    var t = document.getElementsByClassName("hl-box")[0].getElementsByTagName("code")[0]
    t.scrollTop = e.target.scrollTop
    t.scrollLeft = e.target.scrollLeft
  }
  textChange(e) {
    this.setState({
      code: e.target.value
    })
  }
  render() {
    return (
      <div className="editor">
        <div ref={(e) => { this.editorElement = e; }} ></div>
        <Modal
          width="840px"
          wrapClassName="editor-code-modal"
          title="插入代码块"
          visible={this.state.visible}
          okText="插入"
          cancelText="取消"
          onOk={this.handleOk.bind(this)}
          onCancel={this.handleCancel.bind(this)}
        >
          <div className="selec f-fr" style={{
            marginLeft: "20px"
          }}>
            <label htmlFor="" style={{
              marginRight: "10px"
            }}>语言:</label>
            <Select defaultValue="javascript" style={{
              width: 200,
            }} onChange={this.handleChange.bind(this)}>
              <Option value="javascript">Javascript</Option>
              <Option value="java">Java</Option>
              <Option value="go">Golang</Option>
              <Option value="cpp">C++</Option>
              <Option value="htmlbars">HTML</Option>
            </Select>
          </div>
          <div className="selec f-fr" >
            <label htmlFor="" style={{
              marginRight: "10px"
            }}>主题:</label>
            <Select defaultValue="hljs hljs-dark" style={{
              width: 200,
            }} onChange={this.handleColorChange.bind(this)}>
              <Option value="hljs hljs-dark">Vue Dark</Option>
              <Option value="hljs">Vue Light</Option>
            </Select>
          </div>
          <div className="code-editor">
            <div className="code-editor-window">
              <span className="mac-window">
                <i></i><i></i><i></i>
                <span className="mac-window-title">{this.state.langVis}</span>
              </span>
            </div>
            <div className="code-editor-content">
              <TextArea rows={18} value={this.state.code} onChange={this.textChange.bind(this)} onScroll={this.onTextScroll.bind(this)}
                style={{
                  fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace",
                  // color: "red",
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
                  caretColor: this.state.langColor === "hljs" ? "#333" : "#eee" /* 光标颜色 */
                }} ref={e => this.textareaEle = e} />
              <div style={{
                width: "100%",
                height: "378px",
                overflow: "auto",
              }} className="hl-box">
                <Highlight className={`${this.state.lang}  ${this.state.langColor}`} >
                  {(this.state.code || "") + "\n"}
                </Highlight>
              </div>
            </div>
          </div>
        </Modal>
      </div >
    )
  }
}