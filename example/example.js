var tiny = require('../.')
  , fs = require('fs')
  , rimraf = require('rimraf')
  , path = require('path')


var somedir = "somedir"

fs.mkdirSync(somedir)

var watcher = tiny(somedir, ["test","total", "tonnes"])

watcher.on("added", function (file) {
  console.log("added", file)
})

watcher.on("removed", function (file) {
  console.log("removed", file)
})

watcher.on("changed", function (file) {
  console.log("changed", file)
})

fs.writeFileSync(path.join(somedir, "test"), "data")

fs.writeFileSync(path.join(somedir, "total"), "data")

fs.writeFileSync(path.join(somedir, "test"), "new data")

fs.writeFileSync(path.join(somedir, "tonnes"), "data")

fs.unlinkSync(path.join(somedir, "test"))

setTimeout( function () {
  rimraf(somedir, function (err) {
    if (err) throw err
    process.exit()
  })
}, 1000)