const debug = require('debug')('app:cacheMiddleware');
const flatCache = require('flat-cache');
let cache = flatCache.load('cacheId');

function del(key) {
  cache.removeKey(key)
}
module.exports = function cacheMiddleware(req, res, next) {
    (async function pos() {
    try {
      let key = '__express__' + req.originalUrl || req.url
      let cacheContent = cache.getKey(key);
      if (cacheContent) {
        debug('loading from cache');
        res.send(cacheContent);
        return
      } else {
        res.sendResponse = res.send
        res.send = (body) => {
          cache.setKey(key, body);
          cache.save();
          setTimeout(del, 60000, key);
          //setTimeout(cache.removeKey(key), 60000);
          res.sendResponse(body)
        }
        next()
      }
    } catch (err) {
      console.log(err.stack);
    }
  }());    
}