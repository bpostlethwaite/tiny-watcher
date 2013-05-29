# tiny-watcher

There is no such thing as [fs.watch](http://nodejs.org/docs/latest/api/fs.html#fs_fs_watch_filename_options_listener) and this is a wrapper around it. Another one. Yep, there are lots of wrappers and I tried a couple for my project but found that they were all buggy in their own idiosyncratic ways. I needed one that was buggy in a specific way, so I coded up tiny-wrapper.

## Example
```javascript
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
```
which produces
```shell
EXAMPLE: added test
EXAMPLE: removed test
EXAMPLE: added total
EXAMPLE: changed total
```

## API

### tiny()

The main object is a function that produces watchers for a specific directory an optional set of files.
```javascript
var watcher = tiny("path/to/dir" [, ["list", "of", "files"]])
```

### watcher.on
Three events, `added`, `removed` and `changed` are supported. The callback returns the filename.

### watcher.emitWatched(event)
Cycle through all the files being monitored by the tiny-watcher instance and emit `event` events for each one.
Useful for on-startup tasks.

### watcher.close()
Calls the base fs method [watcher.close()](http://nodejs.org/docs/latest/api/fs.html#fs_watcher_close)


## INSTALL
```shell
npm install tiny-watcher
```

## LICENSE
MIT
