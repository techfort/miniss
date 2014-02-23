miniss
======

A slim javascript/JSON to css processor. Ideal for building themes based on a common CSS.

rationale
=========

***miniss*** is a less/sass type of compiler that lets you set variables and build javascript functions that translate into valid css.
Say you want to build themes based on the same css template: you can take a standard css file and replace identical values with a variable like so:

`background : __background__` (note that you can change the `__` delimiter).

Save this file as `mystyle.jss`. In a separate file which we will call `mytheme.js` we declare a style like so:

```javascript
module.exports = {
	background: #fff
}```

Finally run `miniss mystyle.jss output.css config.js` and miniss will create the file output.css for you.

mixins
======

There are two types of mixins: user defined and builtin.
Builtin mixins can be called in your .jss file by prefixing them with `!miniss=`
User defined can be called by prefixing them with `!=`

### user-defined

Your minissfile.js should simply export a js object like so:

```javascript
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
```
Miniss knows how to handle a string value differently from a function value. Functions are user-defined mixins. In the example above we defined two mixins: one that applies a shadow to both elements and text (using the same parameters), and another one that creates a transition. To invoke them in your .jss file use the following syntax:

```
!=transition width,1s;
!=shadows 1px,1px,1px,rgba(0,0,0,0.3);
```
### Builtin mixins

For now just a couple

#### element
```
!miniss=element param1, param2, ...;
```
Creates an element and applies subsequent statments before a `;`

#### cross
```
!miniss=cross ...;
```

Takes a single css declaration and creates a cross-browser set of declaration (-moz, -o, -webkit etc.) saving on boilerplate css code.

### Customisation

From command line the following switches are available:
`-d` : debug mode, prints debug log statements

`-s s1,[s2, s3, s4]` allows to change interpolation delimiters and identifers (default for variables are `__` and `__`, user defined mixins is `!=`, and builtin is `!miniss=`)

From a .js file you can simply instantiate a miniss compiler by doing:
```javascript
var miniss = require('miniss'),
  compiler;
compiler = new miniss(in, out, config);
compiler.setDebug(true);
compiler.setInterpolation(/* variable args */);
compiler.compile();
```