
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
  // 图片纹理合集
  static imageTextureObj = {}
  // 帧缓冲纹理合集
  static framebufferTextureObj = {}

  constructor(canvas, main, buffers) {
    this.canvas = canvas;
    this.gl = Shadertoy.getContext(this.canvas);
    this.running = false;
    this.time0 = 0.0;
    this.width = parseInt(this.canvas.clientWidth, 10);
    this.height = parseInt(this.canvas.clientHeight, 10);


    let buffersDepTextureArr = []
    buffers.forEach(val => {
      buffersDepTextureArr = buffersDepTextureArr.concat(val.depTextureArr)
    })

    this.allTexturs = main.depTextureArr.concat(buffersDepTextureArr);

    this.initCanvas()
    this.initFramebuffer(buffers)
    this.initProgram(main.fragmentStr, main.depTextureArr, buffers)

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
    let mouse = this.mouse  = []

    this.canvas.addEventListener('mousemove', (evt) => {
      if (mouse.z + mouse.w !== 0) {
          var rect = this.canvas.getBoundingClientRect();
          mouse[0] = evt.clientX - rect.left;
          mouse[1] = this.width - evt.clientY - rect.top;
      } 
  }, false);
    this.canvas.addEventListener('mousedown', (evt) => {
        if (evt.button === 0)
            mouse[2] = 1;
        if (evt.button === 2)
            mouse[3] = 1;
    }, false);
    this.canvas.addEventListener('mouseup', (evt) => {
        if (evt.button === 0)
          mouse[2] = 0;
        if (evt.button === 2)
          mouse[3] = 0;
    }, false);

  }
  init() {
    // 异步加载图片纹理
    return Promise.all(this.allTexturs.map((val, idx) => {
      return val.type === "image" && this.loadTexture(val, idx)
    }))
  }
  initFramebuffer(buffers) {
    buffers.forEach((val => {
      this.creatFramebufferTextureObj(val.ID)
      if(val.circulation){
        this.creatFramebufferTextureObj(val.ID + "_c")
        // Shadertoy.framebufferTextureObj[val.ID +  "_c"] = {
        //   texture: Shadertoy.createTargetTexture(this.gl, this.width, this.height),
        // }
      }
    }))
  }
  creatFramebufferTextureObj(id, flag) {
    let tt = Shadertoy.createTargetTexture(this.gl, this.width, this.height)
    let fs = Shadertoy.createFramebuffers(this.gl, tt)
    Shadertoy.framebufferTextureObj[id] = {
      texture: tt,
      framebuffer: fs
    }
  }

  initCanvas() {

    this.canvas.setAttribute('width', this.width);
    this.canvas.setAttribute('height', this.height);
  }
  initProgram(fragmentStr, depTextureArr, buffers) {
    const gl = this.gl;

    this.shader0 = Shadertoy.ininShader(gl, buffers[0].fragmentStr, buffers[0].depTextureArr)
    this.shader1 = Shadertoy.ininShader(gl, buffers[1].fragmentStr, buffers[1].depTextureArr)
    this.shader2 = Shadertoy.ininShader(gl, buffers[2].fragmentStr, buffers[2].depTextureArr)
    this.shader3 = Shadertoy.ininShader(gl, buffers[3].fragmentStr, buffers[3].depTextureArr)
    this.shader = Shadertoy.ininShader(gl, fragmentStr, depTextureArr)
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
  static ininShader(gl, fragmentShaderStr, depTextureArr) {
    let fragmentShader = Shadertoy.genFragmentShader(fragmentShaderStr)

    let _shader = new Shader(gl, vertexShader, fragmentShader);
    _shader.textures = depTextureArr
    return _shader
  }
  loadTexture(sourceObj, idx) {
    if (!sourceObj.path) return;
    return new Promise((resolve, rejcet) => {
      var texture = this.gl.createTexture();
      var gl = this.gl;
      texture.image = new Image();
      let format = gl[sourceObj.format || "RGBA"]
      texture.image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, format, format, gl.UNSIGNED_BYTE, texture.image);
        Shadertoy.setTexParam(this.gl, "image")
        gl.bindTexture(gl.TEXTURE_2D, null);
        Shadertoy.imageTextureObj[sourceObj.ID] = texture
        resolve()
      };
      texture.image.src = sourceObj.path;
    })

  }

  start() {
    if (this.running) {
      return;
    }
    this.running = true;
    this.frame = 0;
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
    this.frame++;
    this.time = Shadertoy.getTime() - this.time0;
    // let dt = time - this.timePreviousFrame;
    this.timePreviousFrame = this.time;

    this.draw(this.shader0, Shadertoy.framebufferTextureObj["Buffer_A"], true)
    this.draw(this.shader1, Shadertoy.framebufferTextureObj["Buffer_B"])
    this.draw(this.shader2, Shadertoy.framebufferTextureObj["Buffer_C"])
    this.draw(this.shader3, Shadertoy.framebufferTextureObj["Buffer_D"])
    this.draw(this.shader)
    requestAnimationFrame(() => this._frame(gl));
  }

  draw(shader, framebufferTextureObj, circulation) {
    const gl = this.gl;
    
    gl.clear(gl.DEPTH_BUFFER_BIT);
    shader.userShader()

    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    if (framebufferTextureObj) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebufferTextureObj.framebuffer);
     }
    // set texture
    shader.textures.forEach((val, idx) => {
      if (!val.type) return;
      let texture = Shadertoy.getTexture(val.ID);
      gl.activeTexture(gl.TEXTURE0 + idx);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      shader.setInt('iChannel' + idx, idx);
    })

    // update uniforms
    shader.setVec3("iResolution", [this.width, this.height, 0.0])
    shader.setFloat("iTime", this.time)
    shader.setVec4("iMouse", this.mouse)
    shader.setVec4("iFrame", this.frame / this.time)

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.vertexBuffer.numItems);

  
    if(circulation) {
      let fto = Shadertoy.framebufferTextureObj["Buffer_A_c"]
      // let fbo = Shadertoy.createFramebuffers(this.gl, framebufferTextureObj.texture)
      // gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
      // gl.bindTexture(gl.TEXTURE_2D, fto.texture);
      
      // gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, 0 , 0, 0, 0, this.width, this.height);

      // gl.bindTexture(gl.TEXTURE_2D,null);
      Shadertoy.copyFramebuffer(this.gl, framebufferTextureObj.framebuffer, fto.framebuffer, this.width, this.height);
    }
  }
  static copyFramebuffer(gl, src, dst, w, h) {
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, src);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, dst);
    gl.clearBufferfv(gl.COLOR, 0, [0.0, 0.0, 0.0, 1.0]);
    gl.blitFramebuffer( 0, 0, w,h,
                         0, 0, w,h,
                         gl.COLOR_BUFFER_BIT, gl.LINEAR
    );
  }

  static getTexture(ID) {
    return Shadertoy.imageTextureObj[ID] || Shadertoy.framebufferTextureObj[ID].texture
  }
  static genFragmentShader(fragmentShaderStr) {
    return `#version 300 es
    precision mediump float;

    out vec4 my_FragColor;

    uniform vec3 iResolution;
    uniform float iTime;
    uniform vec4 iMouse;
    uniform sampler2D iChannel0;
    uniform sampler2D iChannel1;
    uniform sampler2D iChannel2;
    uniform sampler2D iChannel3;

    // const vec4 iMouse = vec4(0.0, 0.0, 0.0, 0.0);

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

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
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

    Shadertoy.setTexParam(gl, "framebuffer")

    return targetTexture
  }
  static setTexParam(gl, type) {
    if(type === "framebuffer") {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.generateMipmap(gl.TEXTURE_2D);
    }
  }
  static createVBO(gl, stride, vertexData) {
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
    vertexBuffer.itemSize = stride;
    vertexBuffer.numItems = vertexData.length / stride;
    return vertexBuffer;
  }

  static showLog(gl, shader) {
    var compilationLog = gl.getShaderInfoLog(shader);
    console.log('ERROR: ' + compilationLog);
  }

  static getTime() {
    return  new Date().getTime() / 1000;
  }
}