/* Compatibility */
(function () {
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
      || window[vendors[x] + 'CancelRequestAnimationFrame'];
  }
})();

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

export default class Shadertoy {
  constructor(options) {
    this.textureSrcArr = options.textureSrcArr
    this.canvas = options.canvasDom;
    this.gl = this.getGLContext(this.canvas);

    this.textures = [];
    this.running = false;
    this.time0 = 0.0;

    this.width = parseInt(this.canvas.clientWidth, 10);
    this.height = parseInt(this.canvas.clientHeight, 10);

    this.canvas.setAttribute('width', this.width);
    this.canvas.setAttribute('height', this.height);

    let vertexShader = `#version 300 es
    in vec4 aPosition;

    void main() {
       gl_Position = aPosition;
    }`;

    let fragmentShader = `#version 300 es
    precision mediump float;
    out vec4 my_FragColor;
    uniform vec3 iResolution;
    uniform float iTime;
    uniform sampler2D iChannel0;
    uniform sampler2D iChannel1;
    uniform sampler2D iChannel2;
    uniform sampler2D iChannel3;

    const vec4 iMouse = vec4(0.0, 0.0, 0.0, 0.0);

    ${options.fragmentShaderStr}

    void main() {
      vec4 color = vec4(0.0);
      mainImage(color, gl_FragCoord.xy);
      my_FragColor = color;
    }`

    this.shader = Shadertoy.linkShader(this.gl, vertexShader, fragmentShader);
    this.shader.vertexAttribute = this.gl.getAttribLocation(this.shader, "aPosition");
    this.gl.enableVertexAttribArray(this.shader.vertexAttribute);

    this.vertexBuffer = Shadertoy.createVBO(this.gl, 3,
      [1.0, 1.0, 0.0,
        -1.0, 1.0, 0.0,
        1.0, -1.0, 0.0,
        -1.0, -1.0, 0.0
      ]);



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
  getGLContext(canvas) {
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
  start() {
    if (this.running) {
      return;
    }
    this.running = true;
    this.time0 = Shadertoy.getTime();
    this.timePreviousFrame = this.time0;

    this.gl.disable(this.gl.DEPTH_TEST);
    this.gl.viewport(0, 0, this.width, this.height);
    this.gl.useProgram(this.shader);

    this._frame(this.gl);
  }

  stop() {
    this.running = false;
  }

  _frame(gl) {
    if (!this.running) {
      return;
    }

    let shader = this.shader;
    let time = Shadertoy.getTime() - this.time0;
    // let dt = time - this.timePreviousFrame;
    this.timePreviousFrame = time;


    gl.clear(gl.DEPTH_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(shader.vertexAttribute, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // set texture
    this.textures.forEach((val, idx) => {
      let texture = this.textures[idx];
      gl.activeTexture(gl.TEXTURE0 + idx);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(gl.getUniformLocation(shader, 'iChannel' + idx), idx);
    })


    // update uniforms
    gl.uniform3f(gl.getUniformLocation(shader, "iResolution"), this.width, this.height, 0.0);

    gl.uniform1f(gl.getUniformLocation(shader, "iTime"), time);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.vertexBuffer.numItems);

    requestAnimationFrame(() => this._frame(gl));
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

    program.uniformLocation = (gl, name) => gl.getUniformLocation(program, name);

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