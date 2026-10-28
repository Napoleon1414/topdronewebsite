const express = require('express');
const path = require('path');
const https = require('https');
const http = require('http');
const app = express();
app.set('trust proxy', true);   // DigitalOcean pone la IP real del visitante en X-Forwarded-For

/* =====================================================================
   /api/plano — el cotizador envía imágenes de un plano y Claude devuelve
   los rumbos, distancias, coordenadas y superficie como datos.
   La clave de Anthropic vive SOLO aquí, en la variable ANTHROPIC_API_KEY.
   ===================================================================== */
const CLAVE   = process.env.ANTHROPIC_API_KEY;
const MODELO  = process.env.PLANO_MODELO || 'claude-sonnet-5-5';
const ORIGENES = (process.env.PLANO_ORIGENES || 'https://topdrone-cotizar.netlify.app')
  .split(',').map(s => s.trim()).filter(Boolean);
const POR_HORA = +(process.env.PLANO_POR_HORA || 12);    // consultas por visitante por hora
const POR_DIA  = +(process.env.PLANO_POR_DIA  || 300);   // consultas totales por día
const API_URL = new URL(process.env.ANTHROPIC_URL || 'https://api.anthropic.com/v1/messages');

// límites de uso en memoria (se reinician si el servidor se reinicia)
const visitas = new Map();
let dia = new Date().toDateString(), usoDia = 0;
function permitir(ip){
  const hoy = new Date().toDateString();
  if(hoy !== dia){ dia = hoy; usoDia = 0; visitas.clear(); }
  if(usoDia >= POR_DIA) return 'limite_diario';
  const ahora = Date.now(), lista = (visitas.get(ip) || []).filter(t => ahora - t < 3600e3);
  if(lista.length >= POR_HORA) return 'limite_visitante';
  lista.push(ahora); visitas.set(ip, lista); usoDia++;
  return null;
}

function cors(req, res, next){
  const o = req.headers.origin;
  if(o && ORIGENES.includes(o)){
    res.setHeader('Access-Control-Allow-Origin', o);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400');
  }
  if(req.method === 'OPTIONS') return res.sendStatus(o && ORIGENES.includes(o) ? 204 : 403);
  if(!o || !ORIGENES.includes(o)) return res.status(403).json({ok:false, error:'origen'});
  next();
}

const INSTRUCCIONES = `Eres un agrimensor panameño experto leyendo planos de fincas y lotes (planos catastrales, de segregación, de levantamiento topográfico, aprobados por ANATI, MIVIOT o municipios). Recibes imágenes de un plano: la hoja completa y, a veces, recortes ampliados de sus tablas.

Tu trabajo es TRANSCRIBIR los datos del lindero del lote, no calcularlos:
- Cuadro de rumbos y distancias (EST–PV, RUMBO, DISTANCIA). Los rumbos panameños son de cuadrante: N 45°30'20" E. La "O" es oeste (W). Si el plano usa azimut en vez de rumbo, ponlo en "azimut".
- Cuadro de coordenadas (punto, NORTE, ESTE). Copia cada número tal cual, sin redondear. No confundas la columna NORTE con ESTE: en Panamá, en UTM 17N, el Este suele estar entre 160 000 y 840 000 y el Norte entre 770 000 y 1 080 000.
- Superficie escrita (p. ej. "2 Has + 3,583.87 m²"): cópiala en superficie_texto y conviértela a metros cuadrados en superficie_m2 (1 ha = 10 000 m²).
- Perímetro, si está escrito.
- Sistema de coordenadas si está indicado (WGS84, NAD27, "Zona del Canal", local…).

Reglas:
- Los lados van en orden alrededor del lote, como en la tabla.
- Si un valor no se lee con seguridad, pon null en ese valor y explícalo en notas. Nunca inventes ni completes números.
- Si el plano muestra varios lotes, transcribe el lote principal (el que da título al plano o cuya superficie se destaca), marca varios_lotes y di cuál elegiste.
- En "regiones" da la caja [x1, y1, x2, y2] en píxeles de la imagen indicada (origen arriba a la izquierda) de cada tabla de rumbos, tabla de coordenadas y texto de superficie que veas, aunque la letra sea pequeña. Así podemos ampliarlas.
- Si la imagen no es un plano de un terreno, marca es_plano = false.
Responde únicamente llamando a la herramienta entregar_lectura_plano.`;

