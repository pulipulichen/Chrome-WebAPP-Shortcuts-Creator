let FilePasteHelper = {
  init: function (callback) {
    window.addEventListener("paste", (pasteEvent) => {
      let items = pasteEvent.clipboardData.items;
      //console.log(JSON.stringify(pasteEvent.clipboardData))
      //console.log(items.length)
      for (var i = 0; i < items.length; i++) {
        // Skip content if not image
        if (items[i].type.indexOf("image") === -1) {
          continue;
        }
        
        pasteEvent.preventDefault()
        pasteEvent.stopPropagation()
        // Retrieve image on clipboard as blob
        let blob = items[i].getAsFile();

        //if (typeof (callback) === "function") {
        //  callback(blob);
        //}
        this.convertBlobToBase64(blob, callback)
        return
      }
    }, false);
  },
  convertBlobToBase64: function (blob, callback) {
    let mycanvas = document.createElement("canvas");
    let ctx = mycanvas.getContext('2d');

    // Create an image
    let img = new Image();

    // Once the image loads, render the img on the canvas
    img.onload = function () {
      // Update dimensions of the canvas with the dimensions of the image
      mycanvas.width = this.width;
      mycanvas.height = this.height;

      // Draw the image
      ctx.drawImage(img, 0, 0);

      // Execute callback with the base64 URI of the image
      if (typeof (callback) === "function") {
        callback(mycanvas.toDataURL(
                ("image/png")
                ));
      }
    };

    // Crossbrowser support for URL
    let URLObj = window.URL || window.webkitURL;

    // Creates a DOMString containing a URL representing the object given in the parameter
    // namely the original Blob
    img.src = URLObj.createObjectURL(blob);
  }
}

window.FilePasteHelper = FilePasteHelper