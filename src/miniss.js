var fs = require('fs');

function miniss(config, css, out) {

  var self = this,
    debug = false,
    interpolation = {
      start: '__',
      end: '__',
      mixin: '@@'
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
    var output = '\n',
      prop;
    for (prop in json) {
      output += prop + ': ' + json[prop] + '\n';
    }
    log('Output:');
    log(output);
    log('Mixin completed');
    return output;
  }

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