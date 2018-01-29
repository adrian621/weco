start cmd /k "C:\Program Files\MongoDB\Server\3.6\bin\mongod.exe"
start cmd /k "D:\Users\Jakob\AppData\Local\Android\tools\emulator -avd Nexus_5X_API_27_x86"
start cmd /k "D:\Users\Jakob\AppData\Local\Android\tools\emulator -avd Nexus2"
ping -n 19 127.0.0.1 >nul
start cmd /k "cd D:\weco\server && node index.js"
ping -n 19 127.0.0.1 >nul
start cmd /k "cd D:\weco\client && react-native run-android"
