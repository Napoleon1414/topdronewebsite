
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
    'index.csr.html': {size: 533, hash: 'ef24b5e77ed892c82f5cc784678956e5f67659f19015557eaada0031cd72e3c0', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1046, hash: '482625fc955340d08b40de7057f495d5d5218467a469e2a2d92a85196f01636f', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'slider/index.html': {size: 12387, hash: '9d22ecca17dc781fb4fa150d6fee0ffdad55208cee141be37857889bd797c872', text: () => import('./assets-chunks/slider_index_html.mjs').then(m => m.default)},
    'index.html': {size: 27581, hash: 'b0eedf8eb275dfbe21c54ac95ba6c20070c90676f151c50d7c213bed359ac387', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'styles-5INURTSO.css': {size: 0, hash: 'menYUTfbRu8', text: () => import('./assets-chunks/styles-5INURTSO_css.mjs').then(m => m.default)}
  },
};
