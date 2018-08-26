'use strict'

function buildInputsUI(me) {
  me.mMarks = null

  for (let i = 0; i < 4; i++) {
    var par = document.getElementById('texture' + i)
    var can = document.getElementById('myUnitCanvas' + i)
    var bar = document.getElementById('inputSelectorControls' + i)

    par.onmouseover = function(ev) {
      var ele = piGetSourceElement(ev)
      var pattern = 'iChannel' + i

      me.mMarks = new Array()
      var cm = me.mCodeEditor
      var num = cm.lineCount()
      for (var j = 0; j < num; j++) {
        var str = cm.getLine(j)
        var res = str.indexOf(pattern)
        if (res < 0) continue
        cm.addLineClass(j, 'background', 'cm-highlight')
        me.mMarks.push(j)
      }
    }

    par.onmouseout = function(ev) {
      var cm = me.mCodeEditor
      if (me.mMarks == null) return
      var num = me.mMarks.length
      for (var j = 0; j < num; j++) {
        var l = me.mMarks.pop()
        cm.removeLineClass(l, 'background', 'cm-highlight')
      }
      me.mMarks = null
    }

    var ww = can.offsetWidth
    var hh = can.offsetHeight
    can.width = ww
    can.height = hh

    can.onclick = function(ev) {
      var passType = me.mEffect.GetPassType(me.mActiveDoc)
      overlay(i, passType)
    }
    /*
            var z = document.createElement( "div" );
            z.src="/img/close2.png";
            z.title="remove input";
            z.id="myNoInput" + i;
//z.style.right="0px";
            //z.className = "uiButton hidden";

z.style="background-color:#ff0000; width:32px; height:32px; cursor: pointer; margin-left:auto; margin-right:0;";


//            z.style.visibility = 'hidden';
            z.onclick = function(ev) { me.SetTexture(i, { mType: null, mID: -1, mSrc: null, mSampler: {} }); }
            par.appendChild( z );
*/
    var dei = document.getElementById('myDeleteInput' + i)
    dei.id = 'myNoInput' + i
    dei.onclick = function(ev) {
      me.SetTexture(i, { mType: null, mID: -1, mSrc: null, mSampler: {} })
    }

    var z = document.createElement('img')
    z.src = '/img/themes/' + gThemeName + '/pause.png'
    z.title = 'pause/resume'
    z.id = 'myPauseButton' + i
    z.style.right = '68px'
    z.style.top = '1px'
    z.className = 'uiButton'
    z.style.visibility = 'hidden'
    z.onclick = function(ev) {
      var ele = piGetSourceElement(ev)
      var r = me.PauseInput(i)
      if (r === true) ele.src = '/img/themes/' + gThemeName + '/play.png'
      else ele.src = '/img/themes/' + gThemeName + '/pause.png'
    }
    bar.appendChild(z)

    z = document.createElement('img')
    z.src = '/img/themes/' + gThemeName + '/rewind.png'
    z.title = 'rewind'
    z.id = 'myRewindButton' + i
    z.style.right = '46px'
    z.style.top = '1px'
    z.className = 'uiButton'
    z.style.visibility = 'hidden'
    z.onclick = function(ev) {
      var ele = piGetSourceElement(ev)
      var r = me.RewindInput(i)
    }
    bar.appendChild(z)

    z = document.createElement('img')
    z.src = '/img/themes/' + gThemeName + '/speakerOn.png'
    z.title = 'mute'
    z.id = 'myMuteButton' + i
    z.style.right = '24px'
    z.style.top = '1px'
    z.className = 'uiButton'
    z.style.visibility = 'hidden'
    z.onclick = function(ev) {
      var ele = piGetSourceElement(ev)
      var r = me.MuteInput(i)
      if (r === true) ele.src = '/img/themes/' + gThemeName + '/speakerOff.png'
      else ele.src = '/img/themes/' + gThemeName + '/speakerOn.png'
    }
    bar.appendChild(z)

    z = document.createElement('img')
    z.src = '/img/themes/' + gThemeName + '/options.png'
    z.title = 'sampler options'
    z.id = 'mySamplingButton' + i
    z.style.right = '2px'
    z.style.top = '1px'
    z.className = 'uiButton'
    z.onclick = function(ev) {
      var ele = piGetSourceElement(ev)
      var sam = document.getElementById('mySampler' + i)
      if (sam.className === 'inputSampler visible') {
        sam.className = 'inputSampler hidden'
      } else {
        var eleSamplerFilter = document.getElementById('mySamplerFilter' + i)
        var eleSamplerWrap = document.getElementById('mySamplerWrap' + i)
        var eleSamplerVFlip = document.getElementById('mySamplerVFlip' + i)
        var eleSamplerVFlipLabel = document.getElementById(
          'mySamplerVFlipLabel' + i
        )

        eleSamplerFilter.value = me.GetSamplerFilter(i)
        eleSamplerWrap.value = me.GetSamplerWrap(i)
        eleSamplerVFlip.checked = me.GetSamplerVFlip(i) == 'true'

        // see if this input accepts mipmapping
        var al = me.GetAcceptsLinear(i)
        eleSamplerFilter.options[1].style.display =
          al == true ? 'inherit' : 'none'
        var am = me.GetAcceptsMipmapping(i)
        eleSamplerFilter.options[2].style.display =
          am == true ? 'inherit' : 'none'
        var ar = me.GetAcceptsWrapRepeat(i)
        eleSamplerWrap.options[1].style.display =
          ar == true ? 'inherit' : 'none'
        var av = me.GetAcceptsVFlip(i)
        eleSamplerVFlip.style.display = av == true ? 'inherit' : 'none'
        eleSamplerVFlipLabel.style.display = av == true ? 'inherit' : 'none'

        sam.className = 'inputSampler visible'
      }
    }

    bar.appendChild(z)
  }
}

