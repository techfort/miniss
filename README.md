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
