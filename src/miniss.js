var fs = require('fs');

function miniss(config, css, out) {

  var self = this,
    debug = false,
    interpolation = {
      start: '__',
      end: '__',
      mixin: '!=',
      builtinMixin: '!jss='
    };

  function log(msg) {
    if (debug) {
      console.log(msg);
    }
  }

  function selector(property) {
    return interpolation.start + property + interpolation.end;
  }

  function cssize(json) {
    log('Rendering mixin to css');
    var output = [],
      prop;
    for (prop in json) {
      log('cssize: ' + prop  + ': ' + json[prop]);
      output.push(prop + ': ' + json[prop] + '')
    }
    log('Output:');
    log(output.join('\n '));
    log('Mixin completed');
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




  this.setInterpolation = function (start, end, mixin) {
    interpolation.start = start;
    interpolation.end = end;
    interpolation.mixin = mixin;
  };

  this.replace = function (input, property) {
    console.log('Input is : ' + input);
    return input.replace(selector(property), config[property]);
  };

  function processBuiltInMixins(processed) {
    var builtin, pattern, regex, matchObj, match, args;

    for (builtin in self.mixins) {
      pattern = interpolation.builtinMixin + builtin;
      log('Processing ' + pattern + '...');
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

  this.compile = function (verbose) {
    debug = verbose || false;
    fs.readFile(css, 'utf8', function (err, file) {
      if (err) {
        log(err);
        return;
      }
      log('Got file: ' + file);
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