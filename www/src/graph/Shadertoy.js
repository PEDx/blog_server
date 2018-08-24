
import "./Compatibility"
import Shader from "./Shader"
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
    }`;
export default class Shadertoy {
  constructor(options) {
    this.textureSrcArr = options.textureSrcArr
    this.canvas = options.canvasDom;
    this.gl = Shadertoy.getContext(this.canvas);

    this.textures = [];
    this.running = false;
    this.time0 = 0.0;

    this.initCanvas()
    this.initProgram(options.fragmentShaderStr)
    this.initFramebuffers(options.framebuffers)

    window.addEventListener("keydown", (event) => {
      // 暂停
      if (event.keyCode === 32) {
        event.preventDefault();
        if (this.running) {
          this.stop();
        } else {
          this.start();
        }
      }
    });
  }
  init() {
    return Promise.all(this.textureSrcArr.map((val, idx) => {
      return this.loadTexture(val, idx)
    }))
  }
  initCanvas() {
    this.width = parseInt(this.canvas.clientWidth, 10);
    this.height = parseInt(this.canvas.clientHeight, 10);
    this.canvas.setAttribute('width', this.width);
    this.canvas.setAttribute('height', this.height);
  }
  initProgram(fragmentShaderStr) {
    const gl = this.gl;
    let fragmentShader = Shadertoy.genFragmentShader(fragmentShaderStr)

    this.shader0 = new Shader(gl, vertexShader, fragmentShader);
    // this.shader = Shadertoy.linkShader(gl, vertexShader, fragmentShader);

    this.vertexBuffer = Shadertoy.createVBO(gl, 3,
      [1.0, 1.0, 0.0,
        -1.0, 1.0, 0.0,
        1.0, -1.0, 0.0,
        -1.0, -1.0, 0.0
      ]);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
      gl.vertexAttribPointer(0, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(0);
  }
  initFramebuffers() {

  }
  loadTexture(source, idx) {
    if (!source) return;
    return new Promise((resolve, rejcet) => {
      var texture = this.gl.createTexture();
      var gl = this.gl;
      texture.image = new Image();

      texture.image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.bindTexture(gl.TEXTURE_2D, null);
        this.textures[idx] = texture
        resolve()
      };
      texture.image.src = source;
    })

  }

  start() {
    if (this.running) {
      return;
    }
    this.running = true;
    this.time0 = Shadertoy.getTime();
    this.timePreviousFrame = this.time0;

    this.gl.disable(this.gl.DEPTH_TEST);
    this.gl.viewport(0, 0, this.width, this.height);

    this._frame(this.gl);
  }

  stop() {
    this.running = false;
  }

  _frame(gl) {
    if (!this.running) {
      return;
    }
    this.draw(this.shader0)
    requestAnimationFrame(() => this._frame(gl));
  }

  draw(shader, renderToTexture) {
    const gl = this.gl;
    let time = Shadertoy.getTime() - this.time0;
    // let dt = time - this.timePreviousFrame;
    this.timePreviousFrame = time;
    shader.userShader()
    gl.clear(gl.DEPTH_BUFFER_BIT);

    // set texture
    this.textures.forEach((val, idx) => {
      let texture = this.textures[idx];
      gl.activeTexture(gl.TEXTURE0 + idx);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      shader.setInt('iChannel' + idx, idx );
    })

    // update uniforms
    shader.setVec3("iResolution", [this.width, this.height, 0.0] )
    shader.setFloat("iTime", time )

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.vertexBuffer.numItems);
  }
  drawToTexture() {

  }
  static genFragmentShader(fragmentShaderStr) {
    return `#version 300 es
    precision mediump float;

    out vec4 my_FragColor;

    uniform vec3 iResolution;
    uniform float iTime;
    uniform sampler2D iChannel0;
    uniform sampler2D iChannel1;
    uniform sampler2D iChannel2;
    uniform sampler2D iChannel3;

    const vec4 iMouse = vec4(0.0, 0.0, 0.0, 0.0);

    ${fragmentShaderStr}

    void main() {
      vec4 color = vec4(0.0);
      mainImage(color, gl_FragCoord.xy);
      my_FragColor = color;
    }`;
  }
  static getContext(canvas) {
    let gl = canvas.getContext('webgl2');
    if (!gl) {
      gl = canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl');
    }
    if (!gl) {
      console.log('your browser does not support WebGL');
    }
    return gl;
  }
  static createFramebuffers(gl, targetTexture) {
    let level = 0;
    const framebuffers = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers);

    const attachmentPoint = gl.COLOR_ATTACHMENT0;
    gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, targetTexture, level);
    return framebuffers;
  }
  static createTargetTexture(gl, width, height) {
    const targetTextureWidth = width;
    const targetTextureHeight = height;

    const targetTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, targetTexture);

    const level = 0;
    const internalFormat = gl.RGBA;
    const border = 0;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
      targetTextureWidth, targetTextureHeight, border,
      format, type, null);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    return targetTexture
  }

  static createVBO(gl, stride, vertexData) {
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
    vertexBuffer.itemSize = stride;
    vertexBuffer.numItems = vertexData.length / stride;
    return vertexBuffer;
  }

  static linkShader(gl, vertexSource, fragmentSource) {
    var program = gl.createProgram();
    gl.attachShader(program, Shadertoy.compileShader(gl, gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, Shadertoy.compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      Shadertoy.showLog(gl, program);
      throw Error(`Failed to link shader!`);
    }

    return program;
  }

  static compileShader(gl, shaderType, source) {
    var shader = gl.createShader(shaderType);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      let type = shaderType === gl.VERTEX_SHADER ? 'vertex shader' : 'fragment shader';
      Shadertoy.showLog(gl, shader);
      throw Error(`Failed to compile ${type}`);
    }
    return shader;
  }

  static showLog(gl, shader) {
    var compilationLog = gl.getShaderInfoLog(shader);
    console.log('ERROR: ' + compilationLog);
  }

  static getTime() {
    return 0.001 * new Date().getTime();
  }
}