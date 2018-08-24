export default class Shader{
  constructor(gl, vertexSource, fragmentSource) {
    this.gl = gl;
    this.shader = Shader.linkShader(gl, vertexSource, fragmentSource)
  }
  userShader() {
    this.gl.useProgram(this.shader)
  }
  setVec3(id, vec3) {
    this.gl.uniform3f(this.gl.getUniformLocation(this.shader, id), vec3[0], vec3[1], vec3[2]);
  }
  setVec4(id, vec4) {
    this.gl.uniform4f(this.gl.getUniformLocation(this.shader, id), vec4[0], vec4[1], vec4[2], vec4[3]);
  }
  setFloat(id, float) {
    this.gl.uniform1f(this.gl.getUniformLocation(this.shader, id), float);
  }
  setInt(id, int) {
    this.gl.uniform1i(this.gl.getUniformLocation(this.shader, id), int);
  }
  static linkShader(gl, vertexSource, fragmentSource) {
    var program = gl.createProgram();
    gl.attachShader(program, Shader.compileShader(gl, gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, Shader.compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      Shader.showLog(gl, program);
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
      Shader.showLog(gl, shader);
      throw Error(`Failed to compile ${type}`);
    }
    return shader;
  }

  static showLog(gl, shader) {
    var compilationLog = gl.getShaderInfoLog(shader);
    console.log('ERROR: ' + compilationLog);
  }
}