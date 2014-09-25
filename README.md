cloudcover
==========

Abandoned attempt to render some nice Perlin noise clouds. Maybe one to revive using WebGL.

Much too slow, because a Photoshop-style 'screen' blend isn't supported by context2d. Context-blender.js emulates it,
but calculating every pixel in Javascript is very expensive. Also it needs a perspective transform to make the clouds
recede into the distance.
