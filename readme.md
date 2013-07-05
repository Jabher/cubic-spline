# CSPL is Cubic spline evaluation library
It is based on [Ivan K](http://www.ivank.net/cs/flash) [solution](http://blog.ivank.net/interpolation-with-cubic-splines.html)
I would like to thank this guy as he did a beautiful math implementation of cubic spline, which I've used in 2 projects already.

I've made its usage simplier, so everyone could use it.
Syntax is beautiful:

    spline = new Spline({0: 1, 100: 0})
    <function () { [native code] }

    >spline(0)
    <1

    >spline(50)
    <0.5

    >spline(100)
    <0