const NUM = {type: ['number', 'null']};
const HERRAMIENTA = {
  name: 'entregar_lectura_plano',
  description: 'Entrega lo transcrito del plano.',
  input_schema: {
    type: 'object',
    properties: {
      es_plano: {type: 'boolean'},
      legibilidad: {type: 'string', enum: ['buena', 'parcial', 'mala']},
      lados: {type: 'array', items: {type: 'object', properties: {
        desde: {type: ['string', 'null']}, hasta: {type: ['string', 'null']},
        ns: {type: ['string', 'null'], enum: ['N', 'S', null]},
        grados: NUM, minutos: NUM, segundos: NUM,
        eo: {type: ['string', 'null'], enum: ['E', 'O', null]},
        azimut: NUM, distancia_m: NUM
      }, required: ['ns', 'grados', 'minutos', 'segundos', 'eo', 'distancia_m']}},
      coordenadas: {type: 'array', items: {type: 'object', properties: {
        punto: {type: ['string', 'null']}, norte: NUM, este: NUM
      }, required: ['norte', 'este']}},
      sistema_coordenadas: {type: ['string', 'null']},
      superficie_texto: {type: ['string', 'null']},
      superficie_m2: NUM,
      perimetro_m: NUM,
      varios_lotes: {type: 'boolean'},
      lote_elegido: {type: ['string', 'null']},
      regiones: {type: 'array', items: {type: 'object', properties: {
        imagen: {type: 'integer', description: 'número de la imagen (1, 2, …)'},
        tipo: {type: 'string', enum: ['rumbos', 'coordenadas', 'superficie']},
        caja: {type: 'array', items: {type: 'number'}, minItems: 4, maxItems: 4}
      }, required: ['imagen', 'tipo', 'caja']}},
      notas: {type: ['string', 'null']}
    },
    required: ['es_plano', 'legibilidad', 'lados', 'coordenadas', 'superficie_m2', 'regiones']
  }
};

function llamarClaude(cuerpo){
  return new Promise((ok, mal) => {
    const datos = Buffer.from(JSON.stringify(cuerpo));
    const req = (API_URL.protocol === 'http:' ? http : https).request({
      hostname: API_URL.hostname, port: API_URL.port || undefined, path: API_URL.pathname, method: 'POST',
      headers: {'content-type': 'application/json', 'x-api-key': CLAVE, 'anthropic-version': '2023-06-01', 'content-length': datos.length}
    }, r => {
      const partes = []; r.on('data', c => partes.push(c));
      r.on('end', () => {
        let j = null; try{ j = JSON.parse(Buffer.concat(partes).toString()); }catch(e){}
        if(r.statusCode >= 200 && r.statusCode < 300 && j) ok(j);
        else mal(new Error('anthropic ' + r.statusCode + ' ' + (j && j.error ? j.error.message : '')));
      });
    });
    req.setTimeout(90000, () => req.destroy(new Error('tiempo')));
    req.on('error', mal);
    req.end(datos);
  });
}

app.options('/api/plano', cors);
app.post('/api/plano', cors, express.json({limit: '25mb'}), async (req, res) => {
  if(!CLAVE) return res.status(503).json({ok: false, error: 'sin_clave'});
  const b = req.body || {};
  const imgs = Array.isArray(b.imagenes) ? b.imagenes : [];
  if(!imgs.length || imgs.length > 8) return res.status(400).json({ok: false, error: 'imagenes'});
  for(const im of imgs){
    if(typeof im.data !== 'string' || im.data.length > 7e6 || !/^image\/(jpeg|png|webp)$/.test(im.tipo || ''))
      return res.status(400).json({ok: false, error: 'imagen_invalida'});
  }
  const bloqueo = permitir(req.ip);
  if(bloqueo) return res.status(429).json({ok: false, error: bloqueo});

  const contenido = [];
  imgs.forEach((im, i) => {
    contenido.push({type: 'text', text: `Imagen ${i + 1}: ${String(im.etiqueta || '').slice(0, 120)}`});
    contenido.push({type: 'image', source: {type: 'base64', media_type: im.tipo, data: im.data}});
  });
  contenido.push({type: 'text', text: b.etapa === 'leer'
    ? 'Estas imágenes incluyen recortes ampliados de las tablas del plano. Transcribe todos los lados, coordenadas y la superficie con el mayor cuidado.'
    : 'Esta es la hoja completa del plano. Transcribe lo que se lea con seguridad y ubica las tablas en "regiones".'});

  const t0 = Date.now();
  try{
    const r = await llamarClaude({
      model: MODELO, max_tokens: 4000, system: INSTRUCCIONES,
      tools: [HERRAMIENTA], tool_choice: {type: 'tool', name: HERRAMIENTA.name},
      messages: [{role: 'user', content: contenido}]
    });
    const uso = r.usage || {};
    console.log(`[plano] ref=${String(b.ref || '').slice(0, 20)} etapa=${b.etapa || 'ubicar'} imgs=${imgs.length} ` +
                `entrada=${uso.input_tokens} salida=${uso.output_tokens} ${Date.now() - t0}ms`);
    const t = (r.content || []).find(c => c.type === 'tool_use');
    if(!t) return res.status(502).json({ok: false, error: 'sin_lectura'});
    res.json({ok: true, datos: t.input});
  }catch(e){
    console.error('[plano] error', e.message);
    res.status(502).json({ok: false, error: 'ia'});
  }
});

// Serve the static site (index.html + assets/) from the repo root
app.use(express.static(__dirname));

// Health check (DigitalOcean uses this)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Fallback: send index.html for any unmatched path
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