function ShaderToy(parentElement, editorParent, passParent) {
  if (parentElement == null) return
  if (editorParent == null) return
  if (passParent == null) return

  var me = this

  this.mPassParent = passParent
  this.mNeedsSave = false
  this.mAreThereAnyErrors = false
  this.mAudioContext = null
  this.mCreated = false
  this.mGLContext = null
  this.mHttpReq = null
  this.mEffect = null
  this.mTo = null
  this.mTOffset = 0
  this.mCanvas = null
  this.mFPS = piCreateFPSCounter()
  this.mIsPaused = false
  this.mForceFrame = false
  this.mInfo = null
  this.mCharCounter = document.getElementById('numCharacters')
  this.mCharCounterTotal = document.getElementById('numCharactersTotal')
  this.mPass = []
  this.mActiveDoc = 0
  this.mIsEditorFullScreen = false
  this.mFontSize = 0
  this.mVR = null

  buildInputsUI(this)

  var devicePixelRatio = window.devicePixelRatio || 1

  this.mCanvas = document.getElementById('demogl')
  this.mCanvas.tabIndex = '0' // make it react to keyboard
  this.mCanvas.width = this.mCanvas.offsetWidth // * devicePixelRatio
  this.mCanvas.height = this.mCanvas.offsetHeight // * devicePixelRatio

  this.mHttpReq = new XMLHttpRequest()
  this.mTo = getRealTime()
  this.mTf = 0
  this.mRestarted = true
  this.mFPS.Reset(this.mTo)
  this.mMouseIsDown = false
  this.mMouseOriX = 0
  this.mMouseOriY = 0
  this.mMousePosX = 0
  this.mMousePosY = 0

  // --- rendering context ---------------------

  this.mGLContext = piCreateGlContext(this.mCanvas, false, false, true, false) // need preserve-buffe to true in order to capture screenshots
  if (this.mGLContext == null) {
    var ele = document.getElementById('noWebGL')
    ele.style.visibility = 'visible'
    this.mCanvas.style.visibility = 'hidden'

    var img = document.getElementById('noWebGL_ShaderImage')
    var url = '/media/shaders/' + gShaderID + '.jpg'
    img.onerror = function(ev) {}
    img.src = url

    this.mIsPaused = true
    this.mForceFrame = false
  }

  // --- audio context ---------------------

  this.mAudioContext = piCreateAudioContext()

  if (this.mAudioContext == null) {
    //alert( "no audio!" );
  }

  // --- vr susbsystem ---------------------

  this.mVR = new WebVR(function(b) {
    var ele = document.getElementById('myVR')
    if (b)
      ele.style.background = "url('/img/themes/" + gThemeName + "/vrOn.png')"
    else
      ele.style.background = "url('/img/themes/" + gThemeName + "/vrOff.png')"
  }, this.mCanvas)

  // --- soundcloud context ---------------------
  this.mSoundcloudImage = new Image()
  this.mSoundcloudImage.src = '/img/themes/' + gThemeName + '/soundcloud.png'

  try {
    if (typeof SC !== 'undefined') {
      SC.client_id = 'b1275b704badf79d972d51aa4b92ea15'
      SC.initialize({
        client_id: SC.client_id
      })
    }
  } catch (e) {}

  window.onfocus = function() {
    if (!this.mIsPaused) {
      me.mTOffset = me.mTf
      me.mTo = getRealTime()
      me.mRestarted = true
    }
  }

  var refreshCharsAndFlags = function() {
    me.setChars()
    //me.setFlags();
    setTimeout(refreshCharsAndFlags, 1500)
  }
  // ---------------
  this.mEditorState = {
    mCursorChange: false,
    mViewportChange: false,
    mCodeChange: false
  }

  this.mErrors = new Array()

  var ekeys = null
  if (navigator.platform.match('Mac')) {
    ekeys = {
      'Ctrl-S': function(instance) {
        doSaveShader()
        me.mNeedsSave = false
      },
      'Cmd-S': function(instance) {
        doSaveShader()
        me.mNeedsSave = false
      },
      'Alt-Enter': function(instance) {
        me.SetShaderFromEditor(false)
      },
      'Cmd-Enter': function(instance) {
        me.SetShaderFromEditor(false)
      },
      'Alt--': function(instance) {
        me.decreaseFontSize()
      },
      'Cmd--': function(instance) {
        me.decreaseFontSize()
      },
      'Alt-=': function(instance) {
        me.increaseFontSize()
      },
      'Cmd-=': function(instance) {
        me.increaseFontSize()
      },
      'Cmd-Right': function(instance) {
        me.ChangeTabRight()
      },
      'Cmd-Left': function(instance) {
        me.ChangeTabLeft()
      },
      'Cmd-Down': function(instance) {
        me.resetTime(false)
      },
      'Alt-Down': function(instance) {
        me.resetTime(false)
      },
      'Alt-Up': function(instance) {
        me.pauseTime(false)
      },
      'Cmd-Up': function(instance) {
        me.pauseTime(false)
      },
      'Alt-F': function(instance) {
        me.changeEditorFullScreen()
      }
    }
  } else {
    ekeys = {
      'Ctrl-S': function(instance) {
        doSaveShader()
        me.mNeedsSave = false
      },
      'Alt-Enter': function(instance) {
        me.SetShaderFromEditor(false)
      },
      'Alt--': function(instance) {
        me.decreaseFontSize()
      },
      'Alt-=': function(instance) {
        me.increaseFontSize()
      },
      'Alt-Right': function(instance) {
        me.ChangeTabRight()
      },
      'Alt-Left': function(instance) {
        me.ChangeTabLeft()
      },
      'Alt-Down': function(instance) {
        me.resetTime(false)
      },
      'Alt-Up': function(instance) {
        me.pauseTime(false)
      },
      'Alt-F': function(instance) {
        me.changeEditorFullScreen()
      }
    }
  }

  this.mCodeEditor = CodeMirror(editorParent, {
    lineNumbers: true,
    matchBrackets: true,
    indentWithTabs: false,
    tabSize: 4,
    indentUnit: 4,
    mode: 'text/x-glsl',
    smartIndent: true,
    electricChars: true,
    foldGutter: true,
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
    extraKeys: ekeys
  })
  this.mCodeEditor.on('change', function(instance, ev) {
    me.mEditorState.mCodeChange = true
    me.mNeedsSave = true
    me.mPass[me.mActiveDoc].mDirty = true
    me.mPass[me.mActiveDoc].mCharCountDirty = true
  })
  this.mCodeEditor.on('cursorActivity', function(instance) {
    me.mEditorState.mCursorChange = true
  })
  this.mCodeEditor.on('viewportChange', function(instance, eFrom, eTo) {
    me.mEditorState.mViewportChange = true
  })

  //--------------

  refreshCharsAndFlags(this)

  this.mCanvas.onmousedown = function(ev) {
    var rect = me.mCanvas.getBoundingClientRect()
    me.mMouseOriX = Math.floor(
      ((ev.clientX - rect.left) / (rect.right - rect.left)) * me.mCanvas.width
    )
    me.mMouseOriY = Math.floor(
      me.mCanvas.height -
        ((ev.clientY - rect.top) / (rect.bottom - rect.top)) * me.mCanvas.height
    )
    me.mMousePosX = me.mMouseOriX
    me.mMousePosY = me.mMouseOriY
    me.mMouseIsDown = true
    if (me.mIsPaused) me.mForceFrame = true
    //        return false; // prevent mouse pointer change
  }
  this.mCanvas.onmousemove = function(ev) {
    if (me.mMouseIsDown) {
      var rect = me.mCanvas.getBoundingClientRect()
      me.mMousePosX = Math.floor(
        ((ev.clientX - rect.left) / (rect.right - rect.left)) * me.mCanvas.width
      )
      me.mMousePosY = Math.floor(
        me.mCanvas.height -
          ((ev.clientY - rect.top) / (rect.bottom - rect.top)) *
            me.mCanvas.height
      )
      if (me.mIsPaused) me.mForceFrame = true
    }
  }
  this.mCanvas.onmouseup = function(ev) {
    me.mMouseIsDown = false
    me.mMouseOriX = -Math.abs(me.mMouseOriX)
    me.mMouseOriY = -Math.abs(me.mMouseOriY)
    if (me.mIsPaused) me.mForceFrame = true
  }

  this.mCanvas.addEventListener(
    'keydown',
    function(ev) {
      me.mEffect.SetKeyDown(me.mActiveDoc, ev.keyCode)
      if (me.mIsPaused) me.mForceFrame = true
      ev.preventDefault()
    },
    false
  )

  this.mCanvas.addEventListener(
    'keyup',
    function(ev) {
      if (ev.keyCode == 82 && ev.altKey) {
        let r = document.getElementById('myRecord')
        r.click()
      }

      me.mEffect.SetKeyUp(me.mActiveDoc, ev.keyCode)
      if (me.mIsPaused) me.mForceFrame = true
      ev.preventDefault()
    },
    false
  )

  document.getElementById('myResetButton').onclick = function(ev) {
    me.resetTime(true)
  }
  document.getElementById('myPauseButton').onclick = function(ev) {
    me.pauseTime(true)
  }
  document.getElementById('myVolume').onclick = function(ev) {
    var res = me.mEffect.ToggleVolume()
    if (res)
      this.style.background =
        "url('/img/themes/" + gThemeName + "/speakerOff.png')"
    else
      this.style.background =
        "url('/img/themes/" + gThemeName + "/speakerOn.png')"
  }

  document.getElementById('myVR').onclick = function(ev) {
    var vr = me.mVR.IsSupported()
    if (!vr) {
      alert('WebVR API is not supported in this browser')
    } else {
      if (me.mEffect.IsEnabledVR()) me.mEffect.DisableVR()
      else me.mEffect.EnableVR()
    }
  }

  var mFullScreenExitHandler = function() {
    if (piIsFullScreen()) {
    } else {
      if (me.mVR.IsSupported()) {
        me.mEffect.DisableVR()
      }
    }
  }
  this.mCanvas.addEventListener(
    'webkitfullscreenchange',
    mFullScreenExitHandler,
    false
  )
  this.mCanvas.addEventListener(
    'mozfullscreenchange',
    mFullScreenExitHandler,
    false
  )
  this.mCanvas.addEventListener(
    'fullscreenchange',
    mFullScreenExitHandler,
    false
  )
  this.mCanvas.addEventListener(
    'MSFullscreenChange',
    mFullScreenExitHandler,
    false
  )

  document.getElementById('myFullScreen').onclick = function(ev) {
    piRequestFullScreen(me.mCanvas)
    me.mCanvas.focus() // put mouse/keyboard focus on canvas
  }

  //-------------------------

  this.mEffect = new Effect(
    this.mVR,
    this.mAudioContext,
    this.mGLContext,
    this.mCanvas.width,
    this.mCanvas.height,
    this.RefreshTexturThumbail,
    this,
    false,
    false
  )
  if (!this.mEffect.mCreated) {
    this.mIsPaused = true
    this.mForceFrame = false
    this.mCreated = false
    return
  }

  this.mCanvas.addEventListener(
    'webglcontextlost',
    function(event) {
      event.preventDefault()
      me.mIsPaused = true
      alert('Shadertoy: ooops, your WebGL implementation has crashed!')
    },
    false
  )

  // --- mediaRecorder ---------------------

  this.mMediaRecorder = null

  document.getElementById('myRecord').onclick = function(ev) {
    if (me.mMediaRecorder == null) {
      me.mMediaRecorder = piCreateMediaRecorder(function(b) {
        var ele = document.getElementById('myRecord')
        if (b)
          ele.style.background =
            "url('/img/themes/" + gThemeName + "/recordOn.png')"
        else
          ele.style.background =
            "url('/img/themes/" + gThemeName + "/recordOff.png')"
      }, me.mCanvas)
    }

    if (me.mMediaRecorder == null) {
      let ele = document.getElementById('myRecord')
      ele.style.background =
        "url('/img/themes/" + gThemeName + "/recordDisabled.png')"

      alert('MediaRecord API is not supported in this browser')
      return
    }

    if (me.mMediaRecorder.state == 'inactive') {
      me.mMediaRecorder.start()
    } else {
      me.mMediaRecorder.stop()
    }
  }

  this.mCreated = true
}

ShaderToy.prototype.saveScreenshot = function() {
  this.mEffect.saveScreenshot('image.exr', this.mActiveDoc)
}

ShaderToy.prototype.setFontSize = function(id, fromUI) {
  if (id < 0) id = 0
  if (id > 3) id = 3

  if (id === this.mFontSize) return

  this.mFontSize = id
  var edi = document.getElementById('editor')
  edi.style.fontSize = '1.' + id * 20 + 'em'
  this.mCodeEditor.refresh()

  if (fromUI) {
    // update the DB
    var httpReq = new XMLHttpRequest()
    //httpReq.onload = function () { var jsn = httpReq.response; };
    httpReq.open('POST', '/shadertoy', true)
    httpReq.responseType = 'json'
    httpReq.setRequestHeader(
      'Content-Type',
      'application/x-www-form-urlencoded'
    )
    httpReq.send('upo=1&sfs=' + id)
  } else {
    var ele = document.getElementById('uiFontSelector')
    ele.selectedIndex = id
  }
}

ShaderToy.prototype.decreaseFontSize = function() {
  this.setFontSize(this.mFontSize - 1, true)

  var ele = document.getElementById('uiFontSelector')
  ele.selectedIndex = this.mFontSize
}

ShaderToy.prototype.increaseFontSize = function() {
  this.setFontSize(this.mFontSize + 1, true)

  var ele = document.getElementById('uiFontSelector')
  ele.selectedIndex = this.mFontSize
}

