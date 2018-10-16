import React, { Component } from 'react';
import { Modal, Input, Select } from 'antd';
import { exec, init } from 'pell'
import "../../node_modules/pell/dist/pell.min.css"
import "./editor.css"
import Highlight from 'react-highlight'

import "../../node_modules/highlight.js/styles/rainbow.css"

const { TextArea } = Input;
const Option = Select.Option;

export default class extends Component {
  constructor(props) {
    super(props);
    this.options = props.options
    this.state = {
      html: null,
      lang: 'javascript'
    }
    this.editorActiveEle = null
    this.isDOM = (typeof HTMLElement === 'object') ?
      function (obj) {
        return obj instanceof HTMLElement;
      } :
      function (obj) {
        return obj && typeof obj === 'object' && obj.nodeType === 1 && typeof obj.nodeName === 'string';
      }
  }
  componentDidMount() {
    const editor = init({
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
        "line",
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

    editor.content.innerHTML = '<p><br/></p>'


    let pellContent = document.getElementsByClassName("pell-content")[0]
    pellContent.focus()
    this.editorActiveEle = pellContent.getElementsByTagName("p")[0]
    pellContent.addEventListener("mousedown", () => {
      let node = window.getSelection().focusNode
      this.editorActiveEle = node

    })
    pellContent.addEventListener("keyup", () => {
      let node = window.getSelection().focusNode
      this.editorActiveEle = node
    })

  }
  addOnePElement(parent) {
    let _p = document.createElement("p")
    _p.innerHTML = "<br/>"
    parent.appendChild(_p)
    this.editorActiveEle = _p
  }
  getContentHtml() {
    return this.state.html || ""
  }
  handleOk() {
    let _html = document.getElementsByClassName("hl-box")[0].innerHTML
    let pellContent = document.getElementsByClassName("pell-content")[0]
    if (!this.isDOM(this.editorActiveEle)) { this.addOnePElement(pellContent) }
    let focusNode = this.editorActiveEle;
    let codeNode = document.createElement("pre");
    codeNode.style.pointerEvents = "none";
    codeNode.innerHTML = _html
    pellContent.replaceChild(codeNode, focusNode)
    this.addOnePElement(pellContent)
    this.setState({
      code: "",
      visible: false
    })
  }
  handleCancel() {
    this.setState({
      code: "",
      visible: false
    })
  }
  handleChange(value) {
    this.setState({
      lang: value
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
          title="插入代码"
          visible={this.state.visible}
          onOk={this.handleOk.bind(this)}
          onCancel={this.handleCancel.bind(this)}
        >
          <Select defaultValue="javascript" style={{
            width: 120,
            float: "right",
            marginBottom: "20px"
          }} onChange={this.handleChange.bind(this)}>
            <Option value="javascript">Javascript</Option>
            <Option value="java">Java</Option>
            <Option value="go">Golang</Option>
            <Option value="cpp">C++</Option>
            <Option value="htmlbars">HTML</Option>
          </Select>
          <TextArea rows={18} value={this.state.code} onChange={this.textChange.bind(this)} onScroll={this.onTextScroll.bind(this)}
          style={{
            fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace",
            // color: "red",
            color: "transparent",
            border: "none",
            padding: "5px",
            position: "absolute",
            top: "131px",
            left: "24px",
            width: "790px",
            height: "378px",
            backgroundColor: "transparent",
            whiteSpace: "nowrap",
            overflowX: "auto",
            caretColor: "#eee" /* 光标颜色 */
          }} ref={e => this.textareaEle = e} />
          <div style={{
            width: "790px",
            height: "378px",
            overflow: "auto"
          }} className="hl-box">
            <Highlight className={this.state.lang} >
              {(this.state.code || "") + "\n"}
            </Highlight>
          </div>

        </Modal>
      </div>
    )
  }
}