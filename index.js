const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

let users = [
  { id: 1, nombre: 'demo', email: 'demo@demo.com', password: 'demo', rol: 'admin' }
];
let patients = [];
let triages = [];
let currId = 2;

// Registro
app.post('/api/users/register', (req, res) => {
  const { nombre, email, password, rol } = req.body;
  if (users.find(u => u.email === email)) return res.status(400).json({ error: 'Email ya registrado' });
  users.push({ id: currId++, nombre, email, password, rol });
  res.json({ ok: true });
});

// Login
app.post('/api/users/login', (req, res) => {
  const { email, password } = req.body;
  const u = users.find(u => u.email === email && u.password === password);
  if (!u) return res.status(400).json({ error: 'Credenciales inválidas' });
  res.json({ token: 'demo', nombre: u.nombre, rol: u.rol, id: u.id });
});

// Pacientes
app.post('/api/patients', (req, res) => {
  const p = { id: currId++, ...req.body };
  patients.push(p);
  res.json(p);
});
app.get('/api/patients', (req, res) => res.json(patients));

// Triaje
app.post('/api/triage', (req, res) => {
  const t = { id: currId++, ...req.body, fecha_triaje: new Date().toISOString() };
  triages.push(t);
  res.json(t);
});
app.get('/api/triage', (req, res) => res.json(triages));

// Indicadores
app.get('/api/dashboard/indicators', (req, res) => {
  const totalTriages = triages.length;
  const distribucion = { rojo: 0, naranja: 0, amarillo: 0, verde: 0, azul: 0 };
  triages.forEach(t => distribucion[t.categoria_MTS]++);
  res.json({
    totalTriages,
    distribucion,
    tasaCumplimiento: totalTriages && patients.length ? (100 * totalTriages / patients.length).toFixed(2) : '0'
  });
});

// --- SERVIR FRONTEND ---
app.use(express.static('public'));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Demo backend+frontend corriendo en puerto ' + PORT));
