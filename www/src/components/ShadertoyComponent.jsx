import React, { Component } from 'react';

import Shadertoy from "../graph/Shadertoy"

export default class ShadertoyComponent extends Component {
  constructor(props) {
    super(props);
    this.main = props.main
    this.buffers = props.buffers

    this.texture = props.texture
    this.state = {
      toyInstance: null
    }
  }

  componentDidMount() {
    let st = new Shadertoy(
      this.canvasElement,
      this.main,
      this.buffers,
      false
    )
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
      <div style={{ "width": "100%", "height": "100%" }}>
        <canvas ref={(e) => { this.canvasElement = e; }}  style={{ "width": "100%", "height": "100%" }}></canvas>
      </div>
    )
  }
}

// buffer C