ShaderToy.prototype.ResetEditorState = function() {
  this.mEditorState.mCursorChange = false
  this.mEditorState.mCodeChange = false
  this.mEditorState.mViewportChange = false
}

ShaderToy.prototype.GetEditorState = function() {
  if (this.mEditorState.mCursorChange || this.mEditorState.mCodeChange)
    //         return { mChanges:true, mCursor:this.mCodeEditor.getCursor(), mCode:this.mCodeEditor.getValue(), mViewport:this.mCodeEditor.getViewport() };

    return {
      mChanges: true,
      mCursor: this.mCodeEditor.getCursor(),
      mCode: this.mCodeEditor.getValue(),
      mViewport: this.mCodeEditor.getScrollInfo()
    }
  else return { mChanges: false }

  /*
     var cur = (this.mEditorState.mCursorChange   == true) ? this.mCodeEditor.getCursor() : null;
     var cod = (this.mEditorState.mCodeChange     == true) ? this.mCodeEditor.getValue() : null;
     var vie = (this.mEditorState.mViewportChange == true) ? null : null;

     var res = { mState: this.mEditorState, mCursor:cur, mCode:cod, mSelection:null };

     return res;
*/
}

ShaderToy.prototype.changeEditorFullScreen = function() {
  this.mIsEditorFullScreen = !this.mIsEditorFullScreen

  var con = document.getElementById('content')
  var ele = document.getElementById('editorWrapper')
  var lef = document.getElementById('leftColumnContainer')
  var rig = document.getElementById('rightColumnContainer')

  if (this.mIsEditorFullScreen) {
    var dum = document.createElement('div')
    dum.id = 'dummy'
    rig.insertBefore(dum, ele)

    lef.style.visibility = 'hidden'
    rig.style.visibility = 'hidden'

    rig.replaceChild(dum, ele)
    con.appendChild(ele)

    ele.className = 'yesFullScreen'
  } else {
    var dum = document.getElementById('dummy')

    lef.style.visibility = 'visible'
    rig.style.visibility = 'visible'

    con.removeChild(ele)
    rig.replaceChild(ele, dum)

    ele.className = 'noFullScreen'
  }
  this.mCodeEditor.focus()
}

ShaderToy.prototype.GetNeedSave = function() {
  return this.mNeedsSave
}
ShaderToy.prototype.SetNeedSave = function(v) {
  this.mNeedsSave = v
}

ShaderToy.prototype.startRendering = function() {
  var me = this

  function renderLoop2() {
    if (me.mGLContext == null) return

    me.mEffect.RequestAnimationFrame(renderLoop2)

    if (me.mIsPaused && !me.mForceFrame) {
      me.mEffect.UpdateInputs(me.mActiveDoc, false)
      return
    }
    me.mForceFrame = false

    var time = getRealTime()

    var ltime = 0.0
    var dtime = 0.0
    if (me.mIsPaused) {
      ltime = me.mTf
      dtime = 1000.0 / 60.0
    } else {
      ltime = me.mTOffset + time - me.mTo
      if (me.mRestarted) dtime = 1000.0 / 60.0
      else dtime = ltime - me.mTf
      me.mTf = ltime
    }
    me.mRestarted = false

    var newFPS = me.mFPS.Count(time)

    me.mEffect.Paint(
      ltime / 1000.0,
      dtime / 1000.0,
      me.mFPS.GetFPS(),
      me.mMouseOriX,
      me.mMouseOriY,
      me.mMousePosX,
      me.mMousePosY,
      me.mIsPaused
    )

    document.getElementById('myTime').textContent = (ltime / 1000.0).toFixed(2)
    if (me.mIsPaused) {
    } else {
      if (newFPS) {
        document.getElementById('myFramerate').textContent =
          me.mFPS.GetFPS().toFixed(1) + ' fps'
      }
    }
  }

  renderLoop2()
}

ShaderToy.prototype.resize = function(xres, yres) {
  this.mCanvas.setAttribute('width', xres)
  this.mCanvas.setAttribute('height', yres)
  this.mCanvas.width = xres
  this.mCanvas.height = yres

  this.mEffect.SetSize(xres, yres)
  this.mForceFrame = true
}

//---------------------------------

ShaderToy.prototype.pauseTime = function(doFocusCanvas) {
  if (!this.mIsPaused) {
    document.getElementById('myPauseButton').style.background =
      "url('/img/themes/" + gThemeName + "/play.png')"
    this.mIsPaused = true
    this.mEffect.StopOutputs()
  } else {
    document.getElementById('myPauseButton').style.background =
      "url('/img/themes/" + gThemeName + "/pause.png')"
    this.mTOffset = this.mTf
    this.mTo = getRealTime()
    this.mIsPaused = false
    this.mRestarted = true
    this.mEffect.ResumeOutputs()
    if (doFocusCanvas) this.mCanvas.focus() // put mouse/keyboard focus on canvas
  }
}

ShaderToy.prototype.resetTime = function(doFocusOnCanvas) {
  this.mTOffset = 0
  this.mTo = getRealTime()
  this.mTf = 0
  this.mRestarted = true
  this.mFpsTo = this.mTo
  this.mFpsFrame = 0
  this.mForceFrame = true
  this.mEffect.ResetTime()
  if (doFocusOnCanvas) this.mCanvas.focus() // put mouse/keyboard focus on canvas
}

ShaderToy.prototype.SetErrors = function(result, fromScript) {
  while (this.mErrors.length > 0) {
    var mark = this.mErrors.pop()
    this.mCodeEditor.removeLineWidget(mark)
  }

  if (result == null) {
    this.mForceFrame = true
    if (fromScript == false) {
    }
  } else {
    var lineOffset = this.mEffect.GetHeaderSize(this.mActiveDoc)

    var lines = result.split(/\r\n|\r|\n/)

    var maxLines = this.mCodeEditor.lineCount()

    for (var i = 0; i < lines.length; i++) {
      var parts = lines[i].split(':')
      if (parts.length === 5 || parts.length === 6) {
        var lineAsInt = parseInt(parts[2])

        if (isNaN(lineAsInt)) {
          // for non-webgl errors
          var msg = document.createElement('div')
          msg.appendChild(document.createTextNode('Unknown Error: ' + lines[i]))
          msg.className = 'errorMessage'
          var mark = this.mCodeEditor.addLineWidget(0, msg, {
            coverGutter: false,
            noHScroll: true
          })
          this.mErrors.push(mark)
        } else {
          var lineNumber = lineAsInt - lineOffset

          var msg = document.createElement('div')
          msg.appendChild(document.createTextNode(parts[3] + ' : ' + parts[4]))
          msg.className = 'errorMessage'

          if (lineNumber > maxLines) lineNumber = maxLines

          var mark = this.mCodeEditor.addLineWidget(lineNumber, msg, {
            coverGutter: false,
            noHScroll: true
          })
          this.mErrors.push(mark)
        }
      } else if (
        lines[i] != null &&
        lines[i] != '' &&
        lines[i].length > 1 &&
        parts[0] != 'Warning'
      ) {
        //console.log( parts.length + " **" + lines[i] );

        var txt = ''
        if (parts.length == 4) txt = parts[2] + ' : ' + parts[3]
        else txt = 'Unknown error: ' + lines[i]

        var msg = document.createElement('div')
        msg.appendChild(document.createTextNode(txt))
        msg.className = 'errorMessage'
        var mark = this.mCodeEditor.addLineWidget(0, msg, {
          coverGutter: false,
          noHScroll: true,
          above: true
        })
        this.mErrors.push(mark)
      }
    }
  }
}

ShaderToy.prototype.GetAnyErrors = function() {
  return this.mAreThereAnyErrors
}

ShaderToy.prototype.SetErrorsGlobal = function(areThereAnyErrors, fromScript) {
  this.mAreThereAnyErrors = areThereAnyErrors
  var eleWrapper = document.getElementById('editorWrapper')

  if (areThereAnyErrors == false) {
    this.mForceFrame = true
    if (fromScript == false) {
      //eleWrapper.classList.remove("errorYes");
      eleWrapper.classList.add('errorNo')
      setTimeout(function() {
        eleWrapper.classList.remove('errorNo')
      }, 500)
    }
  } else {
    //eleWrapper.classList.add("errorYes");
  }
}

ShaderToy.prototype.PauseInput = function(id) {
  return this.mEffect.PauseInput(this.mActiveDoc, id)
}

ShaderToy.prototype.MuteInput = function(id) {
  return this.mEffect.MuteInput(this.mActiveDoc, id)
}

ShaderToy.prototype.RewindInput = function(id) {
  this.mEffect.RewindInput(this.mActiveDoc, id)
}

ShaderToy.prototype.SetTexture = function(slot, url) {
  this.mNeedsSave = true
  var res = this.mEffect.NewTexture(this.mActiveDoc, slot, url)
  if (res.mFailed == false) {
    this.mPass[this.mActiveDoc].mDirty = res.mNeedsShaderCompile
  }
}

ShaderToy.prototype.GetTexture = function(slot) {
  return this.mEffect.GetTexture(this.mActiveDoc, slot)
}

ShaderToy.prototype.GetAcceptsLinear = function(slot) {
  return this.mEffect.GetAcceptsLinear(this.mActiveDoc, slot)
}

ShaderToy.prototype.GetAcceptsMipmapping = function(slot) {
  return this.mEffect.GetAcceptsMipmapping(this.mActiveDoc, slot)
}

ShaderToy.prototype.GetAcceptsWrapRepeat = function(slot) {
  return this.mEffect.GetAcceptsWrapRepeat(this.mActiveDoc, slot)
}

ShaderToy.prototype.GetAcceptsVFlip = function(slot) {
  return this.mEffect.GetAcceptsVFlip(this.mActiveDoc, slot)
}

