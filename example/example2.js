var tiny = require('../.')
  , fs = require('fs')
  , rimraf = require('rimraf')
  , path = require('path')


var somedir = "somedir"

fs.mkdirSync(somedir)
// ADD TEST
fs.writeFileSync(path.join(somedir, "test"), "data")
// ADD TOTAL
fs.writeFileSync(path.join(somedir, "total"), "data")




var watcher = tiny(somedir)

watcher.on("added", function (file) {
  console.log("EXAMPLE: added", file)
})

watcher.on("removed", function (file) {
  console.log("EXAMPLE: removed", file)
})

watcher.on("changed", function (file) {
  console.log("EXAMPLE: changed", file)
})

// REMOVE TEST
fs.unlinkSync(path.join(somedir, "test"))
// CHANGE TOTAL
fs.writeFileSync(path.join(somedir, "total"), "new data")
// ADD TONNES
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