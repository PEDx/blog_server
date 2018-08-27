import './Compatibility'
import Shader from './Shader'
/*
  uniform vec3 iResolution;
  uniform float iTime;
  uniform float iTimeDelta;
  uniform float iFrame;
  uniform float iChannelTime[4];
  uniform vec4 iMouse;
  uniform vec4 iDate;
  uniform float iSampleRate;
  uniform vec3 iChannelResolution[4];
  uniform samplerXX iChanneli;
*/

const vertexShader = `#version 300 es
    in vec4 aPosition;

    void main() {
       gl_Position = aPosition;
    }`
export default class Shadertoy {
  // 图片纹理合集
  static imageTextureObj = {}
  // 帧缓冲纹理合集
  static framebufferTextureMap = {}

  static _randomStr = Shadertoy.generateRandomAlphaNum(6)

  constructor(canvas, main, buffers, debug) {
    this.canvas = canvas
    this.gl = Shadertoy.getContext(this.canvas)


    if (debug) {
      this.initDebugMode()
    }

    this.getExtension(this.gl)

    this.running = false
    this.time0 = 0.0
    this.bufferShaderMap = {}
    this.width = parseInt(this.canvas.clientWidth, 10)
    this.height = parseInt(this.canvas.clientHeight, 10)

    Shadertoy.SetBlend(this.gl, false)
    let buffersDepTextureArr = []
    this.buffers = buffers

    buffers.forEach(val => {
      // 检查是否有循环引用
      val.depTextureArr && val.depTextureArr.forEach(val2 => {
        if (val.ID === val2.ID) val.circulation = true
      })
      buffersDepTextureArr = buffersDepTextureArr.concat(val.depTextureArr)
    })

    this.allTexturs = main.depTextureArr.concat(buffersDepTextureArr)

    this.canvas.setAttribute('width', this.width)
    this.canvas.setAttribute('height', this.height)

    this.initFramebuffer(buffers)
    this.initProgram(this.gl, main, buffers)

    window.addEventListener('keydown', event => {
      // 暂停
      if (event.keyCode === 32) {
        event.preventDefault()
        if (this.running) {
          this.stop()
        } else {
          this.start()
        }
      }
    })
    let mouse = (this.mouse = [0.0, 0.0, 0.0, 0.0])

    this.canvas.addEventListener(
      'mousemove',
      evt => {

        if (mouse[2] + mouse[3] !== 0) {
          var rect = this.canvas.getBoundingClientRect()
          mouse[0] = evt.clientX - rect.left
          mouse[1] = this.width - evt.clientY - rect.top
        }
      },
      false
    )
    this.canvas.addEventListener(
      'mousedown',
      evt => {
        if (evt.button === 0) mouse[2] = 1.01
        if (evt.button === 2) mouse[3] = 1.01
      },
      false
    )
    this.canvas.addEventListener(
      'mouseup',
      evt => {
        if (evt.button === 0) mouse[2] = 0
        if (evt.button === 2) mouse[3] = 0
      },
      false
    )
  }
  init() {
    // 异步加载图片纹理
    return Promise.all(
      this.allTexturs.map((val, idx) => {
        return val && val.type === 'image' && this.loadImageTexture(val, idx)
      })
    )
  }
  getExtension(gl) {
    gl.getExtension('EXT_color_buffer_float');
    gl.getExtension('OES_texture_float_linear');
    gl.getExtension('OES_texture_half_float_linear');
    gl.getExtension('EXT_texture_filter_anisotropic');
  }
  initFramebuffer(buffers) {
    buffers.forEach(val => {
      this.creatFramebufferTextureMap(val.ID)
      val.circulation && this.creatFramebufferTextureMap(`${val.ID}_${Shadertoy._randomStr}`)
    })
  }
  creatFramebufferTextureMap(id) {
    let gl = this.gl
    let tt = Shadertoy.createTargetTexture(
      gl,
      this.width,
      this.height,
    )
    let fs = Shadertoy.createFramebuffers(gl, tt)
    Shadertoy.framebufferTextureMap[id] = {
      texture: tt,
      framebuffer: fs
    }
  }

