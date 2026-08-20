import { PRIMARY_CANVAS_FIXTURE_URL, PRIMARY_MANIFEST_FIXTURE_URL } from './constants';

// has 2 windows, one gaugin and one bodleian
export default {
  catalog: [
    {
      manifestId: 'https://files.tetras-libre.fr/dev/sun-400x400-with-svg-target.json',
    },
    { manifestId: PRIMARY_MANIFEST_FIXTURE_URL },
    {
      manifestId: 'https://iiif.harvardartmuseums.org/manifests/object/299843',
    },
    {
      manifestId: 'https://files.tetras-libre.fr/dev/Heterogeneous-media-on-several-canvases.json',
    },
    {
      manifestId: 'https://files.tetras-libre.fr/dev/youtube.json',
    },
    {
      manifestId: 'https://files.tetras-libre.fr/dev/peertube.json',
    },
    {
      manifestId: 'https://files.tetras-libre.fr/dev/milansanremo25.json',
    },
    {
      manifestId: 'https://dzkimgs.l.u-tokyo.ac.jp/videos/iiif_in_japan_2017/manifest.json',
    },
  ],
  id: 'mirador',
  theme: {
    transitions: {},
  },
  windows: [
    {
      manifestId: 'https://files.tetras-libre.fr/dev/Heterogeneous-media-on-several-canvases.json',
    },
  ],
};
