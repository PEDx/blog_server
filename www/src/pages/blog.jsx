import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { Card, Avatar, Row, Col } from 'antd';
import style from '../style/blog.css';

const { Meta } = Card;


class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false
    }
  }
  render() {
    return (
      <div className="blog">
        <div className={style.blog_list}>
          <ul className={style.archive}>
            {
              ['前端', '后端', "运维", "日常", "其他"].map((val, idx) => {
                return (<li key={idx}>{val}</li>)
              })
            }

          </ul>
          <Row>
            {
              [1, 2, 3, 3, 12].map((val, idx) => {
                return (<Link to="/article" key={idx}><Col span={10}  push={idx % 2 !== 0 ? 4 : 3}><Card
                  style={{
                    marginBottom: "20px"
                  }}
                  cover={<img style={{
                    height: "200px"
                  }} alt="example" src="https://scontent-lax3-2.cdninstagram.com/vp/8f3a021048cf4670db8eb4bbcd110968/5C172875/t51.2885-15/e35/30841399_2037370929883944_5552062699795382272_n.jpg" />}
                >
                  <Meta
                    avatar={<Avatar>U</Avatar>}
                    title="深入理解 RPC : 基于 Python 自建分布式高并发 RPC 服务"
                    description="通过「造轮子」自建 Python RPC 服务，深入理解分布式高并发原理与实践通过「造轮子」自建 Python RPC 服务，深入理解分布式高并发原理与实践通过「造轮子」自建 Python RPC 服务，深入理解分布式高并发原理与实践"
                  />
                </Card></Col></Link>)
              })
            }
          </Row>
        </div>
      </div>
    );
  }
}

export default App;
