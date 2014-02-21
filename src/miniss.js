var fs = require('fs');

function miniss(config, css, out) {

  var self = this,
    debug = false,
    interpolation = {
      start: '__',
      end: '__',
      mixin: '@@',
      builtinMixin: '@miniss-'
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
      output.push('  ' + prop + ': ' + json[prop] + ';')
    }
    log('Output:');
    log(output.join('\n'));
    log('Mixin completed');
    return output.join('\n');
  }

  var mixins = {
    cross: function (property, value) {
      var declaration = property + ': ' + value + '',
        extensions = ['', '-moz-', '-webkit-', '-o-', '-ms-'];
      return extensions.map(function (item) {
        return '  ' + item + declaration;
      }).join('\n');
    }
  };


  this.setInterpolation = function (start, end, mixin) {
    interpolation.start = start;
    interpolation.end = end;
    interpolation.mixin = mixin;
  };

  this.replace = function (input, property) {
    return input.replace(selector(property), config[property]);
  };

  this.compile = function (verbose) {
    debug = verbose || false;
    fs.readFile(css, 'utf8', function (err, file) {
      if (err) {
        log(err);
        return;
      }

      function processBuiltInMixins(output) {
        var pattern, regex, matchObj, match, args;
        for (builtin in mixins) {
          pattern = interpolation.builtinMixin + builtin;
          regex = new RegExp(interpolation.builtinMixin + builtin + '\\s\\w+.*;', 'g');
          matchObj = output.match(regex);
          if (!matchObj) {
            log('No pattern match on built in');
            continue;
          }
          
          match = matchObj.toString();
          log('Builtin-match: ' + match);
          args = match.replace(pattern, '')
            .trim()
            .split(',')
            .map(function (item) {
            return item.toString().trim();
          });
          log('Builtin args: ' + args);
          log(mixins[builtin].apply(self, args));
          return output.replace(match, mixins[builtin].apply(self, args));
        }
      }

      var output = file, prop, args, pieces, pattern, matchObj, match, func, czz;
      for (prop in config) {
        if (typeof config[prop] === 'string') {
          log('Converting variable: ' + prop);
          output = self.replace(output, prop);
        }
        
        if (typeof config[prop] === 'function') {
          log('Converting function: ' + prop);
          pattern = new RegExp(interpolation.mixin + prop + '\\s\\w+.*;', 'g');
          matchObj = output.match(pattern);
          if (!matchObj) {
            log('No match found for ' + prop);
            continue;
          }
          match = matchObj.toString();
          
          //args = ;
          args = match.replace(interpolation.mixin + prop + ' ', '')
            .trim()
            .split(',')
            .map(function (item) {
            return item.toString().trim();
          });
          
          //args = args;
          log('Mixin arguments: ' + args);
          czz = cssize(config[prop].apply(this, args));
          output = output.replace(match, czz);
        }
      }

      output = processBuiltInMixins(output);

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