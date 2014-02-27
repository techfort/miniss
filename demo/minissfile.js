module.exports = {
  white: '#fff',
  black: '#000',
  shadows: function (radius) {
    return {
      'box-shadow': radius,
      'text-shadow': radius
    };
  },
  transition: function () {
    var args = Array.prototype.splice.call(arguments, 0);
    return {
      'transition': args.join(' ')
    };
  }
};