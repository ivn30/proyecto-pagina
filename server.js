const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/OP', express.static(path.join(__dirname, 'OP')));
app.use('/JK', express.static(path.join(__dirname, 'JK')));
app.use('/HXH', express.static(path.join(__dirname, 'HXH')));
app.use('/MOB', express.static(path.join(__dirname, 'MOB')));
app.use('/VINLAND', express.static(path.join(__dirname, 'VINLAND')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pagina.html'));
});

app.get('/serie/:nombre', (req, res) => {
  const serie = req.params.nombre;
  const seriePath = path.join(__dirname, serie);

  if (!fs.existsSync(seriePath)) return res.status(404).send('Serie no encontrada');

  let autor = 'Autor desconocido';
let generos = 'Géneros no especificados';
const infoPath = path.join(seriePath, 'info.txt');

if (fs.existsSync(infoPath)) {
  const infoRaw = fs.readFileSync(infoPath, 'utf-8');
  const lines = infoRaw.split('\n');
  lines.forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      if (key.trim().toLowerCase() === 'autor') autor = value.trim();
      if (key.trim().toLowerCase() === 'generos') generos = value.trim();
    }
  });
  
}
  let sinopsis = 'Sinopsis no disponible.';
  const sinopsisPath = path.join(seriePath, 'sinopsis.txt');
  if (fs.existsSync(sinopsisPath)) {
    try {
      sinopsis = fs.readFileSync(sinopsisPath, 'utf-8');
    } catch (err) {
      console.error(`Error al leer sinopsis de ${serie}:`, err.message);
    }
  }

  let portada = '';
  const portadaPath = path.join(seriePath, 'portadas');
  if (fs.existsSync(portadaPath)) {
    const archivos = fs.readdirSync(portadaPath).filter(f => /\.(png|jpg|jpeg)$/i.test(f));
    if (archivos.length > 0) portada = `${serie}/portadas/${archivos[0]}`;
  } else {
    const archivos = fs.readdirSync(seriePath).filter(f => /\.(png|jpg|jpeg)$/i.test(f));
    if (archivos.length > 0) portada = `${serie}/${archivos[0]}`;
  }

  const capitulos = fs.readdirSync(seriePath).filter(f =>
    fs.statSync(path.join(seriePath, f)).isDirectory() && f.toLowerCase().startsWith('cap')
  ).sort();

  const capitulosHTML = capitulos.map(c => `<li><a href="/serie/${serie}/${c}">${c}</a></li>`).join('');

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${serie}</title>
<link rel="stylesheet" href="/css/style.css" />
</head>
<body>
<div class="portada-con-info">
  ${portada ? `<img class="portada" src="/${portada}" alt="Portada de ${serie}" />` : ''}
  <div class="info-manga">
    <p><strong>Autor:</strong> ${autor}</p>
    <p><strong>Géneros:</strong> ${generos}</p>
    <p>${sinopsis}</p>
  </div>
</div>

<a class="back-link" href="/">← Volver al inicio</a>

<section>
  <h2>Capítulos</h2>
  <ul class="capitulos">
    ${capitulosHTML}
  </ul>
</section>
</body>
</html>
`;

  res.send(html);
});

app.get('/serie/:nombre/:capitulo', (req, res) => {
  const serie = req.params.nombre;
  const capitulo = req.params.capitulo;
  const folderPath = path.join(__dirname, serie, capitulo);

  if (!fs.existsSync(folderPath)) return res.status(404).send('Capítulo no encontrado');

  const images = fs.readdirSync(folderPath)
  .filter(f => /\.(png|jpe?g|gif)$/i.test(f))
  .sort((a, b) => {
    const getNumber = name => parseInt(name.match(/\d+/)?.[0]) || 0;
    return getNumber(a) - getNumber(b);
  });

  const imgHTML = images.map(f => `<div class="page"><img src="/${serie}/${capitulo}/${f}" loading="lazy" /></div>`).join('\n');

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${serie} - ${capitulo}</title>
<link rel="stylesheet" href="/css/cap.css">
<script src="/js/jquery.min.js"></script>
<script src="/js/turn.min.js"></script>
</head>
<body>
<header>
<h1>${serie} - ${capitulo}</h1>
<a href="/serie/${serie}">← Volver a capítulos</a>
</header>

<div id="flipbook">
${imgHTML}
</div>

<div class="nav-buttons">
<button id="prevBtn">← Anterior</button>
<button id="nextBtn">Siguiente →</button>
</div>

<script>
$(document).ready(function() {
  $('#flipbook').turn({ width: 800, height: 500, autoCenter: true });
  $('#nextBtn').click(() => $('#flipbook').turn('next'));
  $('#prevBtn').click(() => $('#flipbook').turn('previous'));
});
</script>
</body>
</html>
`;
  res.send(html);
});

const PORT = 3000;
app.listen(PORT, () => console.log('Servidor corriendo en http://localhost:' + PORT));