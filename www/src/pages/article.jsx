import React, { Component } from 'react'

import Shadertoy from '../components/ShadertoyComponent'
import texture00 from '../assets/img/texture01.png'
import texture01 from '../assets/img/texture00.jpg'

import bufferA from '../graph/Gargantua/Buffer_A.fs'
import bufferB from '../graph/Gargantua/Buffer_B.fs'
import bufferC from '../graph/Gargantua/Buffer_C.fs'
import bufferD from '../graph/Gargantua/Buffer_D.fs'
import main from '../graph/Gargantua/Image.fs'

export default class Article extends Component {
  render() {
    return (
      <div className="article">
        <Shadertoy
          buffers={[
            {
              fragmentStr: bufferA,
              ID: 'Buffer_A',
              circulation: true,
              depTextureArr: [
                {
                  type: 'image',
                  ID: texture00,
                  path: texture00,
                  option: {
                    filter: 'mipmap',
                    wrap: 'repeat'
                  }
                },
                {
                  type: 'image',
                  ID: texture01,
                  path: texture01,
                  format: 'RGB',
                  option: {
                    filter: 'mipmap',
                    wrap: 'repeat'
                  }
                },
                {
                  type: 'framebuffer',
                  ID: 'Buffer_A_Copy',
                  option: {
                    filter: 'linear',
                    wrap: 'clamp'
                  }
                }
              ]
            },
            {
              fragmentStr: bufferB,
              ID: 'Buffer_B',
              depTextureArr: [
                {
                  type: 'framebuffer',
                  ID: 'Buffer_A',
                  option: {
                    filter: 'linear',
                    wrap: 'clamp'
                  }
                }
              ]
            },
            {
              fragmentStr: bufferC,
              ID: 'Buffer_C',
              depTextureArr: [
                {
                  type: 'framebuffer',
                  ID: 'Buffer_B',
                  option: {
                    filter: 'linear',
                    wrap: 'clamp'
                  }
                }
              ]
            },
            {
              fragmentStr: bufferD,
              ID: 'Buffer_D',
              depTextureArr: [
                {
                  type: 'framebuffer',
                  ID: 'Buffer_C',
                  option: {
                    filter: 'linear',
                    wrap: 'clamp'
                  }
                }
              ]
            }
          ]}
          main={{
            fragmentStr: main,
            depTextureArr: [
              {
                type: 'framebuffer',
                ID: 'Buffer_A',
                option: {
                  filter: 'linear',
                  wrap: 'clamp'
                }
              },
              {
                type: 'framebuffer',
                ID: 'Buffer_A_Copy',
                option: {
                  filter: 'linear',
                  wrap: 'clamp'
                }
              },
              {
                type: 'framebuffer',
                ID: 'Buffer_C',
                option: {
                  filter: 'linear',
                  wrap: 'clamp'
                }
              },
              {
                type: 'framebuffer',
                ID: 'Buffer_D',
                option: {
                  filter: 'linear',
                  wrap: 'clamp'
                }
              }
            ]
          }}
        />
      </div>
    )
  }
}
