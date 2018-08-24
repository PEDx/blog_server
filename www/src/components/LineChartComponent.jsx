import React, { Component } from 'react';

// 引入 ECharts 主模块
import echarts from 'echarts/lib/echarts';
// 引入柱状图
import 'echarts/lib/chart/line';

export default class LineChart extends Component {
  constructor(props) {
    super(props);
    this.options = props.options
    this.state = {
      chartInstance: null
    }
  }

  componentDidMount() {
    this.setState({
      chartInstance: echarts.init(this.echartsElement, "darkness")
    }, () => {
      this.state.chartInstance.setOption(
        this.options
      );
    })
  }
  getInstace() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this.state.chartInstance ? resolve(this.state.chartInstance): reject(new Error())
      }, 0)
    })
  }
  render() {
    return (
      <div ref={(e) => { this.echartsElement = e; }} style={{ "width": "100%", "height": "600px" }}></div>
    )
  }
}