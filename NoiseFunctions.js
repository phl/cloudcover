var SimplexNoise = function(r) {
  if (r == undefined) r = Math;
  var grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0], 
                                 [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1], 
                                 [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]]; 
  var p = [];
  for (var i=0; i<256; i++) {
	  p[i] = Math.floor(r.random()*256);
  }
  // To remove the need for index wrapping, double the permutation table length 
  var perm = []; 
  for(var i=0; i<512; i++) {
		perm[i]=p[i & 255];
	} 

  // A lookup table to traverse the simplex around a given point in 4D. 
  // Details can be found where this table is used, in the 4D noise method. 
  var simplex = [ 
    [0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0], 
    [0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0], 
    [0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0], 
    [1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0], 
    [1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0], 
    [0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0], 
    [2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0], 
    [2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]]; 

  var dot = function(g, x, y) { 
	return g[0]*x + g[1]*y;
  }

  // 3D simplex noise 
  this.noise = function(xin, yin, zin) { 
    var n0, n1, n2, n3; // Noise contributions from the four corners 
    // Skew the input space to determine which simplex cell we're in 
    var F3 = 1.0/3.0; 
    var s = (xin+yin+zin)*F3; // Very nice and simple skew factor for 3D 
    var i = Math.floor(xin+s); 
    var j = Math.floor(yin+s); 
    var k = Math.floor(zin+s); 
    var G3 = 1.0/6.0; // Very nice and simple unskew factor, too 
    var t = (i+j+k)*G3; 
    var X0 = i-t; // Unskew the cell origin back to (x,y,z) space 
    var Y0 = j-t; 
    var Z0 = k-t; 
    var x0 = xin-X0; // The x,y,z distances from the cell origin 
    var y0 = yin-Y0; 
    var z0 = zin-Z0; 
    // For the 3D case, the simplex shape is a slightly irregular tetrahedron. 
    // Determine which simplex we are in. 
    var i1, j1, k1; // Offsets for second corner of simplex in (i,j,k) coords 
    var i2, j2, k2; // Offsets for third corner of simplex in (i,j,k) coords 
    if(x0>=y0) { 
      if(y0>=z0) 
        { i1=1; j1=0; k1=0; i2=1; j2=1; k2=0; } // X Y Z order 
        else if(x0>=z0) { i1=1; j1=0; k1=0; i2=1; j2=0; k2=1; } // X Z Y order 
        else { i1=0; j1=0; k1=1; i2=1; j2=0; k2=1; } // Z X Y order 
      } 
    else { // x0<y0 
      if(y0<z0) { i1=0; j1=0; k1=1; i2=0; j2=1; k2=1; } // Z Y X order 
      else if(x0<z0) { i1=0; j1=1; k1=0; i2=0; j2=1; k2=1; } // Y Z X order 
      else { i1=0; j1=1; k1=0; i2=1; j2=1; k2=0; } // Y X Z order 
    } 
    // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z), 
    // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and 
    // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where 
    // c = 1/6.
    var x1 = x0 - i1 + G3; // Offsets for second corner in (x,y,z) coords 
    var y1 = y0 - j1 + G3; 
    var z1 = z0 - k1 + G3; 
    var x2 = x0 - i2 + 2.0*G3; // Offsets for third corner in (x,y,z) coords 
    var y2 = y0 - j2 + 2.0*G3; 
    var z2 = z0 - k2 + 2.0*G3; 
    var x3 = x0 - 1.0 + 3.0*G3; // Offsets for last corner in (x,y,z) coords 
    var y3 = y0 - 1.0 + 3.0*G3; 
    var z3 = z0 - 1.0 + 3.0*G3; 
    // Work out the hashed gradient indices of the four simplex corners 
    var ii = i & 255; 
    var jj = j & 255; 
    var kk = k & 255; 
    var gi0 = perm[ii+perm[jj+perm[kk]]] % 12; 
    var gi1 = perm[ii+i1+perm[jj+j1+perm[kk+k1]]] % 12; 
    var gi2 = perm[ii+i2+perm[jj+j2+perm[kk+k2]]] % 12; 
    var gi3 = perm[ii+1+perm[jj+1+perm[kk+1]]] % 12; 
    // Calculate the contribution from the four corners 
    var t0 = 0.6 - x0*x0 - y0*y0 - z0*z0; 
    if(t0<0) n0 = 0.0; 
    else { 
      t0 *= t0; 
      n0 = t0 * t0 * dot(grad3[gi0], x0, y0, z0); 
    }
    var t1 = 0.6 - x1*x1 - y1*y1 - z1*z1; 
    if(t1<0) n1 = 0.0; 
    else { 
      t1 *= t1; 
      n1 = t1 * t1 * dot(grad3[gi1], x1, y1, z1); 
    } 
    var t2 = 0.6 - x2*x2 - y2*y2 - z2*z2; 
    if(t2<0) n2 = 0.0; 
    else { 
      t2 *= t2; 
      n2 = t2 * t2 * dot(grad3[gi2], x2, y2, z2); 
    } 
    var t3 = 0.6 - x3*x3 - y3*y3 - z3*z3; 
    if(t3<0) n3 = 0.0; 
    else { 
      t3 *= t3; 
      n3 = t3 * t3 * dot(grad3[gi3], x3, y3, z3); 
    } 
    // Add contributions from each corner to get the final noise value. 
    // The result is scaled to stay just inside [-1,1] 
    return 32.0*(n0 + n1 + n2 + n3);
  };
};
    

