import React, { Component } from 'react';

// 引入 ECharts 主模块
import { Tabs, Card } from 'antd';

import LineChart from "../components/LineChartComponent"


function randomData() {
  now = new Date(+now + oneDay);
  value = value + Math.random() * 21 - 10;
  return {
    name: now.toString(),
    value: [
      [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('/'),
      Math.round(value)
    ]
  }
}

var data = [];
var now = +new Date(1997, 9, 3);
var oneDay = 24 * 3600 * 1000;
var value = Math.random() * 1000;
for (var i = 0; i < 1000; i++) {
  data.push(randomData());
}
// 绘制图表
const option = {
  tooltip: {
    trigger: 'axis',
    formatter: function (params) {
      params = params[0];
      var date = new Date(params.name);
      return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' : ' + params.value[1];
    },
    axisPointer: {
      animation: false
    }
  },
  xAxis: {
    type: 'time',
    splitLine: {
      show: false
    }
  },
  yAxis: {
    type: 'value',
    boundaryGap: [0, '100%'],
    splitLine: {
      show: false
    }
  },
  series: [{
    name: '模拟数据',
    type: 'line',
    showSymbol: false,
    hoverAnimation: false,
    data: data
  }]
};

export default class DataLab extends Component {
  constructor() {
    super()
    this.state = {
      chartOption: option
    }
  }
  componentDidMount() {
    this.timer = setInterval(() => {
      for (var i = 0; i < 5; i++) {
        data.shift();
        data.push(randomData());
      }

      this.chartRef.getInstace().then(ins => {
        ins.setOption({
          ...option,
          series: [{
            data: data
          }]
        })
      }).catch(err => {
        console.log(err);
      });
    }, 1000);
  }
  componentWillUnmount() {
    clearInterval(this.timer)
  }
  render() {
    return (
      <div className="data_lab com-over-content" style={{
        padding: "20px"
      }}>
        <Card title="实时数据">
          <Tabs
            defaultActiveKey="1"
            tabPosition={"left"}
          >
            <Tabs.TabPane tab="Tab 1" key="1">
              <LineChart options={this.state.chartOption} ref={(e) => { this.chartRef = e; }}></LineChart>
            </Tabs.TabPane>
            <Tabs.TabPane tab="Tab 2" key="2">Content of tab 2</Tabs.TabPane>
            <Tabs.TabPane tab="Tab 3" key="3">Content of tab 3</Tabs.TabPane>
          </Tabs>
        </Card>


      </div>
    );
  }
}






