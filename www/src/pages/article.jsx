import React, { Component } from 'react';

import Shadertoy from "../components/ShadertoyComponent"
import texture00 from "../assets/img/texture01.png"
import texture01 from "../assets/img/texture00.jpg"

import bufferA from "../graph/Gargantua/Buffer_A.fs"

export default class Article extends Component {
    render() {
        return (
            <div className="article">
                <Shadertoy Framebuffers={[
                    {
                        fragmentStr: "",
                        textureId: "",
                        depTextureArr: []
                    },
                    {
                        fragmentStr: "",
                        textureId: "",
                        depTextureArr: []
                    },
                ]}
                    fragmentShader={bufferA}
                    texture={[texture00, texture01, "", ""]}
                ></Shadertoy>
            </div>
        );
    }
}