var PerlinNoise = function() {

    this.noise = function (x,y,z) {
        if (x == undefined) x=0; if (y == undefined) y=0; if (z == undefined) z=0;

        var X = Math.floor(x) & 255,
            Y = Math.floor(y) & 255,
            Z = Math.floor(z) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);

        var u = fade(x),
            v = fade(y),
            w = fade(z);

        var A = p[X  ]+Y, AA = p[A]+Z, AB = p[A+1]+Z,
            B = p[X+1]+Y, BA = p[B]+Z, BB = p[B+1]+Z;

        return lerp(w, lerp(v, lerp(u, grad(p[AA  ], x  , y  , z   ),
                                       grad(p[BA  ], x-1, y  , z   )),
                               lerp(u, grad(p[AB  ], x  , y-1, z   ),
                                       grad(p[BB  ], x-1, y-1, z   ))),
                       lerp(v, lerp(u, grad(p[AA+1], x  , y  , z-1 ),
                                       grad(p[BA+1], x-1, y  , z-1 )),
                               lerp(u, grad(p[AB+1], x  , y-1, z-1 ),
                                       grad(p[BB+1], x-1, y-1, z-1 ))));
    }
    var fade = function(t) { return t * t * t * (t* (t*6 -15) + 10); }
    var lerp = function (t,a,b) { return a + t * (b - a); }
    var grad = this.grad = function(hash, x, y, z) {
        var h = hash & 15;
        var u = h<8 ? x : y,
            v = h<4 ? y : h==12||h==14 ? x : z;
        return ((h&1) == 0 ? u : -u) + ((h&2) == 0 ? v : -v);
    }
    
    p = [], permutation = [ 151,160,137,91,90,15,
    131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
    190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
    88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
    77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
    102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
    135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
    5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
    223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
    129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
    251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
    49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
    138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180
    ];
    for (var i=0 ; i<256 ; i++) p[256+i] = p[i] = permutation[i];
};

var FastNoise = function() {

    var rawNoise = function(x,y,z) {
        var n = (x<<11 ^ x) + (y<<7 ^ y) + (z<<13 ^ z);
        n = ((n<<13) ^ n) >>> 0;
        return ( 1.0 - ( ((n * ((n * n * 15731 + 789221)>>>0) + 1376312589)) & 0x7fffffff) / 1073741824.0);    
    }

    this.noise = function(x, y, z) {
        
        // 2 2 2
        // 2 8 2
        // 2 2 2
        
        var corners = rawNoise(x-1, y-1, z) + rawNoise(x+1, y-1, z) + rawNoise(x-1, y+1, z) + rawNoise(x+1, y+1, z);
        var sides   = rawNoise(x-1, y, z)  + rawNoise(x+1, y, z)  + rawNoise(x, y-1, z)  + rawNoise(x, y+1, z);
        var center  = rawNoise(x, y, z)*2;

        return (corners/2 + sides/2 + center)/6;
    }
};
