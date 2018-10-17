import React, { Component } from 'react'
import { Button } from 'antd';
import Editor from "../components/EditorComponent"

import "../style/editArticle.css"

export default class  extends Component {
  getContent() {

    console.log(this.editor.getContentHtml());

  }
  render() {
    return (
      <div className="app-edit-article">
        <Editor ref={e => this.editor = e}></Editor>
        <Button onClick={this.getContent.bind(this)}>发布</Button>
        <Button style={{
          marginLeft: "20px"
        }} onClick={this.getContent.bind(this)}>预览</Button>
      </div>
    )
  }
}
