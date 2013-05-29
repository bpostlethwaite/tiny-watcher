/*
 * tiny-watcher
 * A tiny wrapper around fs.watch for added, removed and changed events
 *
 * Ben Postlethwaite
 *
 * May 2013
 * License MIT
 */

var fs = require('fs')
  , EventEmitter = require('events').EventEmitter
  , path = require('path')

module.exports = function (watchdir, filelist) {

  var self = new EventEmitter

  var monitor = fs.watch(watchdir)

  var have = {}

  var match = false
  if (Array.isArray(filelist))
    match = true

  fs.readdirSync(watchdir).forEach( function (file) {
    if (match && filelist.indexOf(file) === -1)
      return
    have[path.join(watchdir, file)] = true
  })

  monitor.on("change", function (event, file) {

    if (match && filelist.indexOf(file) === -1)
      return

    var fp = path.join(watchdir, file)
    if (have[fp]) {

      fs.exists(fp, function (exists) {
        if (exists) {
          /*
           * If its in the dictionary and exists
           * its a change
           */
          self.emit("changed", file)
        } else {
          /*
           * If its in the dictionary and does not exist
           * its a remove. Remove from dictionary
           */
          self.emit("removed", file)
          delete have[fp]
        }
      })
    } else {

      fs.exists(fp, function (exists) {

        if (exists) {
          /*
           * If it doesn't yet exist in the dictionary
           * but now exists in filesystem its an add.
           */
          have[fp] = true
          self.emit("added", file)

        } else {
          /*
           * If it was not in dictionary and doesn't exist
           * in the filesystem.... who cares
           */
        }
      })
    }
  })


  return self
}