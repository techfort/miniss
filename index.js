var miniss = require('./src/miniss.js');

var style = {
  white: '#fff',
  black: '#000',
  borderRadius: function (radius) {
    return {
      'border-radius': radius,
      '-moz-border-radius': radius
    };
  },
  transition: function () {
    var args = Array.prototype.splice.call(arguments, 0);
    return {
      'transition': args.join(' ')
    };
  }
};

var jss = new miniss(style, 'style.jss', 'output.css');
jss.compile(true);