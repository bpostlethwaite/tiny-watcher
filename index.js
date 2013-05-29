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

    , monitor = fs.watch(watchdir)
    , step = 0
    , have = {}
    , eventlock = {}
    , match = false


  if (Array.isArray(filelist))
    match = true

  /*
   * Read in all files in directory on startup.
   * If there are matching files, only keep the files
   * that match those in the specified list
   */
  fs.readdirSync(watchdir).forEach( function (file) {

    if (match && filelist.indexOf(file) === -1)
      return

    have[path.join(watchdir, file)] = true
  })

  monitor.on("change", function (event, file) {
    /*
     * fs.watch is sneaky. It only fires change events but then
     * provides the event parameter which can be "rename" or "change".
     * For new files you sometimes get both.
     * You only get a "rename" event if the file is removed.
     * You sometimes get two "change" events if the file is changed.
     * So if we get a duplicate file event within a
     * delay milliseconds lets just chuck it out. Lets also work with
     * the duality of events. We can set up a semaphore like lock where
     * if within a certain time an event tries to get into locked code
     * path it aborts, but also opens the lock. This helps when there are
     * near simultaneous file create followed by writing.
     * We want both the "added" and the "changed" events in this case.
     * This doesn't work with a pure time based expiry system
     */


//    console.log("TINY", event, file)

    if (match && filelist.indexOf(file) === -1)
      return


    var fp = path.join(watchdir, file)

    if ( event === "rename" ) {

      /*
       * handle "add" and "remove"
       */
      if (have[fp]) {

        /*
         * If its in the dictionary and a rename event
         * it might be a remove event.
         */
        fs.exists(fp, function (exists) {

          if (exists) {
            /*
             * If it exists it probably a rename event
             * Emit a change
             */

            return self.emit("changed", file)

          } else {
            /*
             * Its a remove event
             */

            self.emit("removed", file)

            return delete have[fp]
          }
        })

      } else {

        /*
         * If it's a rename event but doesn't exist in the
         * dictionary it's and "add". We don't want to also
         * emit a changed event, so lets set a lock for this
         * file, and the change event will hit it and disable
         * it. If we don't get a double change event, lets expire
         * the lock in x milliseconds.
         */
        eventlock[fp] = true

        expire(fp, 25)

        have[fp] = true

        self.emit("added", file)
      }
    }

    if ( event === "change" ) {

      /*
       * We get double "change" on a change, and also
       * a change event on a new file. Because of the delay
       * the in this code path, the "rename" event will have
       * triggered the eventlock. However if
       */
      setTimeout( function () {

        /*
         * Yeh there are race conditions here
         */
        if (eventlock[fp])

          return delete eventlock[fp]

        else {

          eventlock[fp] = true

          expire(fp, 25)

          return self.emit("changed", file)

        }
      }, (step++ % 2 + 1) * 10)

    }
  })

  function expire (fp, ttl) {

    setTimeout ( function () {

      delete eventlock[fp]

    }, ttl)
  }


  function emitWatched (event) {

    Object.keys(have).forEach (function (file) {

      self.emit(event, path.basename(file))
    })
  }


  function close () {
    monitor.close()
  }


  self.close = close
  self.emitWatched = emitWatched



  return self

}