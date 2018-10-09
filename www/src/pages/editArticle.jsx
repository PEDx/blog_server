import React, { Component } from 'react'
import { Button } from 'antd';
import Editor from "../components/EditorComponent"

import "../style/editArticle.css"

export default class  extends Component {
  getContent() {

    console.log(this.editor.getContentHtml());

  }
  getContentText() {

    console.log(this.editor.getContentText());

  }
  getContentJson() {

    console.log(this.editor.getContentJson());

  }
  render() {
    return (
      <div className="app-edit-article">
        <Editor ref={e => this.editor = e}></Editor>
        <Button onClick={this.getContent.bind(this)}>获取html</Button>
        <Button onClick={this.getContentText.bind(this)}>获取text</Button>
        <Button onClick={this.getContentJson.bind(this)}>获取json</Button>
      </div>
    )
  }
}
