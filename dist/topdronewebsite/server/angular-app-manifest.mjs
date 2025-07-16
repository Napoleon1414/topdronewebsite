
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/"
  },
  {
    "renderMode": 2,
    "route": "/slider"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 533, hash: '40b717715541ee54038ad6109f0109b40d5a13c983366a9069f5d2f61787f4c8', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1046, hash: '440578d8366d563eff627235fd1f7d26475f33261a75016d69b6418646d87323', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'slider/index.html': {size: 11850, hash: 'b206b2288545cac3519a16a2b9ed81d3722b72a9670113e0b1a7ae029932f0c9', text: () => import('./assets-chunks/slider_index_html.mjs').then(m => m.default)},
    'index.html': {size: 27581, hash: '0101b5105df91d777f47447442279df2e3e6de38e557435c15b4444bcba152f8', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'styles-5INURTSO.css': {size: 0, hash: 'menYUTfbRu8', text: () => import('./assets-chunks/styles-5INURTSO_css.mjs').then(m => m.default)}
  },
};
