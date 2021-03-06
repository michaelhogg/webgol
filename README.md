# WebGOL [![Build Status](https://travis-ci.org/michaelhogg/webgol.svg?branch=master)](https://travis-ci.org/michaelhogg/webgol)

![Screenshot](screenshot.png)

http://michaelhogg.github.io/webgol/

A [WebGL](http://en.wikipedia.org/wiki/WebGL) implementation of
[Conway's Game of Life](http://en.wikipedia.org/wiki/Conway%27s_Game_of_Life)
(GOL).


## Improvements

WebGOL was forked from
[webgl-game-of-life](https://github.com/skeeto/webgl-game-of-life),
and features the following improvements:

* Dynamically-sized canvas which fills the window (using [NPOT textures](https://www.khronos.org/webgl/wiki/WebGL_and_OpenGL_Differences#Non-Power_of_Two_Texture_Support))
* Coloured cells ([linear interpolation](http://en.wikipedia.org/wiki/Linear_interpolation) of corner colours)
* User-configurable cell size, framerate and wraparound
* Mutations (randomly-added live cells to prevent life from dying out)
* [Glow/bloom](http://en.wikipedia.org/wiki/Bloom_%28shader_effect%29) visual effect
* Control panel user interface
* Comprehensive error handling and troubleshooting
* Shader source code loaded without using [deprecated synchronous Ajax](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest#Parameters)
* [Non-dependent texture reads](http://stackoverflow.com/questions/1054096/what-is-a-dependent-texture-read) in most shaders
* [SRP](http://en.wikipedia.org/wiki/Single_responsibility_principle) object-oriented code architecture
* [SCSS](http://sass-lang.com/) stylesheet
* A few [Jasmine](http://jasmine.github.io/) tests (running on [Travis CI](https://travis-ci.org/))
* [Grunt](http://gruntjs.com/) development tasks for linting, minifying, compiling and testing


## What is Conway's Game of Life?

> LIFE is a classic computer game.  It was invented by John H. Conway
> in 1970, and has entertained many hackers and wasted many years of
> computer time ever since.  If you're smart and creative, it can be
> very intellectually stimulating.  It's a simulation game which can
> generate strange and beautiful patterns, sometimes in complex and
> interesting ways.
> ([ref](http://src.gnu-darwin.org/ports/games/lucidlife/work/lucidlife-0.9.1/doc/patterns.html))


## Why not use pure JavaScript?

Tasks such as simulating GOL or [rendering fractals](http://fract.ured.me/)
require a large number of calculations to be performed. For example, a
[1080p](http://en.wikipedia.org/wiki/1080p) GOL simulation contains
2 million cells, so an animation rate of 30 frames-per-second requires
60 million cell updates every second.

JavaScript is a [single-threaded](http://en.wikipedia.org/wiki/Single_threading)
environment, so it can only perform one calculation at a time.
[Web workers](http://en.wikipedia.org/wiki/Web_worker) can be used to
perform a few calculations in parallel, but they are
"relatively heavy-weight, and are not intended to be used in large numbers"
([spec](http://www.w3.org/TR/workers/#scope)). Therefore, a pure JavaScript
implementation of GOL would be relatively slow.


## Why use WebGL?

WebGL executes code on the
[GPU](http://en.wikipedia.org/wiki/Graphics_processing_unit),
which can perform a calculation on hundreds of data elements simultaneously.
This kind of
[hardware-accelerated](http://en.wikipedia.org/wiki/Hardware_acceleration)
[parallel computing](http://en.wikipedia.org/wiki/Parallel_computing)
is great for rendering 3D graphics, and can also benefit other tasks (such as
a GOL simulation) in which a large amount of data can be processed in parallel.

GOL can be considered to be a
[pleasingly parallel problem](http://en.wikipedia.org/wiki/Pleasingly_parallel),
in that each cell's next state can be calculated independently, and so "little or
no effort is required to separate the problem into a number of parallel tasks".

WebGOL is an example of
[GPGPU](http://en.wikipedia.org/wiki/General-purpose_computing_on_graphics_processing_units)
(general-purpose computing on GPUs). Check out
[this excellent article](https://www.tacc.utexas.edu/news/feature-stories/2010/8-things-you-should-know-about-gpgpu-technology)
for more information:

> GPGPU is a methodology for high-performance computing that uses GPUs to crunch data.
> Algorithms well-suited to GPGPU implementation are those that exhibit two properties:
>
>  * Data parallel – A processor can execute the operation on different data elements simultaneously.
>  * Throughput intensive – The algorithm is going to process lots of data elements,
>    so there will be plenty to operate on in parallel.


## Implementation

In WebGOL, the entire GOL simulation state is stored and processed as textures
in the GPU. The next state of a cell is calculated by a
[fragment shader](http://en.wikipedia.org/wiki/Shader#Pixel_shaders),
and hundreds of copies of that shader can be executed in parallel on a modern GPU,
enabling hundreds of cells to be updated simultaneously.

With the GPU responsible for all the heavy processing work, the JavaScript code
simply needs to send regular commands to the GPU to update the GOL state
and render it to the screen.

Even with a low-power GPU in a laptop (eg: Intel HD Graphics 4000),
WebGOL can run a 1080p simulation at 60 frames-per-second
(120 million cell updates every second).


## Libraries used

* [abpetkov/switchery](https://github.com/abpetkov/switchery)
* [FortAwesome/Font-Awesome](https://github.com/FortAwesome/Font-Awesome)
* [jquery/jquery](https://github.com/jquery/jquery)
* [skeeto/igloojs](https://github.com/skeeto/igloojs)


## Thanks

* A huge thank you to [skeeto](https://github.com/skeeto) for creating
  [igloojs](https://github.com/skeeto/igloojs) (a WebGL wrapper library) and
  [webgl-game-of-life](https://github.com/skeeto/webgl-game-of-life)
  (see his [blog post](http://nullprogram.com/blog/2014/06/10/)),
  which provide the foundation for WebGOL.
* Thanks also to [mikeash](https://github.com/mikeash) for creating
  [GPULife](https://github.com/mikeash/GPULife), which contains a couple
  of nice features that have been copied in WebGOL ("corner colours"
  and random cell mutations).
* And of course, thanks to
  [John Conway](http://en.wikipedia.org/wiki/John_Horton_Conway)
  for inventing his wonderful Game of Life :)


## License

WebGOL is licensed under the
[MIT License (Expat)](http://en.wikipedia.org/wiki/MIT_License).

It's a fork of
[webgl-game-of-life](https://github.com/skeeto/webgl-game-of-life),
which does not contain any license details, but the author's blog
indicates that the code is released into the public domain:

> All information on this blog, unless otherwise noted, is hereby released
> into the public domain, with no rights reserved.
> ([1](http://nullprogram.com/blog/2014/06/10/))

<i></i>

> Just like all of my code, I made [NativeGuide] public domain
> ([2](http://nullprogram.com/blog/2011/11/06/))
