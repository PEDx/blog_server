import React, { Component } from 'react';

import Shadertoy from "../graph/Shadertoy"

export default class ShadertoyComponent extends Component {
  constructor(props) {
    super(props);
    this.fragmentShader = props.fragmentShader
    this.texture = props.texture
    this.state = {
      toyInstance: null
    }
  }

  componentDidMount() {
    let st = new Shadertoy({
      canvasDom: this.canvasElement,
      fragmentShaderStr: this.fragmentShader,
      textureSrcArr: this.texture || []
    })
    st.init().then((res) => {
      st.start()
    })
    this.setState({
      toyInstance: st
    })
  }
  getInstace() {
    return this.state.toyInstance
  }
  componentWillUnmount() {
    this.state.toyInstance.stop()
  }
  render() {
    return (
      <canvas ref={(e) => { this.canvasElement = e; }} style={{ "width": "100%", "height": "100%" }}></canvas>
    )
  }
}

// buffer C