ShaderToy.prototype.SetSamplerFilter = function(slot, str) {
  this.mEffect.SetSamplerFilter(this.mActiveDoc, slot, str)
  this.mForceFrame = true
}
ShaderToy.prototype.GetSamplerFilter = function(slot) {
  return this.mEffect.GetSamplerFilter(this.mActiveDoc, slot)
}

ShaderToy.prototype.SetSamplerWrap = function(slot, str) {
  this.mEffect.SetSamplerWrap(this.mActiveDoc, slot, str)
  this.mForceFrame = true
}
ShaderToy.prototype.GetSamplerWrap = function(slot) {
  return this.mEffect.GetSamplerWrap(this.mActiveDoc, slot)
}

ShaderToy.prototype.SetSamplerVFlip = function(slot, str) {
  this.mEffect.SetSamplerVFlip(this.mActiveDoc, slot, str)
  this.mForceFrame = true
}
ShaderToy.prototype.GetSamplerVFlip = function(slot) {
  return this.mEffect.GetSamplerVFlip(this.mActiveDoc, slot)
}

ShaderToy.prototype.SetShaderFromEditor = function(forceall) {
  var anyErrors = false

  var num = this.mEffect.GetNumPasses()

  var recompileAll = false
  for (var i = 0; i < num; i++) {
    if (
      this.mEffect.GetPassType(i) == 'common' &&
      (this.mPass[i].mDirty || forceall)
    ) {
      recompileAll = true
      break
    }
  }

  for (var j = 0; j < 5; j++) {
    for (var i = 0; i < num; i++) {
      if (j == 0 && this.mEffect.GetPassType(i) != 'common') continue
      if (j == 1 && this.mEffect.GetPassType(i) != 'buffer') continue
      if (j == 2 && this.mEffect.GetPassType(i) != 'cubemap') continue
      if (j == 3 && this.mEffect.GetPassType(i) != 'image') continue
      if (j == 4 && this.mEffect.GetPassType(i) != 'sound') continue

      if (recompileAll || this.mPass[i].mDirty || forceall) {
        var shaderCode = this.mPass[i].mDocs.getValue()

        var eleLab = document.getElementById('tab' + i)

        var result = this.mEffect.NewShader(shaderCode, i)
        if (result != null) {
          anyErrors = true
          eleLab.classList.add('errorYes')
        } else {
          eleLab.classList.remove('errorYes')
        }

        this.mPass[i].mError = result
        this.mPass[i].mDirty = false
        this.mPass[i].mCharCount = minify(shaderCode).length
        this.mPass[i].mCharCountDirty = false
      }
    }
  }

  this.setChars()
  this.setFlags()

  this.SetErrors(this.mPass[this.mActiveDoc].mError, false)
  this.SetErrorsGlobal(anyErrors, false)

  if (!anyErrors) {
    this.mForceFrame = true
  }
}

/*
guiID:
0: null
1: texture
2: cubemap
3: video
4: music
5: mic
6: keyb
7: webcam
8: musicstream
9: buffer
*/
ShaderToy.prototype.RefreshTexturThumbail = function(
  myself,
  slot,
  img,
  forceFrame,
  guiID,
  renderID,
  time,
  passID
) {
  if (passID != myself.mActiveDoc) return

  var canvas = document.getElementById('myUnitCanvas' + slot)

  var i0 = document.getElementById('myPauseButton' + slot)
  var i1 = document.getElementById('myRewindButton' + slot)
  var i2 = document.getElementById('myMuteButton' + slot)
  var i3 = document.getElementById('mySamplingButton' + slot)
  var i4 = document.getElementById('myNoInput' + slot)

  if (guiID == 0) {
    i3.style.visibility = 'hidden'
    i4.style.visibility = 'hidden'
  } else {
    i3.style.visibility = 'visible'
    i4.style.visibility = 'visible'
  }

  if (
    guiID == 0 ||
    guiID == 1 ||
    guiID == 2 ||
    guiID == 5 ||
    guiID == 6 ||
    guiID == 9
  ) {
    i0.style.visibility = 'hidden'
    i1.style.visibility = 'hidden'
    i2.style.visibility = 'hidden'
  } else {
    i0.style.visibility = 'visible'
    i1.style.visibility = 'visible'
    i2.style.visibility = 'visible'
  }

  var w = canvas.width
  var h = canvas.height
  //console.log(w + " " + h);
  var ctx = canvas.getContext('2d')

  if (guiID == 0) {
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, w, h)
  } else if (guiID == 1) {
    ctx.fillStyle = '#000000'
    if (renderID == 0) ctx.fillRect(0, 0, w, h + 4)
    else ctx.drawImage(img, 0, 0, w, h)
  } else if (guiID == 2) {
    ctx.fillStyle = '#000000'
    if (renderID == 0) ctx.fillRect(0, 0, w, h + 4)
    else ctx.drawImage(img, 0, 0, w, h)
  } else if (guiID == 3) {
    ctx.fillStyle = '#000000'
    if (renderID == 0) ctx.fillRect(0, 0, w, h + 4)
    else ctx.drawImage(img, 0, 0, w, h)
  } else if (guiID == 4 || guiID == 5 || guiID == 8) {
    if (renderID == 0) {
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, w, h + 4)

      ctx.strokeStyle = '#808080'
      ctx.lineWidth = 1
      ctx.beginPath()
      var num = w / 2
      for (var i = 0; i < num; i++) {
        var y =
          Math.sin((64.0 * 6.2831 * i) / num + time) *
          Math.sin((2.0 * 6.2831 * i) / num + time)
        var ix = (w * i) / num
        var iy = h * (0.5 + 0.4 * y)
        if (i == 0) ctx.moveTo(ix, iy)
        else ctx.lineTo(ix, iy)
      }
      ctx.stroke()

      var str = 'Audio not loaded'
      ctx.font = 'normal bold 20px Arial'
      ctx.lineWidth = 4
      ctx.strokeStyle = '#000000'
      ctx.strokeText(str, 14, h / 2)
      ctx.fillStyle = '#ff0000'
      ctx.fillText(str, 14, h / 2)

      document.getElementById('myPauseButton' + slot).src =
        '/img/themes/' + gThemeName + '/pause.png'
    } else {
      var voff = 0
      //if (time < 0.0) voff = 4;

      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, w, h)

      ctx.fillStyle = '#ffffff'

      var numfft = img.wave.length
      numfft /= 2
      if (numfft > 512) numfft = 512
      var num = 32
      var numb = (numfft / num) | 0
      var s = (w - 8 * 2) / num
      var k = 0
      for (var i = 0; i < num; i++) {
        var f = 0.0
        for (var j = 0; j < numb; j++) {
          f += img.wave[k++]
        }
        f /= numb
        f /= 255.0

        var fr = f
        var fg = 4.0 * f * (1.0 - f)
        var fb = 1.0 - f

        var rr = (255.0 * fr) | 0
        var gg = (255.0 * fg) | 0
        var bb = (255.0 * fb) | 0
        //             ctx.fillStyle = "rgb(" + rr + "," + gg + "," + bb + ");"

        var decColor = 0x1000000 + bb + 0x100 * gg + 0x10000 * rr
        ctx.fillStyle = '#' + decColor.toString(16).substr(1)

        var a = Math.max(2, f * (h - 2 * 20))
        ctx.fillRect(8 + i * s, h - voff - a, (3 * s) / 4, a)
      }

      // If it is a music stream then we want to show extra information
      if (guiID == 8) {
        var str = img.info.user.username + ' - ' + img.info.title
        var x = w - 10.0 * (time % 45.0)
        ctx.font = 'normal normal 10px Arial'
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 4
        ctx.strokeText(str, x, 32)
        ctx.fillStyle = '#ffffff'
        ctx.fillText(str, x, 32)
        ctx.drawImage(myself.mSoundcloudImage, 45, 0)
      }
    }
  } /*
  else if (guiID == 5) 
  {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, w, h);
      if (renderID == 1)
          ctx.drawImage(img, 0, 0, w, h);
  }*/ else if (
    guiID == 6
  ) {
    //kyeboard
    var thereskey = false
    ctx.fillStyle = '#ffffff'
    for (var i = 0; i < 256; i++) {
      var x = ((w * i) / 256) | 0
      if (img.mData[i] > 0) {
        thereskey = true
        break
      }
    }

    ctx.drawImage(img.mImage, 0, 0, w, h)

    if (thereskey) {
      ctx.fillStyle = '#ff8040'
      ctx.globalAlpha = 0.4
      ctx.fillRect(0, 0, w, h)
      ctx.globalAlpha = 1.0
    }
  } else if (guiID == 7) {
    ctx.fillStyle = '#000000'
    if (renderID == 0) ctx.fillRect(0, 0, w, h)
    else ctx.drawImage(img, 0, 0, w, h)
  } else if (guiID == 9) {
    if (renderID == 0) {
      ctx.fillStyle = '#808080'
      ctx.fillRect(0, 0, w, h)
    } else {
      ctx.drawImage(img.texture, 0, 0, w, h)
      if (img.data !== null) {
        //console.log( img.data );
        ctx.putImageData(img.data, 0, 0, 0, 0, w, h)
      }
    }
  }

  if (time > 0.0) {
    var str = time.toFixed(2) + 's'
    ctx.font = 'normal normal 10px Arial'
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 4
    ctx.strokeText(str, 4, 12)
    ctx.fillStyle = '#ffffff'
    ctx.fillText(str, 4, 12)
  }

  myself.mForceFrame = forceFrame
}

