Here is the application design

```

  message:
    state:
      text: ''
    actions:
      setText:
      clear
    UI:
      Text: contents
  camera:
    state:
      isOn
      config
    actions:
      toggleOn
      setConfig
  videos:
    state:
      videos {}
        id:
        URL:
        blobs:
        isLocal
        isMuted
        saving
      saveInfo
        id
        name
    actions:
      play(id)
      playAll
      add
      delete
      startSave
      cancelSave
      toggleMuted
  saveDialog
    videoName
    userName
actions:
  setMessage
  addVideoURL
  addVideoBlobs
  deleteVideo(id)
  saveVideo(id)
  setMutes(id)
  playAll
  playVideo(id)
  record
UI
  Box
    Videos
      Video
        ReactPlayer
        VideoControls
          Button MUTE
          Button DELETE
          Button SAVE
        LocalPlayer
          Button OFF
    Controls
      Button: ADD
      Button: PLAY
      Button: RECORD
      Button: REWiND
      Button: CAMERA

      help:
    state:
      pageNo: 1
      pages: []
      isDisplayed: false
    actions:
      setPage
      toggleIsDisplayed
    UI:
      Button: title: help, onClick:toggleIsDisplayed
      Text: contents:
```
