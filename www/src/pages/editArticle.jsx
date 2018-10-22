import React, { Component } from 'react'
import { Button, Modal } from 'antd';
import Editor from "../components/EditorComponent"

import "../style/editArticle.css"

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      html_string: '',
    }
  }
  getContent() {
    console.log(this.editor.getContentHtml());
  }
  handlePreview() {
    // console.log(this.editor.getContentHtml());
    this.setState({
      visible: true,
      html_string: this.editor.getContentHtml()
    })
  }
  handleOk() {
    this.setState({
      visible: false,
    })
  }
  render() {
    return (
      <div className="app-edit-article">
        <Editor ref={e => this.editor = e}></Editor>
        <Button onClick={this.getContent.bind(this)}>发布</Button>
        <Button style={{
          marginLeft: "20px"
        }} onClick={this.handlePreview.bind(this)}>预览</Button>
        <Modal
          width="840px"
          title="预览"
          visible={this.state.visible}
          onOk={this.handleOk.bind(this)}
        >
          <div className="preview-content" dangerouslySetInnerHTML=
            {{ __html: this.state.html_string }}>
          </div>
        </Modal>
      </div>
    )
  }
}