ShaderToy.prototype.setChars = function() {
  if (this.mPass.length == 1) {
    if (this.mPass[0].mCharCountDirty) {
      this.mPass[0].mCharCount = minify(this.mCodeEditor.getValue()).length
      this.mPass[0].mCharCountDirty = false
    }
    this.mCharCounter.textContent = this.mPass[0].mCharCount + ' chars'
    this.mCharCounterTotal.textContent = ''
  } else {
    var currentPassCount = 0
    var globalCount = 0
    for (var i = 0; i < this.mPass.length; i++) {
      if (this.mPass[i].mCharCountDirty) {
        this.mPass[i].mCharCount = minify(this.mPass[i].mDocs.getValue()).length
        this.mPass[i].mCharCountDirty = false
      }
      if (i == this.mActiveDoc) currentPassCount = this.mPass[i].mCharCount
      globalCount += this.mPass[i].mCharCount
    }
    this.mCharCounter.textContent = currentPassCount
    this.mCharCounterTotal.textContent = ' / ' + globalCount + ' chars'
  }
}

ShaderToy.prototype.setFlags = function() {
  if (this.mEffect == null) return

  var flags = this.mEffect.calcFlags()

  var eleVR = document.getElementById('myVR')
  eleVR.style.visibility = flags.mFlagVR == true ? 'visible' : 'hidden'
}

ShaderToy.prototype.showChars = function() {
  var str = this.mCodeEditor.getValue()

  str = minify(str)

  var ve = document.getElementById('centerScreen')
  doAlert(
    piGetCoords(ve),
    { mX: 480, mY: 400 },
    'Minimal Shader Code, (' + str.length + ' chars)',
    '<pre>' + htmlEntities(str) + '</pre>',
    false,
    null
  )
}

ShaderToy.prototype.ChangeTabLeft = function() {
  var num = this.mEffect.GetNumPasses()
  // find tab pointing to current pass
  var i
  for (i = 0; i < num; i++) if (this.mTab2Pass[i] === this.mActiveDoc) break
  // move left
  i = (i - 1 + num) % num
  // change
  this.ChangePass(this.mTab2Pass[i])
}

ShaderToy.prototype.ChangeTabRight = function() {
  var num = this.mEffect.GetNumPasses()
  // find tab pointing to current pass
  var i
  for (i = 0; i < num; i++) if (this.mTab2Pass[i] === this.mActiveDoc) break
  // move right
  i = (i + 1) % num
  // change
  this.ChangePass(this.mTab2Pass[i])
}

ShaderToy.prototype.ChangePass = function(id) {
  this.mActiveDoc = id
  this.mCodeEditor.swapDoc(this.mPass[id].mDocs)
  this.setChars()

  this.SetErrors(this.mPass[id].mError, true)

  this.mEffect.UpdateInputs(id, true)

  var num = this.mEffect.GetNumPasses()

  // highlight the tab
  for (var i = 0; i < num; i++) {
    var eleLab = document.getElementById('tab' + i)
    if (i == id) eleLab.classList.add('selected')
    else eleLab.classList.remove('selected')
  }

  {
    var passType = this.mEffect.GetPassType(id)
    var ele = document.getElementById('textures')
    ele.style.visibility = passType === 'common' ? 'hidden' : 'visible'

    ele = document.getElementById('screenshotButton')
    ele.style.visibility =
      passType === 'buffer' || passType === 'cubemap' ? 'visible' : 'hidden'
  }
}

ShaderToy.prototype.KillPass = function(id) {
  this.mNeedsSave = true
  this.mEffect.DestroyPass(id)

  this.mPass.splice(id, 1)

  this.BuildTabs()

  var activePass = this.mActiveDoc
  if (activePass >= id) {
    activePass--
    if (activePass < 0) activePass = 0
  }

  this.ChangePass(activePass)

  this.SetShaderFromEditor(true)
}

ShaderToy.prototype.AddPass = function(passType, passName, outputID) {
  var res = this.mEffect.AddPass(passType, passName)
  var id = res.mId

  this.mEffect.SetOutputsByBufferID(id, 0, outputID)

  this.mPass[id] = {
    mDocs: CodeMirror.Doc(res.mShader, 'text/x-glsl'),
    mFailed: false,
    mError: null,
    mDirty: false,
    mCharCount: minify(res.mShader).length,
    mCharCountDirty: false
  }
  this.BuildTabs()

  this.ChangePass(id)
  this.mNeedsSave = true
}

//-------------------------

ShaderToy.prototype.AddPlusTabs = function(passes) {
  var me = this

  var numS = this.mEffect.GetNumOfType('sound')
  var numB = this.mEffect.GetNumOfType('buffer')
  var numC = this.mEffect.GetNumOfType('common')
  var numR = this.mEffect.GetNumOfType('cubemap')

  if (numS < 1 || numB < 4 || numC < 1 || numR < 1) {
    var eleCon = document.createElement('div')
    eleCon.className = 'tabAddContainer'

    var eleSel = document.createElement('select')
    eleSel.className = 'tabAddSelect'

    var eleOpt = document.createElement('option')
    eleOpt.value = ''
    eleOpt.text = ''
    eleOpt.hidden = true
    eleSel.appendChild(eleOpt)

    if (numC < 1) {
      var eleOpt = document.createElement('option')
      eleOpt.value = 0
      eleOpt.text = 'Common'
      eleSel.appendChild(eleOpt)
    }

    if (numS < 1) {
      var eleOpt = document.createElement('option')
      eleOpt.value = 1
      eleOpt.text = 'Sound'
      eleSel.appendChild(eleOpt)
    }

    if (numB < 4) {
      for (var i = 0; i < 4; i++) {
        var isused = me.mEffect.IsBufferPassUsed(i)
        if (isused) continue
        var eleOpt = document.createElement('option')
        eleOpt.value = 2 + i
        eleOpt.text = 'Buffer ' + String.fromCharCode(65 + i)
        eleSel.appendChild(eleOpt)
      }
    }

    if (numR < 1) {
      var eleOpt = document.createElement('option')
      eleOpt.value = 6
      eleOpt.text = 'Cubemap A'
      eleSel.appendChild(eleOpt)
    }

    eleSel.onchange = function(ev) {
      var val = this.value
      var outputID = null
      var passType = 'common'
      var passName = 'Common'
      if (val == 0) {
        outputID = null
        passType = 'common'
        passName = 'Common'
      } else if (val == 1) {
        outputID = null
        passType = 'sound'
        passName = 'Sound'
      } else if (val >= 2 && val <= 5) {
        outputID = val - 2
        passType = 'buffer'
        passName = 'Buf ' + String.fromCharCode(65 + outputID)
      } else if (val == 6) {
        outputID = 0
        passType = 'cubemap'
        passName = 'Cube ' + 'A'
      }

      me.AddPass(passType, passName, outputID)
      ev.stopPropagation()
    }

    eleCon.appendChild(eleSel)

    this.mPassParent.appendChild(eleCon)
  }
}

ShaderToy.prototype.AddTab = function(passType, passName, id) {
  var me = this

  var eleTab = document.createElement('div')
  eleTab.mNum = id
  eleTab.onclick = function(ev) {
    me.ChangePass(this.mNum)
  }
  eleTab.id = 'tab' + id
  eleTab.className = 'tab'

  if (this.mPass[id].mError != null) {
    eleTab.classList.add('errorYes')
  } else {
    eleTab.classList.remove('errorYes')
  }

  var eleImg = document.createElement('img')
  eleImg.className = 'tabImage'
  if (passType == 'sound') eleImg.src = '/img/music.png'
  if (passType == 'common') eleImg.src = '/img/common.png'
  if (passType == 'image') eleImg.src = '/img/image.png'
  if (passType == 'buffer') eleImg.src = '/img/buffer.png'
  if (passType == 'cubemap') eleImg.src = '/img/cubemap.png'
  eleTab.appendChild(eleImg)

  var eleLab = document.createElement('label')
  eleLab.textContent = passName

  eleTab.appendChild(eleLab)

  if (passType != 'image') {
    eleImg = document.createElement('img')
    eleImg.src = '/img/closeSmall.png'
    eleImg.className = 'tabClose'
    eleImg.mNum = id
    eleImg.onclick = function(ev) {
      me.KillPass(this.mNum)
      ev.stopPropagation()
    }
    eleTab.appendChild(eleImg)
  }

  this.mPassParent.appendChild(eleTab)
}

ShaderToy.prototype.BuildTabs = function() {
  this.mPassParent.innerHTML = ''

  this.AddPlusTabs()

  var num = this.mEffect.GetNumPasses()

  this.mTab2Pass = []
  var n = 0

  for (var i = 0; i < num; i++) {
    var passType = this.mEffect.GetPassType(i)
    if (passType !== 'common') continue
    var passName = this.mEffect.GetPassName(i)
    this.AddTab(passType, passName, i)
    this.mTab2Pass[n++] = i
  }
  for (var i = 0; i < num; i++) {
    var passType = this.mEffect.GetPassType(i)
    if (passType !== 'buffer') continue
    var passName = this.mEffect.GetPassName(i)
    this.AddTab(passType, passName, i)
    this.mTab2Pass[n++] = i
  }
  for (var i = 0; i < num; i++) {
    var passType = this.mEffect.GetPassType(i)
    if (passType !== 'cubemap') continue
    var passName = this.mEffect.GetPassName(i)
    this.AddTab(passType, passName, i)
    this.mTab2Pass[n++] = i
  }
  for (var i = 0; i < num; i++) {
    var passType = this.mEffect.GetPassType(i)
    if (passType !== 'image') continue
    var passName = this.mEffect.GetPassName(i)
    this.AddTab(passType, passName, i)
    this.mTab2Pass[n++] = i
  }
  for (var i = 0; i < num; i++) {
    var passType = this.mEffect.GetPassType(i)
    if (passType !== 'sound') continue
    var passName = this.mEffect.GetPassName(i)
    this.AddTab(passType, passName, i)
    this.mTab2Pass[n++] = i
  }
}

