const fs = require('fs')

// 删除sdk中的js文件
fs.rmSync('./sdk/flowSdk.umd.min.js')
console.log('已删除sdk文件')

// 复制dist中的js到sdk
fs.copyFileSync('./dist/flowSdk.umd.min.js', './sdk/flowSdk.umd.min.js')
console.log('已复制sdk文件')