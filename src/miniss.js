var fs = require('fs');

function miniss(css, out, configFile) {
  
  var self = this,
    debug = false,
    interpolation = {
      start: '__',
      end: '__',
      mixin: '!=',
      builtinMixin: '!miniss='
    },
    configFile, out;

  if (configFile) {
    config = require(configFile);
  } else {
    warn('jssfile.js not present and no config file provided');
    config = {};
  }

  function log(msg) {
    if (debug) {
      var time = new Date().toUTCString();
      console.log('[' + time + ']: ' + msg);
    }
  }

  function warn(msg) {
    console.warn(msg);
  }

  function selector(property) {
    return interpolation.start + property + interpolation.end;
  }

  function cssize(json) {
    var output = [],
      prop;
    for (prop in json) {
      output.push(prop + ': ' + json[prop] + '');
    }
    return output.join('\n  ');
  }

  this.mixins = {
    element: function (property, value) {
      return '\n' + property + '{\n  ' + value + '\n}';
    },
    cross: function (property, value) {
      var declaration = property + ': ' + value + '',
        extensions = ['', '-moz-', '-webkit-', '-o-', '-ms-'];
      return extensions.map(function (item) {
        return item + declaration;
      }).join('\n  ');
    }
  };

  this.setInterpolation = function () {
    interpolation.start = arguments[0] || '__';
    interpolation.end = arguments[1] || '__';
    interpolation.mixin = arguments[2] || '!=';
    interpolation.builtinMixin = arguments[3] || '!miniss=';
  };

  this.replace = function (input, property) {
    return input.replace(new RegExp(selector(property), 'gi'), config[property]);
  };

  function processBuiltInMixins(processed) {
    var builtin, pattern, regex, matchObj, match, args;

    for (builtin in self.mixins) {
      pattern = interpolation.builtinMixin + builtin;
      log('Processing ' + pattern + ' ...');
      regex = new RegExp(interpolation.builtinMixin + builtin + '\\s\\w+.*;', 'g');
      matchObj = processed.match(regex);
      if (matchObj) {
        matchObj.forEach(function (element, index, array) {
          match = element.toString();
          args = processArguments(match, pattern);
          processed = processed.replace(match, self.mixins[builtin].apply(self, args));
        });
      }
    }
    return processed;
  }

  function processArguments(input, pattern) {
    var args = input.replace(pattern, '')
      .trim()
      .split(',')
      .map(function (item) {
      return item.toString().trim();
    });
    return args;
  }

  this.setDebug = function (bDebug) {
    debug = bDebug;
  };

  this.compile = function () {
    fs.readFile(css, 'utf8', function (err, file) {
      if (err) {
        log(err);
        return;
      }
      
      var output, prop, args, pieces, pattern, matchObj, match, func, czz, i, len;
      output = processBuiltInMixins(file);
      log('After builtin: ' + output);
      for (prop in config) {
        if (typeof config[prop] === 'string') {
          log('Converting variable: ' + prop);
          output = self.replace(output, prop);
        }
        
        if (typeof config[prop] === 'function') {
          log('Converting function: ' + prop);
          pattern = new RegExp(interpolation.mixin + prop + '\\s\\w+.*;', 'g');
          matchObj = output.match(pattern);

          if (matchObj) {
            matchObj.forEach(function (element, index, array) {
              match = element.toString();
              args = processArguments(match, interpolation.mixin + prop + ' ');
              output = output.replace(match, cssize(config[prop].apply(this, args)));
            });
          }
        }
      }

      output = '/* Generated with miniss on ' + new Date().toUTCString() + ' */\n' + output;

      fs.writeFile(out, output, function (err) {
        if (err) {
          throw err;
        }
        log('File ' + out + ' saved');
      });

    });
  };
  
}

module.exports = miniss;