ShaderToy.prototype.newScriptJSON = function(jsn) {
  try {
    var res = this.mEffect.newScriptJSON(jsn)
    //if( res.mFailed==true ) return { mDownloaded: true, mFailed: true };

    /*
        if( res.mFailed==true )
        {
            for( var i=0; i<res.length; i++ )
            {
                if( res[i].mFailed==true )
                    alert( res[i].mError );
            }
            return  { mSuccess:false };
        }
*/
    this.mPass = []

    var num = res.length
    for (var i = 0; i < num; i++) {
      this.mPass[i] = {
        mDocs: CodeMirror.Doc(res[i].mShader, 'text/x-glsl'),
        mFailed: res[i].mFailed,
        mError: res[i].mError,
        mDirty: false,
        mCharCount: minify(res[i].mShader).length,
        mCharCountDirty: false
      }
    }
    this.mCodeEditor.clearHistory()
    this.BuildTabs()

    this.ChangePass(0)
    this.SetErrors(this.mPass[0].mError, true)
    this.SetErrorsGlobal(res.mFailed, true)
    this.resetTime()

    this.mInfo = jsn.info

    return {
      mDownloaded: true,
      mFailed: res.mFailed,
      mDate: jsn.info.date,
      mViewed: jsn.info.viewed,
      mName: jsn.info.name,
      mUserName: jsn.info.username,
      mDescription: jsn.info.description,
      mLikes: jsn.info.likes,
      mPublished: jsn.info.published,
      mHasLiked: jsn.info.hasliked,
      mTags: jsn.info.tags
    }
  } catch (e) {
    console.log(e)
    return { mDownloaded: false }
  }
}

ShaderToy.prototype.exportToJSON = function() {
  var res = this.mEffect.exportToJSON()

  if (this.mNeedsSave) {
    for (var i = 0; i < res.renderpass.length; i++) {
      res.renderpass[i].code = this.mPass[i].mDocs.getValue()
    }
  }

  res.info = this.mInfo

  return res
}

//----------------------------------------------------------------------------

var gShaderToy = null
var gCode = null
var gIsLiked = 0
var gRes = null

function loadNew() {
  var kk = {
    ver: '0.1',
    info: {
      id: '-1',
      date: '1358124981',
      viewed: 0,
      name: '',
      username: 'None',
      description: '',
      likes: 0,
      hasliked: 0,
      tags: [],
      published: 0
    },

    flags: {
      mFlagVR: 'false',
      mFlagWebcam: 'false',
      mFlagSoundInput: 'false',
      mFlagSoundOutput: 'false',
      mFlagKeyboard: 'false'
    },

    renderpass: [
      {
        inputs: [],
        outputs: [{ channel: 0, id: '4dfGRr' }],
        type: 'image',
        code:
          'void mainImage( out vec4 fragColor, in vec2 fragCoord )\n{\n    // Normalized pixel coordinates (from 0 to 1)\n    vec2 uv = fragCoord/iResolution.xy;\n\n    // Time varying pixel color\n    vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));\n\n    // Output to screen\n    fragColor = vec4(col,1.0);\n}',
        name: '',
        description: ''
      }
    ]
  }

  dataLoadShader([kk])
}

//======= minify ==========================

function minify(str) {
  function isSpace(str, i) {
    return str[i] === ' ' || str[i] === '\t'
  }
  function isLine(str, i) {
    return str[i] === '\n'
  }
  function replaceChars(str) {
    var dst = ''
    var num = str.length
    var isPreprocessor = false
    for (var i = 0; i < num; i++) {
      if (str[i] === '#') {
        isPreprocessor = true
      } else if (str[i] === '\n') {
        if (isPreprocessor) {
          isPreprocessor = false
        } else {
          dst = dst + ' '
          continue
        }
      } else if (str[i] === '\r') {
        dst = dst + ' '
        continue
      } else if (str[i] === '\t') {
        dst = dst + ' '
        continue
      } else if (i < num - 1 && str[i] === '\\' && str[i + 1] === '\n') {
        i += 1
        continue
      }

      dst = dst + str[i]
    }

    return dst
  }

  function removeEmptyLines(str) {
    var dst = ''
    var num = str.length
    var isPreprocessor = false
    for (var i = 0; i < num; i++) {
      if (str[i] === '#') isPreprocessor = true
      var isDestroyableChar = isLine(str, i)

      if (isDestroyableChar && !isPreprocessor) continue
      if (isDestroyableChar && isPreprocessor) isPreprocessor = false

      dst = dst + str[i]
    }

    return dst
  }

  function removeMultiSpaces(str) {
    var dst = ''
    var num = str.length
    for (var i = 0; i < num; i++) {
      if (isSpace(str, i) && i === num - 1) continue
      if (isSpace(str, i) && isLine(str, i - 1)) continue
      if (isSpace(str, i) && isLine(str, i + 1)) continue
      if (isSpace(str, i) && isSpace(str, i + 1)) continue
      dst = dst + str[i]
    }
    return dst
  }
  function removeSingleSpaces(str) {
    var dst = ''
    var num = str.length
    for (var i = 0; i < num; i++) {
      var iss = isSpace(str, i)

      if (i == 0 && iss) continue

      if (i > 0) {
        if (
          iss &&
          (str[i - 1] === ';' ||
            str[i - 1] === ',' ||
            str[i - 1] === '}' ||
            str[i - 1] === '{' ||
            str[i - 1] === '(' ||
            str[i - 1] === ')' ||
            str[i - 1] === '+' ||
            str[i - 1] === '-' ||
            str[i - 1] === '*' ||
            str[i - 1] === '/' ||
            str[i - 1] === '?' ||
            str[i - 1] === '<' ||
            str[i - 1] === '>' ||
            str[i - 1] === '[' ||
            str[i - 1] === ']' ||
            str[i - 1] === ':' ||
            str[i - 1] === '=' ||
            str[i - 1] === '^' ||
            str[i - 1] === '%' ||
            str[i - 1] === '\n' ||
            str[i - 1] === '\r')
        )
          continue
      }
      if (i > 1) {
        if (iss && (str[i - 1] === '&' && str[i - 2] === '&')) continue
        if (iss && (str[i - 1] === '|' && str[i - 2] === '|')) continue
        if (iss && (str[i - 1] === '^' && str[i - 2] === '^')) continue
        if (iss && (str[i - 1] === '!' && str[i - 2] === '=')) continue
        if (iss && (str[i - 1] === '=' && str[i - 2] === '=')) continue
      }

      if (
        iss &&
        (str[i + 1] === ';' ||
          str[i + 1] === ',' ||
          str[i + 1] === '}' ||
          str[i + 1] === '{' ||
          str[i + 1] === '(' ||
          str[i + 1] === ')' ||
          str[i + 1] === '+' ||
          str[i + 1] === '-' ||
          str[i + 1] === '*' ||
          str[i + 1] === '/' ||
          str[i + 1] === '?' ||
          str[i + 1] === '<' ||
          str[i + 1] === '>' ||
          str[i + 1] === '[' ||
          str[i + 1] === ']' ||
          str[i + 1] === ':' ||
          str[i + 1] === '=' ||
          str[i + 1] === '^' ||
          str[i + 1] === '%' ||
          str[i + 1] === '\n' ||
          str[i + 1] === '\r')
      )
        continue
      if (i < num - 2) {
        if (iss && (str[i + 1] === '&' && str[i + 2] === '&')) continue
        if (iss && (str[i + 1] === '|' && str[i + 2] === '|')) continue
        if (iss && (str[i + 1] === '^' && str[i + 2] === '^')) continue
        if (iss && (str[i + 1] === '!' && str[i + 2] === '=')) continue
        if (iss && (str[i + 1] === '=' && str[i + 2] === '=')) continue
      }

      dst = dst + str[i]
    }
    return dst
  }

  function removeComments(str) {
    var dst = ''
    var num = str.length
    var state = 0
    for (var i = 0; i < num; i++) {
      if (i <= num - 2) {
        if (state === 0 && str[i] === '/' && str[i + 1] === '*') {
          state = 1
          i += 1
          continue
        }
        if (state === 0 && str[i] === '/' && str[i + 1] === '/') {
          state = 2
          i += 1
          continue
        }
        if (state === 1 && str[i] === '*' && str[i + 1] === '/') {
          dst += ' '
          state = 0
          i += 1
          continue
        }
        if (state == 2 && (str[i] === '\r' || str[i] === '\n')) {
          state = 0
          continue
        }
      }

      if (state === 0) dst = dst + str[i]
    }
    return dst
  }

  str = removeComments(str)
  str = replaceChars(str)
  str = removeMultiSpaces(str)
  str = removeSingleSpaces(str)
  str = removeEmptyLines(str)
  return str
}

//======= minify ==========================