  initProgram(gl, main, buffers) {
    buffers &&
      buffers.forEach(val => {
        this.bufferShaderMap[val.ID] = Shadertoy.ininShader(gl, val.fragmentStr, val.depTextureArr)
      })

    this.mainShader = Shadertoy.ininShader(
      gl,
      main.fragmentStr,
      main.depTextureArr
    )
    this.vertexBuffer = Shadertoy.createVBO(gl, 3, [
      1.0,
      1.0,
      0.0,
      -1.0,
      1.0,
      0.0,
      1.0,
      -1.0,
      0.0,
      -1.0,
      -1.0,
      0.0
    ])

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
    gl.vertexAttribPointer(0, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(0)
  }
  initDebugMode() {
    this.debugShader = Shadertoy.ininShader(
      this.gl,
      `void mainImage( out vec4 fragColor, in vec2 fragCoord )
    {
      vec2 uv = fragCoord.xy / iResolution.xy;

      fragColor = vec4(texture(iChannel0, uv).rgb, 1.0);
    }`,
      []
    )
  }
  _frame(gl) {
    if (!this.running) {
      return
    }
    this.frame++
    this.time = Shadertoy.getTime() - this.time0
    this.timePreviousFrame = this.time

    this.buffers.forEach((buffer, idx) => {
      this.drawToFramebuffer(
        buffer
      )
    })

    this.drawToCanvas(this.mainShader)
    requestAnimationFrame(() => this._frame(gl))
  }
  start() {
    if (this.running) {
      return
    }
    this.running = true
    this.frame = 0
    this.time0 = Shadertoy.getTime()
    this.timePreviousFrame = this.time0
    this.gl.viewport(0, 0, this.width, this.height)
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0)
    this.gl.disable(this.gl.DEPTH_TEST)

    this._frame(this.gl)
  }
  drawToCanvas(shader) {
    const gl = this.gl
    gl.clear(gl.COLOR_BUFFER_BIT)

    shader.userShader()
    shader.textures.forEach((val, idx) => {
      if (!val || !val.ID) return
      let texture = Shadertoy.getTexture(val.ID)
      gl.activeTexture(gl.TEXTURE0 + idx)
      gl.bindTexture(gl.TEXTURE_2D, texture)
      shader.setInt('iChannel' + idx, idx)
    })
    shader.setVec3('iResolution', [this.width, this.height, 0.0])
    shader.setFloat('iTime', this.time)
    shader.setVec4('iMouse', this.mouse)
    shader.setVec4('iFrame', this.frame / this.time)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.vertexBuffer.numItems)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.bindTexture(gl.TEXTURE_2D, null)
  }
  drawToFramebuffer(buffer) {
    const gl = this.gl
    const shader = this.bufferShaderMap[buffer.ID]
    const framebufferAndTexObj = Shadertoy.framebufferTextureMap[buffer.ID]
    gl.clear(gl.COLOR_BUFFER_BIT)

    shader.userShader()

    if (framebufferAndTexObj) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebufferAndTexObj.framebuffer)
    }

    shader.textures.forEach((val, idx) => {
      if (!val.type) return
      let texture = Shadertoy.getTexture(buffer.ID === val.ID ? `${val.ID}_${Shadertoy._randomStr}` : val.ID)
      gl.activeTexture(gl.TEXTURE0 + idx)
      gl.bindTexture(gl.TEXTURE_2D, texture)
      shader.setInt('iChannel' + idx, idx)
    })

    shader.setVec3('iResolution', [this.width, this.height, 0.0])
    shader.setFloat('iTime', this.time)
    shader.setVec4('iMouse', this.mouse)
    shader.setVec4('iFrame', this.frame / this.time)

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.vertexBuffer.numItems)

    if (buffer.circulation) {
      let fto = Shadertoy.framebufferTextureMap[`${buffer.ID}_${Shadertoy._randomStr}`]
      Shadertoy.copyTex(
        this.gl,
        fto,
        this.width,
        this.height
      )
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.bindTexture(gl.TEXTURE_2D, null)
  }
  loadImageTexture(sourceObj, idx) {
    if (!sourceObj.path) return
    return new Promise((resolve, rejcet) => {
      var texture = this.gl.createTexture()
      var gl = this.gl
      texture.image = new Image()
      texture.image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
        gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, 0)
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGB,
          gl.RGB,
          gl.UNSIGNED_BYTE,
          texture.image
        )
        Shadertoy.setTexParam(this.gl, 'image')
        gl.bindTexture(gl.TEXTURE_2D, null)
        Shadertoy.imageTextureObj[sourceObj.ID] = texture
        resolve()
      }
      texture.image.src = sourceObj.path
    })
  }



  stop() {
    this.running = false
  }

  static ininShader(gl, fragmentShaderStr, depTextureArr) {
    let fragmentShader = Shadertoy.genFragmentShader(fragmentShaderStr)

    let _shader = new Shader(gl, vertexShader, fragmentShader)
    _shader.textures = depTextureArr
    return _shader
  }
  static SetBlend(gl, enabled) {
    if (enabled) {
      gl.enable(gl.BLEND)
      gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD)
      gl.blendFuncSeparate(
        gl.SRC_ALPHA,
        gl.ONE_MINUS_SRC_ALPHA,
        gl.ONE,
        gl.ONE_MINUS_SRC_ALPHA
      )
    } else {
      gl.disable(gl.BLEND)
    }
  }
  // 复制当前帧到纹理
  static copyTex(gl, dst, w, h) {
    gl.bindTexture(gl.TEXTURE_2D, dst.texture);
    gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 0, 0, w, h);
  }

  static getTexture(ID) {
    return (
      Shadertoy.imageTextureObj[ID] ||
      Shadertoy.framebufferTextureMap[ID].texture
    )
  }
  static generateRandomAlphaNum(len) {
    var rdmString = "";
    for (; rdmString.length < len; rdmString += Math.random().toString(36).substr(2));
    return rdmString.substr(0, len);
  }
  static genFragmentShader(fragmentShaderStr) {
    return `#version 300 es
    #ifdef GL_ES
      precision highp float;
      precision highp int;
      precision mediump sampler3D;
    #endif
    out vec4 my_FragColor;

    uniform vec3 iResolution;
    uniform float iTime;
    uniform vec4 iMouse;
    uniform sampler2D iChannel0;
    uniform sampler2D iChannel1;
    uniform sampler2D iChannel2;
    uniform sampler2D iChannel3;


    ${fragmentShaderStr}

    void main() {
      vec4 color = vec4(1.0);
      mainImage(color, gl_FragCoord.xy);
      my_FragColor = color;
    }`
  }
  static getContext(canvas) {
    let opt = {
      alpha: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      antialias: false,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance'
    }
    let gl = canvas.getContext('webgl2', opt)
    if (!gl) {
      gl =
        canvas.getContext('webgl', opt) ||
        canvas.getContext('experimental-webgl', opt)
    }
    if (!gl) {
      console.log('your browser does not support WebGL')
    }
    return gl
  }
  static createFramebuffers(gl, targetTexture) {
    let level = 0
    const framebuffers = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers)

    const attachmentPoint = gl.COLOR_ATTACHMENT0
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      attachmentPoint,
      gl.TEXTURE_2D,
      targetTexture,
      level
    )

    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
      console.log('FRAMEBUFFER_NOT_COMPLETE')
    }
    return framebuffers
  }
  static createTargetTexture(gl, width, height) {
    const targetTextureWidth = width
    const targetTextureHeight = height

    const targetTexture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, targetTexture)

    const level = 0
    const border = 0
    Shadertoy.setTexParam(gl, 'framebuffer')
    gl.texImage2D(
      gl.TEXTURE_2D,
      level,
      gl.RGBA32F,
      targetTextureWidth,
      targetTextureHeight,
      border,
      gl.RGBA,
      gl.FLOAT,
      null
    )

    return targetTexture
  }
  static setTexParam(gl, type) {
    if (type === 'framebuffer') {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_MIN_FILTER,
        gl.LINEAR_MIPMAP_LINEAR
      )
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)
      gl.generateMipmap(gl.TEXTURE_2D)
    }
  }
  static createVBO(gl, stride, vertexData) {
    var vertexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW)
    vertexBuffer.itemSize = stride
    vertexBuffer.numItems = vertexData.length / stride
    return vertexBuffer
  }

  static showLog(gl, shader) {
    var compilationLog = gl.getShaderInfoLog(shader)
    console.log('ERROR: ' + compilationLog)
  }

  static getTime() {
    return new Date().getTime() / 1000
  }
}
