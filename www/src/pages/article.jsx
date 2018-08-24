import React, { Component } from 'react';

import Shadertoy from "../components/ShadertoyComponent"
import texture00 from "../assets/img/texture01.png"
import texture01 from "../assets/img/texture00.jpg"

import bufferA from "../graph/Gargantua/Buffer_A.fs"

export default class Article extends Component {
    render() {
        return (
            <div className="article">
                <Shadertoy
                    buffers={[
                        {
                            fragmentStr: "",
                            Id: "Buffer_A",
                            depTextureArr: []
                        },
                        {
                            fragmentStr: "",
                            Id: "Buffer_B",
                            depTextureArr: []
                        },
                    ]}
                    main={
                        {
                            fragmentStr: bufferA,
                            depTextureArr: [
                                {
                                    type: "image",
                                    ID: texture00,
                                    path: texture00
                                },
                                {
                                    type: "image",
                                    ID: texture01,
                                    path: texture01
                                },
                                {
                                    type: "framebuffer",
                                    ID: "Buffer_A"
                                },
                                {
                                    type: "framebuffer",
                                    ID: "Buffer_B"
                                },
                            ]
                        }
                    }
                    fragmentShader={bufferA}
                    texture={[texture00, texture01, "", ""]}
                ></Shadertoy>
            </div>
        );
    }
}