function bbc2html(content, allowMultimedia) {
  //content = content.replace(new RegExp('\r?\n','g'), '<br />');

  content = content.replace(
    /(\[url=)(.*?)(\])(.*?)(\[\/url\])/g,
    '<a href="$2" class="regular" target="_blank">$4</a>'
  )
  content = content.replace(
    /(\[url\])(.*?)(\[\/url\])/g,
    '<a href="$2" class="regular" target="_blank">$2</a>'
  )

  content = content.replace(/(:\))/g, '<img src="/img/emoticonHappy.png">')
  content = content.replace(/(:\()/g, '<img src="/img/emoticonSad.png">')
  content = content.replace(/(:D)/g, '<img src="/img/emoticonLaugh.png">')
  content = content.replace(/(:love:)/g, '<img src="/img/emoticonLove.png">')
  content = content.replace(
    /(:octopus:)/g,
    '<img src="/img/emoticonOctopus.png">'
  )
  content = content.replace(
    /(:octopusballoon:)/g,
    '<img src="/img/emoticonOctopusBalloon.png">'
  )
  content = content.replace(/(:alpha:)/g, '&#945;')
  content = content.replace(/(:beta:)/g, '&#946;')
  content = content.replace(/(:delta:)/g, '&#9169;')
  content = content.replace(/(:epsilon:)/g, '&#949;')
  content = content.replace(/(:nabla:)/g, '&#8711;')
  content = content.replace(/(:square:)/g, '&#178;')
  content = content.replace(/(:sube:)/g, '&#179;')
  content = content.replace(/(:limit:)/g, '&#8784;')

  content = content.replace(
    /(\[b\])([.\s\S]*?)(\[\/b\])/g,
    '<strong>$2</strong>'
  )
  content = content.replace(
    /(\[B\])([.\s\S]*?)(\[\/B\])/g,
    '<strong>$2</strong>'
  )
  content = content.replace(/(\[i\])([.\s\S]*?)(\[\/i\])/g, '<em>$2</em>')
  content = content.replace(/(\[I\])([.\s\S]*?)(\[\/I\])/g, '<em>$2</em>')
  content = content.replace(/(\[u\])([.\s\S]*?)(\[\/u\])/g, '<u>$2</u>')
  content = content.replace(/(\[ul\])([.\s\S]*?)(\[\/ul\])/g, '<ul>$2</ul>')
  content = content.replace(/(\[li\])([.\s\S]*?)(\[\/li\])/g, '<li>$2</li>')
  content = content.replace(
    /(\[code\])([.\s\S]*?)(\[\/code\])/g,
    '<pre>$2</pre>'
  )
  content = content.replace(
    /(\[Code\])([.\s\S]*?)(\[\/Code\])/g,
    '<pre>$2</pre>'
  )
  content = content.replace(
    /(\[CODE\])([.\s\S]*?)(\[\/CODE\])/g,
    '<pre>$2</pre>'
  )

  if (allowMultimedia) {
    content = content.replace(
      /(\[img\])(.*?)(\[\/img\])/g,
      '<a href="$2"><img src="$2" style="max-width:100%;"/></a>'
    )
    content = content.replace(
      /(\[Img\])(.*?)(\[\/Img\])/g,
      '<a href="$2"><img src="$2" style="max-width:100%;"/></a>'
    )
    content = content.replace(
      /(\[IMG\])(.*?)(\[\/IMG\])/g,
      '<a href="$2"><img src="$2" style="max-width:100%;"/></a>'
    )
    content = content.replace(
      /(\[video\])(?:http|https|)(?::\/\/|)(?:www.|)(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/ytscreeningroom\?v=|\/feeds\/api\/videos\/|\/user\S*[^\w\-\s]|\S*[^\w\-\s]))([\w\-]{11})(.*?)(\[\/video\])/g,
      '<iframe width="100%" height="360" src="https://www.youtube.com/embed/$2?hd=1" frameborder="0" allowfullscreen></iframe>'
    )
  }

  return content
}

function loadComments() {
  try {
    var httpReq = new XMLHttpRequest()
    httpReq.onload = function() {
      var jsn = httpReq.response
      updatepage(jsn)
    }
    httpReq.open('POST', '/comment', true)
    httpReq.responseType = 'json'
    httpReq.setRequestHeader(
      'Content-Type',
      'application/x-www-form-urlencoded'
    )
    httpReq.send('s=' + gShaderID)
  } catch (e) {
    return
  }
}

function dataLoadShader(jsnShader) {
  gRes = gShaderToy.newScriptJSON(jsnShader[0])
  if (gRes.mDownloaded == false) return

  document.title = gRes.mName == '' ? 'New' : gRes.mName

  /* st.textContent vs st.innerHTML*/
  var st = document.getElementById('shaderTitle')
  if (st) {
    if (st.value === undefined) {
      st.textContent = gRes.mName
      st.title = gRes.mName
    } else {
      st.value = gRes.mName
    }
  }
  var sd = document.getElementById('shaderDescription')
  if (sd) {
    if (sd.value === undefined) {
      sd.innerHTML = bbc2html(htmlEntities(gRes.mDescription), false)
    } else {
      sd.value = gRes.mDescription
    }
  }
  var sp = document.getElementById('published')
  if (sp && sp !== undefined && sp.length == 4) {
    if (gRes.mPublished == 0) {
      sp.selectedIndex = 3
    } else if (gRes.mPublished == 1) {
      sp.selectedIndex = 1
    } else if (gRes.mPublished == 2) {
      sp.selectedIndex = 2
    } else if (gRes.mPublished == 3) {
      sp.selectedIndex = 0
    }
  }

  updateLikes()
  var timeVar = '-'
  if (gRes.mDate != 0) {
    timeVar = piGetTime(gRes.mDate)
  }

  var shaderAuthorName = document.getElementById('shaderAuthorName')
  if (shaderAuthorName)
    shaderAuthorName.innerHTML =
      "<a class='user' href='/user/" +
      htmlEntities(gRes.mUserName) +
      "'>" +
      htmlEntities(gRes.mUserName) +
      '</a>'
  var shaderAuthorDate = document.getElementById('shaderAuthorDate')
  if (shaderAuthorDate) shaderAuthorDate.innerHTML = timeVar

  var txtHtml = ''
  var txtPlain = ''
  var numTags = gRes.mTags.length
  for (var i = 0; i < numTags; i++) {
    txtHtml +=
      "<a class='user' href='/results?query=tag%3D" +
      htmlEntities(gRes.mTags[i]) +
      "'>" +
      htmlEntities(gRes.mTags[i]) +
      '</a>'
    txtPlain += gRes.mTags[i]
    if (i != numTags - 1) {
      txtHtml += ', '
      txtPlain += ', '
    }
  }
  var sts = document.getElementById('shaderTags')
  if (sts) {
    if (sts.value === undefined) sts.innerHTML = txtHtml
    else sts.value = txtPlain
  }

  var shareShader = document.getElementById('shaderShare')

  // like
  var shaderLike = document.getElementById('shaderLike')
  if (shaderLike != null) {
    gIsLiked = gRes.mHasLiked
    updateLikes()
    shaderLike.onclick = function() {
      var url = 's=' + gShaderID + '&l=' + (gIsLiked == 1 ? 0 : 1)
      var mHttpReq = new XMLHttpRequest()
      mHttpReq.open('POST', '/shadertoy', true)
      mHttpReq.setRequestHeader(
        'Content-Type',
        'application/x-www-form-urlencoded'
      )
      mHttpReq.onload = function() {
        var jsn = mHttpReq.response
        if (jsn == null) return
        if (jsn.result != 0) {
          if (gIsLiked == 1) gRes.mLikes--
          else gRes.mLikes++
          gIsLiked = 1 - gIsLiked
          updateLikes()
        }
      }
      mHttpReq.send(url)
    }
  }
  gShaderToy.startRendering()
  gShaderToy.resetTime()

  if (gRes.mFailed) gShaderToy.pauseTime()
}

function loadShader() {
  try {
    var httpReq = new XMLHttpRequest()
    httpReq.addEventListener(
      'load',
      function(event) {
        var jsnShader = event.target.response
        if (jsnShader === null) {
          alert('Error loading shader')
          return
        }
        dataLoadShader(jsnShader)
      },
      false
    )
    httpReq.addEventListener(
      'error',
      function() {
        alert('Error loading shader')
      },
      false
    )

    httpReq.open('POST', '/shadertoy', true)
    httpReq.responseType = 'json'
    httpReq.setRequestHeader(
      'Content-Type',
      'application/x-www-form-urlencoded'
    )
    var str = '{ "shaders" : ["' + gShaderID + '"] }'
    str = 's=' + encodeURIComponent(str) + '&nt=1&nl=1'
    httpReq.send(str)
  } catch (e) {
    return
  }
}

function watchResize() {
  var srdiv = document.getElementById('demogl')
  if (srdiv) {
    var xres = srdiv.offsetWidth
    var yres = srdiv.offsetHeight
    gShaderToy.resize(xres, yres)
  }
}

function changeEditorFont() {
  var ele = document.getElementById('uiFontSelector')
  gShaderToy.setFontSize(ele.selectedIndex, true)
}

function watchInit() {
  //-- shadertoy --------------------------------------------------------

  var editorParent = document.getElementById('editor')
  var viewerParent = document.getElementById('player')
  var passParent = document.getElementById('passManager')

  // cancel/intercept browsers special keys
  document.addEventListener(
    'keydown',
    function(e) {
      // intercept BACKSPACE
      if (e.keyCode == 8) {
        var ele = piGetSourceElement(e)

        if (ele.nodeName === 'BODY') {
          e.preventDefault()
          return
        }

        if (ele.id === 'demogl') {
          var me = gShaderToy
          me.mEffect.SetKeyDown(me.mActiveDoc, e.keyCode)
          if (me.mIsPaused) me.mForceFrame = true
        }
      }
      // intercept CTRL+S (save the web page to disk)
      else if (
        e.keyCode == 83 &&
        (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)
      ) {
        e.preventDefault()
      }
      // intercept browsers default behaviour for CTRL+F (search)
      else if (
        e.keyCode == 70 &&
        (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)
      ) {
        e.preventDefault()
      }
    },
    false
  )

  // cancel/intercept browsers default behaviour for ALT+LEFT (prev URL)
  if (!navigator.platform.match('Mac'))
    document.addEventListener(
      'keydown',
      function(e) {
        if (e.keyCode == 37 && e.altKey) {
          e.preventDefault()
        }
      },
      false
    )

  // prevent unloading page without saving changes to shader
  window.onbeforeunload = function(e) {
    if (gShaderToy != null && gShaderToy.GetNeedSave())
      return 'You are about to lose your changes in the code editor.'
  }

  gShaderToy = new ShaderToy(viewerParent, editorParent, passParent)
  if (!gShaderToy.mCreated) return

  gShaderToy.setFontSize(gFontSize, false)

  //-- get info --------------------------------------------------------

  if (gShaderID == null) {
    loadNew()
  } else {
    loadComments(gShaderID)
    loadShader(gShaderID)
  }
}

