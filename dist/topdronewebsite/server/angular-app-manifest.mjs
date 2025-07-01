
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 527, hash: 'e43a81090de1ecd110b6449b23ac226d3ecd00edc78b824928e3be29b6cb993d', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1040, hash: '350ae9b62834c75fe59dabc7b938dd68cdbc37446766bc44def451bec898f285', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 16000, hash: 'a0b9d6de629d38eaed3d7cef495f470adf388a5c2fd0c459836c0e65ce30c4a1', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'styles-5INURTSO.css': {size: 0, hash: 'menYUTfbRu8', text: () => import('./assets-chunks/styles-5INURTSO_css.mjs').then(m => m.default)}
  },
};
