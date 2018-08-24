import React, { Component } from 'react';

import Shadertoy from "../components/ShadertoyComponent"
import texture00 from "../assets/img/texture01.png"
import texture01 from "../assets/img/texture00.jpg"

import bufferA from "../graph/Gargantua/Buffer_A.fs"
import bufferB from "../graph/Gargantua/Buffer_B.fs"
import bufferC from "../graph/Gargantua/Buffer_C.fs"
import bufferD from "../graph/Gargantua/Buffer_D.fs"
import main from "../graph/Gargantua/Image.fs"

export default class Article extends Component {
    render() {
        return (
            <div className="article">
                <Shadertoy
                    buffers={[
                        {
                            fragmentStr: bufferA,
                            Id: "Buffer_A",
                            depTextureArr: [{
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
                            }
                            ]
                        },
                        {
                            fragmentStr: bufferB,
                            Id: "Buffer_B",
                            depTextureArr: [{
                                type: "framebuffer",
                                ID: "Buffer_A"
                            },]
                        },
                        {
                            fragmentStr: bufferC,
                            Id: "Buffer_C",
                            depTextureArr: [{
                                type: "framebuffer",
                                ID: "Buffer_B"
                            },]
                        },
                        {
                            fragmentStr: bufferD,
                            Id: "Buffer_D",
                            depTextureArr: [{
                                type: "framebuffer",
                                ID: "Buffer_C"
                            },]
                        },
                    ]}
                    main={
                        {
                            fragmentStr: main,
                            depTextureArr: [
                                {
                                    type: "framebuffer",
                                    ID: "Buffer_A"
                                },
                                {
                                    type: null,
                                },
                                {
                                    type: null,
                                },
                                {
                                    type: "framebuffer",
                                    ID: "Buffer_D"
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

