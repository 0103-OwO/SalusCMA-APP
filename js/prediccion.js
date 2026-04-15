
// ═══════════════════════════════════════════════════════════════
//  CONFIGURACIÓN
//  API_BASE debe estar definida globalmente en tu app
//  (igual que en el resto de tus páginas del frontend).
//  Si no, se usa un fallback para desarrollo local.
// ═══════════════════════════════════════════════════════════════
/* if (typeof API_BASE === 'undefined') {
  // ⚠️  CAMBIAR esta URL por la de tu entorno si no tienes API_BASE global
  var API_BASE = 'https://saluscma-api-1.onrender.com/api';
} */

// ═══════════════════════════════════════════════════════════════
//  CATÁLOGOS ESTÁTICOS (extraídos del SQL — trabajadores tabla)
// ═══════════════════════════════════════════════════════════════
const MEDICOS = [
  { id: 3,  nombre: 'Dr. Alejandro Ramírez'  },
  { id: 4,  nombre: 'Dra. Sofía Mendoza'     },
  { id: 5,  nombre: 'Dr. Fernando Leal'      },
  { id: 6,  nombre: 'Dra. Valeria Ortega'    },
  { id: 7,  nombre: 'Dr. Héctor Vargas'      },
  { id: 13, nombre: 'Dra. Silvia Santiago'   },
  { id: 14, nombre: 'Dra. Ana Maldonado'     },
  { id: 15, nombre: 'Dr. José Iván Santiago' },
];
const GRUPOS_EDAD = [
  { id: 'bebes',   label: 'Bebés (0–2 años)',    min: 0,  max: 2   },
  { id: 'ninos',   label: 'Niños (3–12 años)',    min: 3,  max: 12  },
  { id: 'jovenes', label: 'Jóvenes (13–29 años)', min: 13, max: 29  },
  { id: 'adultos', label: 'Adultos (30–59 años)',  min: 30, max: 59  },
  { id: 'mayores', label: 'Adultos mayores (60+)', min: 60, max: 999 },
];
const SEXOS = [
  { id: 'H', label: 'Hombres (H)' },
  { id: 'M', label: 'Mujeres (M)' },
];

// Instancias de Chart.js — se destruyen antes de redibujar
let chartLine = null, chartPie = null, chartBar = null;

// Datos crudos de la API (se conservan para no volver a pedir)
let historialGlobal = [];

// ═══════════════════════════════════════════════════════════════
//  HELPERS DE UI
// ═══════════════════════════════════════════════════════════════
function setBanner(tipo, msg) {
  const b = document.getElementById('statusBanner');
  const s = document.getElementById('statusMsg');
  b.className = `status-banner ${tipo}`;
  b.style.display = 'flex';
  s.textContent = msg;
  // Para loading mostramos spinner; para el resto lo ocultamos
  const spinner = b.querySelector('.spinner');
  if (spinner) spinner.style.display = tipo === 'loading' ? 'block' : 'none';
}
function hideBanner() {
  document.getElementById('statusBanner').style.display = 'none';
}

function setBoton(cargando) {
  const btn = document.getElementById('btnCalcular');
  btn.disabled = cargando;
  btn.textContent = cargando ? 'Calculando...' : 'Calcular predicción';
}

