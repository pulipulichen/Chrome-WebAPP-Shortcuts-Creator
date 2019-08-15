let ClipboardHelper = {
  copyPlainText: function (text) {
    var copyTextInput = document.getElementById("puliClipboardInput")
    if (copyTextInput === null) {
      var copyTextInput = document.createElement("textarea");
      copyTextInput.id = "puliClipboardInput"
      //copyTextInput.type = "text"
      document.body.appendChild(copyTextInput);
    }

    copyTextInput.value = text

    copyTextInput.style = "display: block; position: absolute; top: -1000px; left: -1000px;"
    /* Select the text field */
    copyTextInput.select();

    /* Copy the text inside the text field */
    document.execCommand("copy");

    copyTextInput.style = "display: none"
  },
  copyRichFormatListener: function (e, str) {
    e.clipboardData.setData("text/html", str);
    e.clipboardData.setData("text/plain", str);
    e.preventDefault();
  },
  copyRichFormat: function (str) {
    document.addEventListener("copy", (e) => {
      this.copyRichFormatListener(e, str)
    });
    document.execCommand("copy");
    document.removeEventListener("copy", (e) => {
      this.copyRichFormatListener(e, str)
    });
  },
  getClipboardData: function (callback) {
    navigator.permissions.query({name: "clipboard-read"}).then(result => {
      // If permission to read the clipboard is granted or if the user will
      // be prompted to allow it, we proceed.

      if (result.state === "granted" || result.state === "prompt") {
        navigator.clipboard.read().then(data => {
          let result = []
          for (let i=0; i<data.items.length; i++) {
            if (data.items[i].type !== "text/plain") {
              console.error("Clipboard contains non-text data. Unable to access it.");
            } else {
              result.push(data.items[i].getAs("text/plain"))
            }
          }
          if (typeof(callback) === 'function') {
            callback(result.join(' '))
          }
        });
      }
    });
  },
  
}

window.ClipboardHelper = ClipboardHelper