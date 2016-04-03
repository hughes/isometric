({
    baseUrl: 'jsiso/',

    out: 'dist/jsiso.js',
    optimize: 'none',

    include: [
      '../config',
      'canvas/Control',
      'canvas/Input',
      'img/load',
      'json/load',
      'particles/Effect',
      'particles/EffectLoader',
      'particles/Emitter',
      'particles/Particle',
      'pathfind/pathfind',
      'pathfind/worker',
      'tile/Camera',
      'tile/Field',
      'url/url',
      'utils',
    ],
    // name: '../bower_components/almond/almond',
})