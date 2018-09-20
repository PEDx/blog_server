import React, { Component } from 'react';
import Slider from "react-slick";
import '../style/home.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
class App extends Component {

  render() {
    const settings = {
      className: "center",
      dots: true,
      centerMode: true,
      infinite: true,
      centerPadding: "400px",
      slidesToShow: 1,
      speed: 500,
    };
    return (
      <div className="app-home">
        <Slider {...settings}>
          <div className="app-home-item" ><h3><div><img src="https://scontent-lax3-2.cdninstagram.com/vp/4d060d02d52a1663c6920e0a71dc9fa6/5C39AEA9/t51.2885-15/e35/32782185_1846954082029154_3708190655021842432_n.jpg" alt=""/></div></h3></div>
          <div className="app-home-item" ><h3><div><img src="https://scontent-lax3-2.cdninstagram.com/vp/5c7888da0930433d43482c00b9549454/5C19C751/t51.2885-15/e35/30087340_165774780768718_7904613409633599488_n.jpg" alt=""/></div></h3></div>
          <div className="app-home-item" ><h3><div><img src="https://scontent-lax3-2.cdninstagram.com/vp/2ade5ddec3f4c52690844f6a49f41a1a/5C03A823/t51.2885-15/e35/31557016_171543173465161_5030374879438831616_n.jpg" alt=""/></div></h3></div>
        </Slider> ,
      </div >
    );
  }
}

export default App;
