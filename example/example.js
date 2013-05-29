var tiny = require('../.')
  , fs = require('fs')
  , rimraf = require('rimraf')
  , path = require('path')


var somedir = "somedir"

fs.mkdirSync(somedir)
var watcher = tiny(somedir, ["test", "total"])

watcher.on("added", function (file) {
  console.log("EXAMPLE: added", file)
})

watcher.on("removed", function (file) {
  console.log("EXAMPLE: removed", file)
})

watcher.on("changed", function (file) {
  console.log("EXAMPLE: changed", file)
})

// ADD TEST
fs.writeFileSync(path.join(somedir, "test"), "data")
// REMOVE TEST
fs.unlinkSync(path.join(somedir, "test"))
// ADD TOTAL
fs.writeFileSync(path.join(somedir, "total"), "data")
// CHANGE TOTAL
fs.writeFileSync(path.join(somedir, "total"), "new data")
// ADD TONNES (NOT IN SPECIFIED FILE LIST)
fs.writeFileSync(path.join(somedir, "tonnes"), "data")

/*
 * Setting watcher kill should stop the remove event
 * when total is removed with rimraf
 */
setTimeout( function () {

  watcher.close()
  rimraf(somedir, function (err) {

    if (err) throw err

    process.exit()

  })
}, 1000)