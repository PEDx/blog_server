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
    if (this.isTextNode(this.editorActiveEle)) {
      this.insertTextAfterOneRow(this.editorActiveEle)
    }
    // // 内部为空时插入一行
    if (!this.editorActiveEle || this.editorActiveEle.className === "pell-content") {
      this.insertLastRow(pellContent)
    }
    let focusNode = this.editorActiveEle;

    // 使用创建 dom 元素来兼容 IE
    // let codeNode = document.createElement("pre");
    // codeNode.innerHTML = `<span class="mac-window"><i></i><i></i><i></i><span class="mac-window-title">${this.state.langVis}</span></span>${_html}`
    // pellContent.replaceChild(codeNode, focusNode)
    // this.insertOneRow(focusNode) // 插入代码后空行一格

    pellContent.focus()
    var range = window.getSelection();
    range.selectAllChildren(focusNode)
    range.collapseToEnd();
    exec("insertHTML", `<pre contenteditable="false"><span class="mac-window"><i></i><i></i><i></i><span class="mac-window-title">${this.state.langVis}</span></span>${_html}</pre><p></br></p>`)


    this.setState({
      html: pellContent.innerHTML,
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
  handleChange(value, e) {
    this.setState({
      lang: value,
      langVis: e.props.children
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