// ═══════════════════════════════════════════════════════════════
//  CARGA DE DATOS DESDE LA API
//  Mismo patrón que el resto de tu frontend:
//  - Lee token de localStorage
//  - Si 401 → redirige a login.html
//  - Si error de red → usa datos de demostración
// ═══════════════════════════════════════════════════════════════
async function cargarHistorial() {
  const token = localStorage.getItem('token');

  // Sin token → redirigir igual que el resto del sistema
  if (!token) {
    window.location.href = 'login.html';
    return null;
  }

  setBanner('loading', 'Conectando con la API...');

  try {
    const res = await fetch(`${API_BASE}/historial`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Token expirado o inválido → redirigir igual que en el resto de páginas
    if (res.status === 401) {
      window.location.href = 'login.html';
      return null;
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Error ${res.status} del servidor`);
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      throw new Error('La respuesta de la API no tiene el formato esperado');
    }

    setBanner('ok', `API conectada · ${data.length} registros cargados`);
    setTimeout(hideBanner, 3000);
    return data;

  } catch (error) {
    console.error('[Predicción] Error al consumir API:', error.message);
    setBanner('demo',
      `API no disponible (${error.message}). Mostrando datos de demostración.`
    );
    return null; // El caller usará datos de demo
  }
}

// ═══════════════════════════════════════════════════════════════
//  DATOS DE DEMOSTRACIÓN
//  Se usan solo si la API falla. Basados en el SQL real entregado.
//  NOTA: No incluyen fecha_nacimiento ni sexo reales porque esos
//  campos no están en el endpoint actual. Ver sugerencias del API.
// ═══════════════════════════════════════════════════════════════
function generarDatosDemo() {
  // Conteos reales extraídos del SQL de historial
  const meses = {
    '2025-01': 30, '2025-02': 29, '2025-03': 28, '2025-04': 30,
    '2025-05': 29, '2025-06': 30, '2025-07': 29, '2025-08': 28,
    '2025-09': 27, '2025-10': 29, '2025-11': 27, '2025-12': 27,
    '2026-01': 26, '2026-02': 26, '2026-03': 29
  };
  // Distribución realista de médicos y pacientes del SQL
  const medicosIds  = [3, 4, 5, 6, 7, 13, 14, 15];
  const edades      = [0, 1, 2, 5, 8, 15, 20, 25, 35, 45, 55, 65, 70, 75];
  const recs = [];

  for (const [mes, total] of Object.entries(meses)) {
    for (let i = 0; i < total; i++) {
      const medIdx = i % medicosIds.length;
      recs.push({
        // Campos que devuelve el endpoint real GET /historial
        fecha:          mes + '-15',
        id_medico:      medicosIds[medIdx],
        nombre_medico:  MEDICOS[medIdx].nombre,
        id_paciente:    (i % 30) + 1,
        nombre_paciente: `Paciente ${(i % 30) + 1}`,
        // Campos adicionales que se necesitan para filtros
        // (disponibles si aplicas la mejora sugerida al modelo)
        fecha_nacimiento: null,
        sexo: i % 2 === 0 ? 'H' : 'M',
        edad_calculada: edades[i % edades.length],
      });
    }
  }
  return recs;
}

// ═══════════════════════════════════════════════════════════════
//  NORMALIZACIÓN DE REGISTROS DE LA API
//  La API devuelve nombre_medico, id_medico, fecha.
//  Calcula edad a partir de fecha_nacimiento si el campo existe
//  (requiere la mejora sugerida en historialModel.js).
// ═══════════════════════════════════════════════════════════════
function normalizarRegistro(r) {
  let edad = r.edad_calculada ?? null;

  // Si la API devuelve fecha_nacimiento (campo opcional nuevo)
  if (edad === null && r.fecha_nacimiento) {
    const hoy = new Date();
    const nac = new Date(r.fecha_nacimiento);
    let e = hoy.getFullYear() - nac.getFullYear();
    const dm = hoy.getMonth() - nac.getMonth();
    if (dm < 0 || (dm === 0 && hoy.getDate() < nac.getDate())) e--;
    edad = e;
  }

  return {
    fecha:          r.fecha         || null,
    id_medico:      r.id_medico     || null,
    nombre_medico:  r.nombre_medico || 'Desconocido',
    sexo:           r.sexo          || null,   // disponible con mejora al API
    edad:           edad,
  };
}

// ═══════════════════════════════════════════════════════════════
//  FILTROS UI
// ═══════════════════════════════════════════════════════════════
function updateSecondary() {
  const tipo  = document.getElementById('filterType').value;
  const field = document.getElementById('secondaryField');
  const label = document.getElementById('secondaryLabel');
  const sel   = document.getElementById('filterValue');
  sel.innerHTML = '';

  if (tipo === 'all') { field.style.display = 'none'; return; }
  field.style.display = 'block';

  if (tipo === 'medico') {
    label.textContent = 'Médico';
    MEDICOS.forEach(m => sel.innerHTML += `<option value="${m.id}">${m.nombre}</option>`);
  } else if (tipo === 'edad') {
    label.textContent = 'Grupo de edad';
    GRUPOS_EDAD.forEach(g => sel.innerHTML += `<option value="${g.id}">${g.label}</option>`);
  } else if (tipo === 'sexo') {
    label.textContent = 'Sexo';
    SEXOS.forEach(s => sel.innerHTML += `<option value="${s.id}">${s.label}</option>`);
  }
}

function aplicarFiltro(datos) {
  const tipo  = document.getElementById('filterType').value;
  const valor = document.getElementById('filterValue').value;

  if (tipo === 'all') return datos;

  return datos.filter(r => {
    if (tipo === 'medico') {
      return String(r.id_medico) === String(valor);
    }
    if (tipo === 'sexo') {
      // Requiere campo 'sexo' en la respuesta del API (ver mejora sugerida)
      if (r.sexo === null) return true; // sin dato → no filtra
      return r.sexo === valor;
    }
    if (tipo === 'edad') {
      const grupo = GRUPOS_EDAD.find(g => g.id === valor);
      if (!grupo) return true;
      if (r.edad === null) return true; // sin dato → no filtra
      return r.edad >= grupo.min && r.edad <= grupo.max;
    }
    return true;
  });
}

function labelFiltro() {
  const tipo = document.getElementById('filterType').value;
  const val  = document.getElementById('filterValue').value;
  if (tipo === 'all')    return 'Todos los pacientes';
  if (tipo === 'medico') return MEDICOS.find(m => String(m.id) === String(val))?.nombre || val;
  if (tipo === 'edad')   return GRUPOS_EDAD.find(g => g.id === val)?.label || val;
  if (tipo === 'sexo')   return val === 'H' ? 'Hombres' : 'Mujeres';
  return val;
}

// ═══════════════════════════════════════════════════════════════
//  AGRUPACIÓN POR MES
// ═══════════════════════════════════════════════════════════════
function agruparPorMes(datos) {
  const map = {};
  datos.forEach(r => {
    if (!r.fecha) return;
    const mes = r.fecha.substring(0, 7); // 'YYYY-MM'
    map[mes] = (map[mes] || 0) + 1;
  });
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, n]) => ({ mes, n }));
}

// ═══════════════════════════════════════════════════════════════
//  MODELO DIFERENCIAL  dN/dt = kN  →  N = C·e^(kt)
//
//  C1 = penúltimo mes disponible  (t=0)
//  K  = último mes disponible     (t=1)
//  P1 = mes a predecir            (t = mesesProy + 1)
// ═══════════════════════════════════════════════════════════════
function calcularModelo(mensual) {
  const ult = mensual.slice(-2);
  if (ult.length < 2) return null;
  const N0 = ult[0].n;
  const N1 = ult[1].n;
  if (N0 === 0) return null; // evitar log(0)
  return {
    C:    N0,
    k:    Math.log(N1 / N0),
    N0,   N1,
    mes0: ult[0].mes,
    mes1: ult[1].mes,
  };
}

// Proyecta siempre 5 meses; marca el que el usuario eligió
function proyectar5(modelo, mesesElegidos) {
  const { C, k } = modelo;
  return Array.from({ length: 5 }, (_, i) => {
    const t = i + 1;
    return { t, Nt: Math.round(C * Math.exp(k * t)), esElegido: t === mesesElegidos };
  });
}

// t de P1 desde C1 (t=0): pedir 1 mes → t=2; 2 meses → t=3; 3 → t=4
function tP1(mesesProy) { return mesesProy + 1; }

function mesKey(mesStr, offset) {
  const [y, m] = mesStr.split('-').map(Number);
  return new Date(y, m - 1 + offset, 1).toISOString().substring(0, 7);
}
function nombreMes(mesStr, offset) {
  const [y, m] = mesStr.split('-').map(Number);
  return new Date(y, m - 1 + offset, 1)
    .toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
}

// ═══════════════════════════════════════════════════════════════
//  EJECUCIÓN PRINCIPAL
// ═══════════════════════════════════════════════════════════════
async function ejecutarAnalisis() {
  setBoton(true);
  document.getElementById('mainContent').innerHTML =
    '<div class="loading-main">Procesando datos...</div>';

  // Cargar desde API solo la primera vez (o si no hay datos en caché)
  if (historialGlobal.length === 0) {
    const rawData = await cargarHistorial();

    if (rawData === null) {
      // API falló → usar demostración
      historialGlobal = generarDatosDemo();
    } else {
      // Normalizar campos de cada registro
      historialGlobal = rawData.map(normalizarRegistro);
    }
  }

  // Aplicar filtro seleccionado
  const filtrado    = aplicarFiltro(historialGlobal);
  const mensual     = agruparPorMes(filtrado);
  const modelo      = calcularModelo(mensual);
  const mesesProy   = parseInt(document.getElementById('mesesProyeccion').value);
  const proy5       = modelo ? proyectar5(modelo, mesesProy) : [];
  const filtroLabel = labelFiltro();
  const ultimos6    = mensual.slice(-6);

  document.getElementById('mainContent').innerHTML =
    renderHTML(mensual, ultimos6, modelo, proy5, mesesProy, filtroLabel, historialGlobal);

  setTimeout(() => renderCharts(ultimos6, proy5, modelo, historialGlobal), 60);
  setBoton(false);
}

// ═══════════════════════════════════════════════════════════════
//  RENDER HTML DE RESULTADOS
// ═══════════════════════════════════════════════════════════════
function renderHTML(mensual, ultimos6, modelo, proy5, mesesProy, filtroLabel, rawData) {
  const totalHist  = mensual.reduce((s, m) => s + m.n, 0);
  const mesActual  = ultimos6[ultimos6.length - 1];
  const mesPrev    = ultimos6[ultimos6.length - 2];
  const varPct     = mesPrev
    ? (((mesActual?.n || 0) - mesPrev.n) / mesPrev.n * 100).toFixed(1)
    : '—';
  const resultElg  = proy5.find(p => p.esElegido);
  const tP         = tP1(mesesProy);

  // ── PASO 0: tabla de datos C1 / K / P1 ──────────────────────
  const tablaDatos = modelo ? `
  <div class="card">
    <div class="card-header"><div class="card-dot"></div>
      <div class="card-title">Paso 0 — Identificación de datos para el cálculo</div>
    </div>
    <p style="font-size:12px;color:var(--text-muted);margin-bottom:10px">
      Se identifican los datos conocidos (C1 y K) y la incógnita (P1) antes de aplicar el modelo.
      El tiempo se mide con C1 como origen t=0.
    </p>
    <div style="overflow-x:auto">
    <table>
      <thead>
        <tr><th>Símbolo</th><th>Descripción</th><th>Período</th><th>t (mes relativo)</th><th>N (citas)</th></tr>
      </thead>
      <tbody>
        <tr class="row-c1">
          <td><strong>C1</strong></td>
          <td>Datos iniciales · condición inicial (N₀)</td>
          <td>${modelo.mes0} &nbsp;<span class="tag">mes 0</span></td>
          <td>t = 0</td>
          <td>${modelo.N0}</td>
        </tr>
        <tr class="row-k">
          <td><strong>K</strong></td>
          <td>Datos de referencia · mes siguiente conocido</td>
          <td>${modelo.mes1} &nbsp;<span class="tag">mes 1</span></td>
          <td>t = 1</td>
          <td>${modelo.N1}</td>
        </tr>
        <tr class="row-p1">
          <td><strong>P1</strong></td>
          <td>Predicción solicitada · incógnita a calcular</td>
          <td>${mesKey(modelo.mes1, mesesProy)} &nbsp;<span class="badge badge-result">t = ${tP}</span></td>
          <td>t = ${tP}</td>
          <td><em style="color:var(--text-muted)">? (por calcular)</em></td>
        </tr>
      </tbody>
    </table>
    </div>
    <p style="font-size:11px;color:var(--text-muted);margin-top:8px">
      * t se cuenta desde C1 como t=0. Pedir 1 mes a futuro → P1 en t=2;
      pedir 2 meses → t=3; pedir 3 meses → t=4.
    </p>
  </div>` : '';

  // ── PASOS 1 AL 6 ────────────────────────────────────────────
  const pasos = modelo ? (() => {
    const kD  = modelo.k.toFixed(4);
    const kS  = modelo.k >= 0 ? '+' : '';
    const Np  = resultElg?.Nt ?? '—';
    return `
  <div class="card">
    <div class="card-header"><div class="card-dot"></div>
      <div class="card-title">Proceso matemático — pasos 1 al 6</div>
    </div>
    <div class="steps-grid">

      <div class="step">
        <div class="step-num">1</div>
        <div class="step-title">Separar variables</div>
        <div class="step-body">
          La ecuación diferencial dN/dt = kN expresa que el crecimiento es
          proporcional al número actual de citas.
          <div class="formula">dN = kN · dt
dN / N = k dt</div>
        </div>
      </div>

      <div class="step">
        <div class="step-num">2</div>
        <div class="step-title">Integrar</div>
        <div class="step-body">
          Se integra ambos lados de la ecuación separada:
          <div class="formula">∫ dN/N = ∫ k dt
ln N = kt + C</div>
        </div>
      </div>

      <div class="step">
        <div class="step-num">3</div>
        <div class="step-title">Despejar N</div>
        <div class="step-body">
          Se aplica la función exponencial para eliminar el logaritmo:
          <div class="formula">e^(ln N) = e^(kt + C)
N = e^(kt) · e^C
N = C · e^(kt)</div>
        </div>
      </div>

      <div class="step">
        <div class="step-num">4</div>
        <div class="step-title">Probar condición inicial</div>
        <div class="step-body">
          Con t=0 (mes C1: ${modelo.mes0}) y N = ${modelo.N0} citas:
          <div class="formula">${modelo.N0} = C · e^(k · 0)
${modelo.N0} = C · 1
<strong>C = ${modelo.C}</strong></div>
        </div>
      </div>

      <div class="step">
        <div class="step-num">5</div>
        <div class="step-title">Encontrar constante de proporcionalidad k</div>
        <div class="step-body">
          Usando el mes K (${modelo.mes1}, t=1, N=${modelo.N1}):
          <div class="formula">${modelo.N1} = ${modelo.C} · e^(k · 1)
${modelo.N1} / ${modelo.C} = e^k
ln(${modelo.N1} / ${modelo.C}) = k
<strong>k = ${kS}${kD}</strong></div>
        </div>
      </div>

      <div class="step">
        <div class="step-num">6</div>
        <div class="step-title">Solución — cálculo de P1</div>
        <div class="step-body">
          Fórmula completa del modelo. Evaluando en t=${tP}
          (${nombreMes(modelo.mes1, mesesProy)}):
          <div class="formula">N(t) = ${modelo.C} · e^(${kS}${kD} · t)
N(${tP}) = ${modelo.C} · e^(${kS}${kD} · ${tP})
<strong>P1 = ${Np} citas</strong></div>
        </div>
      </div>

    </div>
  </div>`;
  })() : '';

  // ── TABLA DE PROYECCIÓN (5 meses siempre) ───────────────────
  const tablaProyeccion = (proy5.length > 0 && modelo) ? `
  <div class="card">
    <div class="card-header"><div class="card-dot"></div>
      <div class="card-title">Tabla de proyección — 5 meses · ${filtroLabel}</div>
    </div>
    <div style="overflow-x:auto">
    <table>
      <thead>
        <tr><th>t</th><th>Mes clave</th><th>Mes proyectado</th>
            <th>Cálculo aplicado</th><th>N (citas)</th><th>Estado</th></tr>
      </thead>
      <tbody>
        ${proy5.map(p => `
        <tr class="${p.esElegido ? 'row-result' : ''}">
          <td>${p.t}</td>
          <td>${mesKey(modelo.mes1, p.t)}</td>
          <td>${nombreMes(modelo.mes1, p.t)}</td>
          <td><code>${modelo.C}·e^(${modelo.k.toFixed(4)}·${p.t})</code></td>
          <td><strong>${p.Nt}</strong></td>
          <td>${p.esElegido
            ? '<span class="badge badge-result">P1 · Resultado elegido</span>'
            : '<span class="badge badge-teal">Extendido</span>'}</td>
        </tr>`).join('')}
      </tbody>
    </table>
    </div>
    <p style="font-size:11px;color:var(--text-muted);margin-top:8px">
      Fila resaltada = P1 solicitado (${mesesProy} mes${mesesProy > 1 ? 'es' : ''} adelante · t=${tP}).
      La gráfica muestra los 5 meses con la estrella naranja en P1.
    </p>
  </div>` : '';

  // ── TABLA HISTÓRICA (últimos 6 meses) ───────────────────────
  const tablaHistorial = ultimos6.map((m, i) => {
    const prev = ultimos6[i - 1];
    const v = prev ? ((m.n - prev.n) / prev.n * 100).toFixed(1) : '—';
    const vStr = v === '—' ? '—' : (parseFloat(v) >= 0 ? '+' : '') + v + '%';
    return `<tr>
      <td>${m.mes}</td>
      <td>${m.n}</td>
      <td style="color:${v !== '—' && parseFloat(v) < 0 ? 'var(--red)' : 'var(--success)'}">${vStr}</td>
      <td><span class="tag">Histórico</span></td>
    </tr>`;
  }).join('');

  // ── CAJA DE RESULTADO PRINCIPAL ─────────────────────────────
  const resultBox = resultElg && modelo ? `
  <div class="result-box">
    <div class="res-label">Predicción P1 · ${filtroLabel} · ${nombreMes(modelo.mes1, mesesProy)}</div>
    <div class="res-num">${resultElg.Nt}</div>
    <div class="res-sub">
      citas proyectadas &nbsp;·&nbsp;
      C = ${modelo.C} &nbsp;·&nbsp;
      k = ${modelo.k >= 0 ? '+' : ''}${modelo.k.toFixed(4)} &nbsp;·&nbsp;
      t = ${tP}
    </div>
  </div>` : '';

  return `
  <div class="metrics">
    <div class="metric">
      <div class="metric-label">Total histórico</div>
      <div class="metric-value">${totalHist}</div>
      <div class="metric-sub">${filtroLabel}</div>
    </div>
    <div class="metric">
      <div class="metric-label">K · último mes (t=1)</div>
      <div class="metric-value">${mesActual?.n ?? '—'}</div>
      <div class="metric-sub">${mesActual?.mes ?? ''}</div>
    </div>
    <div class="metric">
      <div class="metric-label">Variación mensual</div>
      <div class="metric-value" style="color:${parseFloat(varPct) >= 0 ? 'var(--success)' : 'var(--red)'}">
        ${varPct !== '—' ? (parseFloat(varPct) >= 0 ? '+' : '') + varPct + '%' : '—'}
      </div>
      <div class="metric-sub">vs mes anterior</div>
    </div>
    <div class="metric">
      <div class="metric-label">P1 (t=${tP})</div>
      <div class="metric-value" style="color:var(--teal-dark)">${resultElg?.Nt ?? '—'}</div>
      <div class="metric-sub">citas proyectadas</div>
    </div>
    ${modelo ? `
    <div class="metric">
      <div class="metric-label">C1 · condición inicial</div>
      <div class="metric-value">${modelo.C}</div>
      <div class="metric-sub">${modelo.mes0}</div>
    </div>
    <div class="metric">
      <div class="metric-label">k · proporcionalidad</div>
      <div class="metric-value" style="font-size:18px">
        ${modelo.k >= 0 ? '+' : ''}${modelo.k.toFixed(4)}
      </div>
      <div class="metric-sub">constante de crecimiento</div>
    </div>` : ''}
  </div>

  ${resultBox}
  ${tablaDatos}
  ${pasos}
  ${tablaProyeccion}

  <div class="charts-grid">
    <div class="card">
      <div class="card-header"><div class="card-dot"></div>
        <div class="card-title">Histórico + proyección 5 meses — ${filtroLabel}</div>
      </div>
      <div class="legend-row">
        <span><span class="legend-dot" style="background:#0d5c4a"></span>Histórico</span>
        <span><span class="legend-dot" style="background:#1d9e75;border:1.5px dashed #1d9e75"></span>Proyectado</span>
        <span><span class="legend-dot" style="background:#d85a30;border-radius:50%"></span>P1 elegido</span>
      </div>
      <div class="chart-wrap" style="height:270px">
        <canvas id="chartLine" role="img"
          aria-label="Gráfica de línea con histórico y proyección a 5 meses, estrella en P1 elegido">
        </canvas>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-dot"></div>
        <div class="card-title">Distribución por médico — todos los datos</div>
      </div>
      <div class="chart-wrap" style="height:270px">
        <canvas id="chartPie" role="img"
          aria-label="Gráfica de pastel con distribución de citas por médico y porcentajes">
        </canvas>
      </div>
    </div>
  </div>

  <div class="charts-grid">
    <div class="card">
      <div class="card-header"><div class="card-dot"></div>
        <div class="card-title">Citas por mes — últimos 6 meses · ${filtroLabel}</div>
      </div>
      <div class="chart-wrap" style="height:220px">
        <canvas id="chartBar" role="img" aria-label="Barras de citas por mes en los últimos 6 meses">
        </canvas>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-dot"></div>
        <div class="card-title">Tabla histórica — ${filtroLabel}</div>
      </div>
      <div style="overflow-x:auto">
      <table>
        <thead><tr><th>Mes</th><th>Citas</th><th>Variación</th><th>Tipo</th></tr></thead>
        <tbody>${tablaHistorial}</tbody>
      </table>
      </div>
    </div>
  </div>`;
}

// ═══════════════════════════════════════════════════════════════
//  GRÁFICAS (Chart.js)
// ═══════════════════════════════════════════════════════════════
function renderCharts(ultimos6, proy5, modelo, rawData) {
  if (chartLine) chartLine.destroy();
  if (chartPie)  chartPie.destroy();
  if (chartBar)  chartBar.destroy();

  const labelsHist = ultimos6.map(m => m.mes);
  const dataHist   = ultimos6.map(m => m.n);
  const labelsProy = proy5.map(p =>
    mesKey(modelo?.mes1 || labelsHist[labelsHist.length - 1], p.t)
  );
  const dataProy   = proy5.map(p => p.Nt);
  const allLabels  = [...labelsHist, ...labelsProy];

  // Línea histórica (null donde hay proyección)
  const lineHist = [...dataHist, ...Array(labelsProy.length).fill(null)];
  // Línea proyectada (conecta desde el último histórico)
  const lineProy = [
    ...Array(labelsHist.length - 1).fill(null),
    dataHist[dataHist.length - 1],
    ...dataProy
  ];
  // Solo el punto P1 elegido
  const lineP1 = allLabels.map((_, i) => {
    const pi = i - labelsHist.length;
    return (pi >= 0 && proy5[pi]?.esElegido) ? dataProy[pi] : null;
  });

  // — Gráfica de línea —
  const ctxL = document.getElementById('chartLine');
  if (ctxL) {
    chartLine = new Chart(ctxL, {
      type: 'line',
      data: {
        labels: allLabels,
        datasets: [
          {
            label: 'Histórico',
            data: lineHist,
            borderColor: '#0d5c4a',
            backgroundColor: 'rgba(13,92,74,.09)',
            borderWidth: 2.5,
            pointRadius: 4,
            fill: true,
            tension: .3,
            spanGaps: false,
          },
          {
            label: 'Proyectado',
            data: lineProy,
            borderColor: '#1d9e75',
            backgroundColor: 'rgba(29,158,117,.05)',
            borderWidth: 2,
            borderDash: [6, 4],
            pointRadius: 3,
            fill: false,
            tension: .3,
            spanGaps: true,
          },
          {
            label: 'P1 elegido',
            data: lineP1,
            borderColor: '#d85a30',
            backgroundColor: '#d85a30',
            borderWidth: 0,
            pointRadius: 11,
            pointStyle: 'star',
            fill: false,
            spanGaps: false,
            order: 0,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            ticks: { autoSkip: false, maxRotation: 45, font: { size: 10 } },
            grid: { color: 'rgba(13,92,74,.07)' }
          },
          y: { beginAtZero: false, grid: { color: 'rgba(13,92,74,.07)' } }
        }
      }
    });
  }

  // — Gráfica de pastel por médico —
  const ctxP = document.getElementById('chartPie');
  if (ctxP) {
    const medMap = {};
    rawData.forEach(r => {
      const n = r.nombre_medico || 'Desconocido';
      medMap[n] = (medMap[n] || 0) + 1;
    });
    const pl    = Object.keys(medMap);
    const pd    = Object.values(medMap);
    const total = pd.reduce((a, b) => a + b, 0);
    const cols  = ['#0d5c4a','#1d9e75','#d85a30','#7f77dd','#ba7517','#a32d2d','#378add','#639922'];

    chartPie = new Chart(ctxP, {
      type: 'pie',
      data: {
        labels: pl.map((l, i) =>
          `${l.substring(0, 20)} (${((pd[i] / total) * 100).toFixed(1)}%)`
        ),
        datasets: [{
          data: pd,
          backgroundColor: cols.slice(0, pl.length),
          borderWidth: 2,
          borderColor: '#fff',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { font: { size: 11 }, boxWidth: 12, padding: 10 }
          }
        }
      }
    });
  }

  // — Gráfica de barras (últimos 6 meses) —
  const ctxB = document.getElementById('chartBar');
  if (ctxB) {
    chartBar = new Chart(ctxB, {
      type: 'bar',
      data: {
        labels: labelsHist,
        datasets: [{
          label: 'Citas',
          data: dataHist,
          backgroundColor: 'rgba(13,92,74,.75)',
          borderRadius: 4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            ticks: { autoSkip: false, maxRotation: 45, font: { size: 10 } },
            grid: { display: false }
          },
          y: { beginAtZero: false, grid: { color: 'rgba(13,92,74,.07)' } }
        }
      }
    });
  }
}

// ═══════════════════════════════════════════════════════════════
//  INICIO
// ═══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  updateSecondary();
  ejecutarAnalisis();
});
