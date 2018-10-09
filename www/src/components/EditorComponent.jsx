import React, { Component } from 'react';

import wangEditor from "wangeditor"

export default class extends Component {
  constructor(props) {
    super(props);
    this.options = props.options
    this.state = {
      editorInstance: null
    }
  }
  componentDidMount() {
    var editor = new wangEditor(this.editorElement)
    editor.create()
    this.setState({
      editorInstance: editor
    })
  }
  getContentHtml() {
    return  this.state.editorInstance.txt.html()
  }
  getContentText() {
    return  this.state.editorInstance.txt.text()
  }
  getContentJson() {
    return  this.state.editorInstance.txt.getJSON()
  }
  render() {
    return (
      <div onClick={this.getContentHtml.bind(this)} ref={(e) => { this.editorElement = e; }} ></div>
    )
  }
}