function updateLikes() {
  //if( gRes.mFailed ) return;

  var shaderLike = document.getElementById('shaderLike')
  if (shaderLike != null) {
    if (gIsLiked == 1) {
      shaderLike.src = '/img/themes/' + gThemeName + '/likeYes.png'
    } else {
      shaderLike.src = '/img/themes/' + gThemeName + '/likeNo.png'
    }
  }

  var shaderStatsViewed = document.getElementById('shaderStatsViewed')
  if (shaderStatsViewed) shaderStatsViewed.innerHTML = '' + gRes.mViewed
  var shaderStatsLikes = document.getElementById('shaderStatsLikes')
  if (shaderStatsLikes) shaderStatsLikes.innerHTML = '' + gRes.mLikes
}

function updatepage(jsn) {
  var txt = ''
  var numComments = jsn.text ? jsn.text.length : 0
  var shaderStatsComments = document.getElementById('shaderStatsComments')
  if (shaderStatsComments) shaderStatsComments.innerHTML = '' + numComments

  for (var i = 0; i < numComments; i++) {
    var timeVar = '-'
    if (jsn.date[i] != 0) {
      timeVar = piGetTime(jsn.date[i])
    }

    if (jsn.username[i] === gUserName) {
      txt += '<div class="commentSelf">'
    } else {
      txt += '<div class="comment">'
    }
    txt +=
      '<table width="100%"><tr><td class="commentPicture"><img class="userPictureSmall" src="' +
      jsn.userpicture[i] +
      '"></img></td>'
    txt +=
      "<td class=\"commentContent\"><a class='user' href='/user/" +
      htmlEntities(jsn.username[i]) +
      "'>" +
      htmlEntities(jsn.username[i]) +
      '</a>, ' +
      timeVar +
      '<br>' +
      bbc2html(htmlEntities(jsn.text[i]), true) +
      '</td></tr></table>'
    txt += '</div>'
  }

  var cc = document.getElementById('myComments')
  if (cc) cc.innerHTML = txt
  var dd = document.getElementById('commentTextArea')
  if (dd) dd.value = ''
}

function addComment(usr, form) {
  var xmlHttp = new XMLHttpRequest()
  if (xmlHttp == null) return

  // disable comment input elements while we process the comment submision
  form.mybutton.disabled = true
  form.comment.disabled = true

  // encode comments
  var commentsformated = form.comment.value
  commentsformated = encodeURIComponent(commentsformated)

  var url = 's=' + usr + '&comment=' + commentsformated
  xmlHttp.open('POST', '/comment', true)
  xmlHttp.responseType = 'json'
  xmlHttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
  xmlHttp.timeout = 15000 // 15 seconds
  xmlHttp.ontimeout = function() {
    var ve = document.getElementById('centerScreen')
    doAlert(
      piGetCoords(ve),
      { mX: 320, mY: 100 },
      'Error',
      "We are sorry, we couldn't submit your comment",
      false,
      null
    )
    // reenable comment input elements
    form.mybutton.disabled = false
    form.comment.disabled = false
  }

  xmlHttp.onload = function() {
    var jsn = xmlHttp.response
    if (jsn.added && jsn.added != 0) {
      updatepage(jsn)
    } else {
      var ve = document.getElementById('centerScreen')
      doAlert(
        piGetCoords(ve),
        { mX: 320, mY: 100 },
        'Error',
        "We are sorry, we couldn't submit your comment",
        false,
        null
      )
    }
    // reenable comment input elements
    form.mybutton.disabled = false
    form.comment.disabled = false
  }

  xmlHttp.onerror = function() {
    var ve = document.getElementById('centerScreen')
    doAlert(
      piGetCoords(ve),
      { mX: 320, mY: 100 },
      'Error',
      "We are sorry, we couldn't submit your comment",
      false,
      null
    )
    // reenable comment input elements
    form.mybutton.disabled = false
    form.comment.disabled = false
  }
  xmlHttp.send(url)
}

function checkFormComment(str) {
  if (str == '') {
    var ve = document.getElementById('centerScreen')
    doAlert(
      piGetCoords(ve),
      { mX: 320, mY: 100 },
      'Error',
      'You need to write at least 1 character',
      false,
      null
    )
    return false
  }
  return true
}

function validateComment(form) {
  if (checkFormComment(form.comment.value)) {
    addComment(gShaderID, form)
    return true
  }

  form.comment.focus()
  return false
}

function shaderSaved(res, savedID, isUpdate, dataJSON) {
  var ve = document.getElementById('centerScreen')

  if (res === 0) {
    gShaderToy.SetNeedSave(false)
    if (isUpdate) {
      //doAlert( piGetCoords(ve), {mX:400,mY:160}, "Update", "The shader was updated successfully", false, null );
      var eleWrapper = document.getElementById('editorWrapper')
      //eleWrapper.className = "saved";
      eleWrapper.classList.add('saved')
      setTimeout(function() {
        eleWrapper.classList.remove('saved')
      }, 500)
    } else {
      window.location = '/view/' + savedID
    }
  } else if (res === -2) {
    doAlert(
      piGetCoords(ve),
      { mX: 400, mY: 160 },
      'Error',
      'Shader name "' +
        dataJSON.info.name +
        '" is already used by another shader. Please change the name of your shader.',
      false,
      null
    )
  } else if (res === -3) {
    doAlert(
      piGetCoords(ve),
      { mX: 400, mY: 180 },
      'Error',
      'The shader could not be ' +
        (isUpdate == true ? 'updated' : 'added') +
        ', you might not be logged in anymore, please Sign In again.',
      false,
      null
    )
  } else if (res === -13) {
    doAlert(
      piGetCoords(ve),
      { mX: 400, mY: 180 },
      'Error',
      'The shader coubld not be saved, it is using private assets.',
      false,
      null
    )
  } else {
    doAlert(
      piGetCoords(ve),
      { mX: 400, mY: 180 },
      'Error',
      'The shader could not be ' +
        (isUpdate == true ? 'updated' : 'added') +
        ', please try again. Error code : ' +
        res,
      false,
      null
    )
  }
}

function openSubmitShaderForm(isUpdate) {
  var eleButton = document.getElementById('saveButton')

  if (eleButton.disabled) return // prevent doouble save

  var ve = document.getElementById('centerScreen')
  var s1 = document.getElementById('shaderTitle')
  var s2 = document.getElementById('shaderTags')
  var s3 = document.getElementById('shaderDescription')

  if (!s1.validity.valid) {
    doAlert(
      piGetCoords(ve),
      { mX: 320, mY: 100 },
      'Error',
      'You must give a name to your shader',
      false,
      null
    )
    return
  }
  if (!s2.validity.valid) {
    doAlert(
      piGetCoords(ve),
      { mX: 320, mY: 100 },
      'Error',
      'You must assign at least one tag to your shader',
      false,
      null
    )
    return
  }
  if (!s3.validity.valid) {
    doAlert(
      piGetCoords(ve),
      { mX: 320, mY: 100 },
      'Error',
      'You must give a description to your shader',
      false,
      null
    )
    return
  }
  if (!checkFormComment(s1.value)) return false
  //if( !checkFormComment(s1.value) ) return false;
  if (!checkFormComment(s3.value)) return false

  eleButton.disabled = true

  var publishedStatus = 3
  var sp = document.getElementById('published')
  var op = sp.options[sp.selectedIndex].value
  // HTML: 0: private   1: unlisted   2: public    3: public+api
  // DB  : 0: private   2: unlisted   1: public    3: public + api
  if (op == '0') publishedStatus = 0
  else if (op == '1') publishedStatus = 2
  else if (op == '2') publishedStatus = 1
  else if (op == '3') publishedStatus = 3

  if (publishedStatus == 1 || publishedStatus == 3) {
    // compile shader before trying to publish (to make sure it's error free)
    gShaderToy.SetShaderFromEditor()
    if (gShaderToy.GetAnyErrors()) {
      var ve = document.getElementById('centerScreen')
      doAlert(
        piGetCoords(ve),
        { mX: 400, mY: 160 },
        'Error',
        'The shader can not be saved because it does not compile',
        false,
        null
      )
      eleButton.disabled = false
      return
    }
  }

  var dataJSON = gShaderToy.exportToJSON()

  dataJSON.info.name = s1.value
  dataJSON.info.tags = s2.value.split(',')
  dataJSON.info.description = s3.value

  // Initial support for drafts
  dataJSON.info.published = publishedStatus

  // Generate the screenshot
  var canvas = document.getElementById('demogl')
  var dataURL = canvas.toDataURL('image/jpeg')

  var dataTXT = JSON.stringify(dataJSON, null)

  dataTXT = encodeURIComponent(dataTXT)

  // Submit the values to the cloud
  var mHttpReq = new XMLHttpRequest()
  mHttpReq.open('POST', '/shadertoy', true)
  mHttpReq.responseType = 'json'
  mHttpReq.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')

  var url = 'a='
  if (isUpdate) url = 'u='
  url += dataTXT

  if (dataJSON.flags.mFlagWebcam === false) {
    url += '&ss=' + dataURL
  }

  mHttpReq.onerror = function() {
    eleButton.disabled = false
    shaderSaved(-3, 'NOID', isUpdate, dataJSON)
  }
  mHttpReq.onload = function() {
    eleButton.disabled = false
    try {
      var jsn = mHttpReq.response
      shaderSaved(jsn.result, jsn.id, isUpdate, dataJSON)
    } catch (e) {
      shaderSaved(-3, 'NOID', isUpdate, dataJSON)
    }
  }
  mHttpReq.send(url)
}

//==================================================================
