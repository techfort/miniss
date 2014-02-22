jss
======

A slim javascript/JSON to css processor. Ideal for building based on a common CSS.

rationale
=========

***jss*** is less/sass type of compiler that let's you set variables and build javascript functions that translate into valid css.
Say you want to build themes based on the same css template.
You can take your standard css and replace identical values with a variable like so

`background : __background__` (note that you can change the `__` delimiter).

Save this file as `mystyle.jss`. In a separate file which we will call `mytheme.js` we declare a style like so:

```javascript
module.exports = {
	background: #fff
}```

Finally run `jss mystyle.jss output.css config.js` and jss will create the file output.css for you.

mixins
======

There are two types of mixins: user defined and builtin.
Builtin mixins can be called in your .jss file by prefixing them with `!jss=`
User defined can be called by prefixing them with `!=`
