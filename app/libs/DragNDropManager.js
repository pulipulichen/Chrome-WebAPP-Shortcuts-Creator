let DragNDropManager = {
  init: function (callback) {
    let dragoverClassname = 'dragover'
    
    //let doc = $('body')
    let doc = $(document)
    let body = $('body')
    
    //let timer = null
    
    doc.on('dragenter', (e) => {
      e.preventDefault()
      e.stopPropagation()
      body.addClass(dragoverClassname)
      //console.log('body dragenter')
    })
    
    doc.on('dragover', (e) => {
      e.preventDefault()
      e.stopPropagation()
    })
    
    doc.on('drop', (e) => {
      //body.addClass(dragoverClassname)
      //console.log('body dragenter')
      e.preventDefault()
      e.stopPropagation()
      body.removeClass(dragoverClassname)
      if (typeof(callback) === 'function') {
        callback(this.getFilesFromEvent(e))
      }
      return false
    })
    /*
    doc.on('dragover', () => {
      if (timer !== null) {
        clearTimeout(timer)
      }
      timer = setTimeout(() => {
        body.removeClass(dragoverClassname)
        timer = null
        console.log('body dragleave')
      }, 1000)
    })
    */
    doc.on('dragleave', (e) => {
      //console.log(e)
      //console.log([e.clientX, e.clientY])
      if (e.clientX === 0 || e.clientY === 0) {
        body.removeClass(dragoverClassname)
        //console.log('body dragleave')
      }
    })
  },
  getFilesFromEvent: function (event) {
    let files
    if (typeof(event) === 'object' 
            && typeof(event.originalEvent) === 'object'
            && typeof(event.originalEvent.dataTransfer) === 'object'
            && typeof(event.originalEvent.dataTransfer.files) !== 'undefined') {
      files = event.originalEvent.dataTransfer.files
    }
    return files
  }
}

window.DragNDropManager = DragNDropManager