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

/*
options = {
  canvasDom,
  fragmentShaderStr,
  textureSrcArr,
}
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
  static framebufferTextureObj = {}

  constructor(canvas, main, buffers, debug) {
    this.canvas = canvas
    this.gl = Shadertoy.getContext(this.canvas)
    if (debug) {
      this.initDebugMode()
    }

    this.running = false
    this.time0 = 0.0
    this.bufferShaderArr = []
    this.width = parseInt(this.canvas.clientWidth, 10)
    this.height = parseInt(this.canvas.clientHeight, 10)

    Shadertoy.SetBlend(this.gl, false)
    let buffersDepTextureArr = []
    this.buffers = buffers

    buffers.forEach(val => {
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
        if (mouse.z + mouse.w !== 0) {
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
        if (evt.button === 0) mouse[2] = 1
        if (evt.button === 2) mouse[3] = 1
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
        return val.type === 'image' && this.loadTexture(val, idx)
      })
    )
  }
  initFramebuffer(buffers) {
    buffers.forEach(val => {
      this.creatFramebufferTextureObj(val.ID)
      if (val.circulation) {
        this.creatFramebufferTextureObj(val.ID + '_Copy', true)
      }
    })
  }
  creatFramebufferTextureObj(id, flag) {
    let gl = this.gl
    let format = flag
      ? {
          if: gl.RGBA,
          fo: gl.RGBA,
          ty: gl.UNSIGNED_BYTE
        }
      : {
          if: gl.RGBA,
          fo: gl.RGBA,
          ty: gl.UNSIGNED_BYTE
        }
    // debugger
    let tt = Shadertoy.createTargetTexture(
      this.gl,
      this.width,
      this.height,
      format
    )
    let fs = Shadertoy.createFramebuffers(this.gl, tt)
    Shadertoy.framebufferTextureObj[id] = {
      texture: tt,
      framebuffer: fs
    }
  }

  initProgram(gl, main, buffers) {
    buffers &&
      buffers.forEach(val => {
        this.bufferShaderArr.push(
          Shadertoy.ininShader(gl, val.fragmentStr, val.depTextureArr)
        )
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
      fragColor = vec4(texture(iChannel0, fragCoord).rgb, 1.0);
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

    this.buffers.forEach((val, idx) => {
      this.draw(
        this.bufferShaderArr[idx],
        Shadertoy.framebufferTextureObj[val.ID],
        val.ID
      )
    })

    this.draw(this.mainShader)
    requestAnimationFrame(() => this._frame(gl))
  }
  draw(shader, framebufferTextureObj, ID) {
    const gl = this.gl
    gl.clear(gl.COLOR_BUFFER_BIT)
    shader.userShader()

    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.bindTexture(gl.TEXTURE_2D, null)
    
    if (framebufferTextureObj) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebufferTextureObj.framebuffer)
    }
    
    shader.textures.forEach((val, idx) => {
      if (!val.type) return
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

    if (ID === 'Buffer_A') {
      let fto = Shadertoy.framebufferTextureObj[`${ID}_Copy`]
      Shadertoy.copyFramebuffer(
        this.gl,
        framebufferTextureObj.framebuffer,
        fto.framebuffer,
        this.width,
        this.height
      )
    }
  }
  loadTexture(sourceObj, idx) {
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

  start() {
    if (this.running) {
      return
    }
    this.running = true
    this.frame = 0
    this.time0 = Shadertoy.getTime()
    this.timePreviousFrame = this.time0

    this.gl.disable(this.gl.DEPTH_TEST)
    this.gl.viewport(0, 0, this.width, this.height)
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0)
    this._frame(this.gl)
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
  static copyFramebuffer(gl, src, dst, w, h) {
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, src)
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, dst)

    gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 0, 0, w, h)
    // gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.bindTexture(gl.TEXTURE_2D, null)
  }

  static getTexture(ID) {
    return (
      Shadertoy.imageTextureObj[ID] ||
      Shadertoy.framebufferTextureObj[ID].texture
    )
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
  static createTargetTexture(gl, width, height, format) {
    const targetTextureWidth = width
    const targetTextureHeight = height

    const targetTexture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, targetTexture)

    const level = 0
    const internalFormat = format.if
    const border = 0
    const form = format.fo
    const type = format.ty
    Shadertoy.setTexParam(gl, 'framebuffer')
    gl.texImage2D(
      gl.TEXTURE_2D,
      level,
      internalFormat,
      targetTextureWidth,
      targetTextureHeight,
      border,
      form,
      type,
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
