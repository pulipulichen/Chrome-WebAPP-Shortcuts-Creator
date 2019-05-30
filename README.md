# Windows-WebAPP-Shortcuts-Creator

- Project: https://github.com/pulipulichen/Windows-WebAPP-Shortcuts-Creator
- Issues: https://github.com/pulipulichen/Windows-WebAPP-Shortcuts-Creator/issues

# Electron Builder

- https://www.electron.build/configuration/configuration

compression = normal “store” | “normal” | “maximum” 

# Fix Electron "chrome-sandbox" issue

````
[22400:0530/145253.572836:FATAL:setuid_sandbox_host.cc(157)] The SUID sandbox helper binary was found, but is not configured correctly. Rather than run without sandboxing I'm aborting now. You need to make sure that /usr/lib/node_modules/electron/dist/chrome-sandbox is owned by root and has mode 4755.
````

````
cd /usr/lib/node_modules/electron/dist/
sudo chown root chrome-sandbox
chmod 4755 chrome-sandbox
````
