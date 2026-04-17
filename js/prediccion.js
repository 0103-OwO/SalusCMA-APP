// ═══════════════════════════════════════════════════════════════
//  CONFIGURACIÓN
//  API_BASE debe estar definida globalmente en tu app
//  (igual que en el resto de tus páginas del frontend).
// ═══════════════════════════════════════════════════════════════
/* if (typeof API_BASE === 'undefined') {
  var API_BASE = 'https://saluscma-api-1.onrender.com/api';
} */

// ═══════════════════════════════════════════════════════════════
//  CATÁLOGOS ESTÁTICOS (extraídos del SQL — tabla trabajadores)
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

// ═══════════════════════════════════════════════════════════════
//  PALETA DE COLORES COMPARTIDA
//  Se usa en la gráfica de pastel para todos los modos de filtro.
//  Definida aquí para no repetirla en cada función.
// ═══════════════════════════════════════════════════════════════
const COLORES_PIE = [
  '#0d5c4a', '#1d9e75', '#d85a30', '#7f77dd',
  '#ba7517', '#a32d2d', '#378add', '#639922',
  '#e05c9a', '#5c8ade', '#de9a1f', '#3dbfa8',
];

// Instancias de Chart.js activas — se destruyen antes de redibujar
// para liberar memoria y evitar canvas duplicados.
let chartLine = null, chartPie = null, chartBar = null;

// Cache de los datos normalizados de la API.
// Se cargan una sola vez y se reutilizan al cambiar filtros.
let historialGlobal = [];

// ═══════════════════════════════════════════════════════════════
//  HELPERS DE UI
// ═══════════════════════════════════════════════════════════════

// Muestra el banner de estado (cargando / ok / demo / error)
// y controla si el spinner es visible o no.
function setBanner(tipo, msg) {
  const b       = document.getElementById('statusBanner');
  const s       = document.getElementById('statusMsg');
  b.className   = `status-banner ${tipo}`;
  b.style.display = 'flex';
  s.textContent = msg;
  const spinner = b.querySelector('.spinner');
  if (spinner) spinner.style.display = tipo === 'loading' ? 'block' : 'none';
}

function hideBanner() {
  document.getElementById('statusBanner').style.display = 'none';
}

// Bloquea el botón mientras se procesa para evitar doble envío.
function setBoton(cargando) {
  const btn     = document.getElementById('btnCalcular');
  btn.disabled  = cargando;
  btn.textContent = cargando ? 'Calculando...' : 'Calcular predicción';
}

// ═══════════════════════════════════════════════════════════════
//  CARGA DE DATOS DESDE LA API
//  Mismo patrón que el resto del frontend de SalusCMA:
//  - Lee el token de localStorage
//  - 401 → redirige a login.html
//  - Error de red → devuelve null (el llamador usa datos de demo)
// ═══════════════════════════════════════════════════════════════
async function cargarHistorial() {
  const token = localStorage.getItem('token');

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
        'Content-Type': 'application/json',
      },
    });

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
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
//  DATOS DE DEMOSTRACIÓN
//  Solo se usan si la API falla. Reflejan el SQL entregado.
// ═══════════════════════════════════════════════════════════════
function generarDatosDemo() {
  const meses = {
    '2025-01': 30, '2025-02': 29, '2025-03': 28, '2025-04': 30,
    '2025-05': 29, '2025-06': 30, '2025-07': 29, '2025-08': 28,
    '2025-09': 27, '2025-10': 29, '2025-11': 27, '2025-12': 27,
    '2026-01': 26, '2026-02': 26, '2026-03': 29,
  };
  const medicosIds = [3, 4, 5, 6, 7, 13, 14, 15];
  const edades     = [0, 1, 2, 5, 8, 15, 20, 25, 35, 45, 55, 65, 70, 75];
  const recs = [];

  for (const [mes, total] of Object.entries(meses)) {
    for (let i = 0; i < total; i++) {
      const medIdx = i % medicosIds.length;
      recs.push({
        fecha:            mes + '-15',
        id_medico:        medicosIds[medIdx],
        nombre_medico:    MEDICOS[medIdx].nombre,
        id_paciente:      (i % 30) + 1,
        nombre_paciente:  `Paciente ${(i % 30) + 1}`,
        fecha_nacimiento: null,
        sexo:             i % 2 === 0 ? 'H' : 'M',
        edad_calculada:   edades[i % edades.length],
      });
    }
  }
  return recs;
}

// ═══════════════════════════════════════════════════════════════
//  NORMALIZACIÓN DE REGISTROS DE LA API
//  Unifica los nombres de campos que vienen del endpoint real.
//  Calcula la edad a partir de fecha_nacimiento si está presente
//  (disponible tras aplicar la mejora sugerida en historialModel.js).
// ═══════════════════════════════════════════════════════════════
function normalizarRegistro(r) {
  let edad = r.edad_calculada ?? null;

  // Calcula edad si la API devuelve fecha_nacimiento
  if (edad === null && r.fecha_nacimiento) {
    const hoy = new Date();
    const nac = new Date(r.fecha_nacimiento);
    let e     = hoy.getFullYear() - nac.getFullYear();
    const dm  = hoy.getMonth() - nac.getMonth();
    if (dm < 0 || (dm === 0 && hoy.getDate() < nac.getDate())) e--;
    edad = e;
  }

  return {
    fecha:         r.fecha          || null,
    id_medico:     r.id_medico      || null,
    nombre_medico: r.nombre_medico  || 'Desconocido',
    sexo:          r.sexo           || null,
    edad:          edad,
    mes:           r.fecha ? r.fecha.substring(0, 7) : null, // 'YYYY-MM' precalculado
  };
}

// ═══════════════════════════════════════════════════════════════
//  FILTROS UI
// ═══════════════════════════════════════════════════════════════

// Muestra u oculta el select secundario según el tipo de filtro elegido.
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
    MEDICOS.forEach(m =>
      sel.innerHTML += `<option value="${m.id}">${m.nombre}</option>`
    );
  } else if (tipo === 'edad') {
    label.textContent = 'Grupo de edad';
    GRUPOS_EDAD.forEach(g =>
      sel.innerHTML += `<option value="${g.id}">${g.label}</option>`
    );
  } else if (tipo === 'sexo') {
    label.textContent = 'Sexo';
    SEXOS.forEach(s =>
      sel.innerHTML += `<option value="${s.id}">${s.label}</option>`
    );
  }
}

// Filtra el array global según lo elegido en los controles del formulario.
function aplicarFiltro(datos) {
  const tipo  = document.getElementById('filterType').value;
  const valor = document.getElementById('filterValue').value;

  if (tipo === 'all') return datos;

  return datos.filter(r => {
    if (tipo === 'medico') {
      return String(r.id_medico) === String(valor);
    }
    if (tipo === 'sexo') {
      if (r.sexo === null) return true; // sin dato → no excluye
      return r.sexo === valor;
    }
    if (tipo === 'edad') {
      const grupo = GRUPOS_EDAD.find(g => g.id === valor);
      if (!grupo)          return true;
      if (r.edad === null) return true;
      return r.edad >= grupo.min && r.edad <= grupo.max;
    }
    return true;
  });
}

// Devuelve una etiqueta legible del filtro activo para mostrar en títulos.
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
//  Convierte el array plano de registros en un array de
//  { mes: 'YYYY-MM', n: <conteo> } ordenado cronológicamente.
// ═══════════════════════════════════════════════════════════════
function agruparPorMes(datos) {
  const map = {};
  datos.forEach(r => {
    if (!r.fecha) return;
    const mes  = r.fecha.substring(0, 7);
    map[mes]   = (map[mes] || 0) + 1;
  });
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, n]) => ({ mes, n }));
}

// ═══════════════════════════════════════════════════════════════
//  MODELO DIFERENCIAL  dN/dt = kN  →  N = C·e^(kt)
//
//  Escala de tiempo del modelo:
//    C1 = penúltimo mes conocido  →  t = 0  (condición inicial)
//    K  = último mes conocido     →  t = 1  (punto de referencia)
//    P1 = mes a predecir          →  t = mesesProy + 1
//
//  BUG CORREGIDO:
//  Antes, proyectar5() generaba t = 1..5 y marcaba esElegido cuando
//  t === mesesElegidos (ej. mesesElegidos=1 → t=1).
//  Pero t=1 corresponde al mes K (ya conocido), así que el resultado
//  era siempre N1 (el mismo valor del último mes histórico).
//
//  CORRECCIÓN:
//  La proyección empieza en t = 2 (un mes después de K) y llega
//  hasta t = 6 (5 meses proyectados). El mes elegido es
//  t = mesesProy + 1 (porque C1=t0, K=t1, primer mes nuevo = t2).
// ═══════════════════════════════════════════════════════════════
function calcularModelo(mensual) {
  const ult = mensual.slice(-2);
  if (ult.length < 2) return null;

  const N0 = ult[0].n;  // citas en C1 (mes 0)
  const N1 = ult[1].n;  // citas en K  (mes 1)

  if (N0 === 0) return null; // log(0) es indefinido

  // k se obtiene de: N1 = N0·e^(k·1)  →  k = ln(N1/N0)
  const k = Math.log(N1 / N0);

  return {
    C:    N0,          // constante C de la solución general (= N0)
    k,                 // constante de proporcionalidad
    N0,
    N1,
    mes0: ult[0].mes,  // período de C1
    mes1: ult[1].mes,  // período de K
  };
}

// ─────────────────────────────────────────────────────────────
//  proyectar5(modelo, mesesElegidos)
//
//  Genera SIEMPRE 5 puntos proyectados (t = 2 … 6 desde C1)
//  que equivalen a 1…5 meses más allá de K.
//
//  Parámetros:
//    modelo        — objeto con C, k, mes1, etc.
//    mesesElegidos — número de meses adelante que quiere el usuario (1, 2 o 3)
//
//  Cada entrada del resultado:
//    tAbsoluto — t contado desde C1 (2 = primer mes futuro)
//    tRelativo — meses a partir de K (1 = primer mes futuro)
//    Nt        — citas proyectadas para ese punto
//    esElegido — true solo para el mes que eligió el usuario
//
//  La fórmula es N(t) = C · e^(k · tAbsoluto)
//  donde tAbsoluto = tRelativo + 1  (porque K ya ocupa t=1)
// ─────────────────────────────────────────────────────────────
function proyectar5(modelo, mesesElegidos) {
  const { C, k } = modelo;

  return Array.from({ length: 5 }, (_, i) => {
    // tRelativo: cuántos meses después de K estamos (1, 2, 3, 4, 5)
    const tRelativo = i + 1;

    // tAbsoluto: posición real en la escala del modelo (C1=0, K=1, futuro=2+)
    const tAbsoluto = tRelativo + 1;

    // Aplicar la fórmula N = C · e^(k · tAbsoluto)
    const Nt = Math.round(C * Math.exp(k * tAbsoluto));

    // El mes elegido es el que el usuario seleccionó en el selector
    const esElegido = tRelativo === mesesElegidos;

    return { tRelativo, tAbsoluto, Nt, esElegido };
  });
}

// Devuelve el tAbsoluto de P1 (se usa para mostrar t=? en los pasos y la tabla).
// Con 1 mes → t=2; con 2 meses → t=3; con 3 meses → t=4.
function tP1(mesesProy) { return mesesProy + 1; }

// ─────────────────────────────────────────────────────────────
//  Helpers de fechas
//  mesKey  → 'YYYY-MM' del mes (mesStr + offset meses)
//  nombreMes → texto legible 'junio 2026'
// ─────────────────────────────────────────────────────────────
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
//  Orquesta: carga de datos → filtrado → modelo → render HTML → gráficas.
//  Los datos se cachean en historialGlobal para no repetir la petición
//  al API cada vez que el usuario cambia un filtro.
// ═══════════════════════════════════════════════════════════════
async function ejecutarAnalisis() {
  setBoton(true);
  document.getElementById('mainContent').innerHTML =
    '<div class="loading-main">Procesando datos...</div>';

  // Carga desde la API solo si el caché está vacío
  if (historialGlobal.length === 0) {
    const rawData = await cargarHistorial();

    if (rawData === null) {
      // API no disponible → usar datos de demostración
      historialGlobal = generarDatosDemo();
    } else {
      // Normalizar para unificar nombres de campos
      historialGlobal = rawData.map(normalizarRegistro);
    }
  }

  // Derivar todos los datos necesarios para el render
  const tipoFiltro  = document.getElementById('filterType').value;
  const filtrado    = aplicarFiltro(historialGlobal);
  const mensual     = agruparPorMes(filtrado);
  const modelo      = calcularModelo(mensual);
  const mesesProy   = parseInt(document.getElementById('mesesProyeccion').value, 10);
  const proy5       = modelo ? proyectar5(modelo, mesesProy) : [];
  const filtroLabel = labelFiltro();
  const ultimos6    = mensual.slice(-6);

  // Pintar el HTML de resultados (métricas, pasos, tablas, etc.)
  document.getElementById('mainContent').innerHTML =
    renderHTML(mensual, ultimos6, modelo, proy5, mesesProy, filtroLabel, historialGlobal, filtrado, tipoFiltro);

  // Pequeño delay para que el DOM termine de pintar antes de instanciar Chart.js
  setTimeout(() =>
    renderCharts(ultimos6, proy5, modelo, historialGlobal, filtrado, tipoFiltro),
    60
  );

  setBoton(false);
}

// ═══════════════════════════════════════════════════════════════
//  RENDER HTML DE RESULTADOS
//  Construye todo el HTML dinámico: métricas, paso 0, pasos 1-6,
//  tabla de proyección, tabla histórica y contenedores de gráficas.
//
//  Parámetros nuevos respecto a la versión anterior:
//    filtrado   — registros ya filtrados (para el título del pastel)
//    tipoFiltro — 'all' | 'medico' | 'edad' | 'sexo'
// ═══════════════════════════════════════════════════════════════
function renderHTML(mensual, ultimos6, modelo, proy5, mesesProy, filtroLabel, rawData, filtrado, tipoFiltro) {
  const totalHist = mensual.reduce((s, m) => s + m.n, 0);
  const mesActual = ultimos6[ultimos6.length - 1];
  const mesPrev   = ultimos6[ultimos6.length - 2];
  const varPct    = mesPrev
    ? (((mesActual?.n || 0) - mesPrev.n) / mesPrev.n * 100).toFixed(1)
    : '—';
  const resultElg = proy5.find(p => p.esElegido);
  const tP        = tP1(mesesProy);

  // Título dinámico del pastel según el tipo de filtro activo
  const pieTitle = {
    all:    'Participación por mes en el historial total',
    medico: 'Distribución de citas por médico',
    edad:   'Distribución por grupo de edad',
    sexo:   'Distribución por sexo',
  }[tipoFiltro] || 'Distribución';

  // ── PASO 0: tabla C1 / K / P1 ───────────────────────────────
  /* const tablaDatos = modelo ? `
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
        <tr>
          <th>Símbolo</th><th>Descripción</th>
          <th>Período</th><th>t (mes relativo)</th><th>N (citas)</th>
        </tr>
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
    const kD = modelo.k.toFixed(4);
    const kS = modelo.k >= 0 ? '+' : '';
    const Np = resultElg?.Nt ?? '—';
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
          Fórmula completa. Evaluando en t=${tP} (${nombreMes(modelo.mes1, mesesProy)}):
          <div class="formula">N(t) = ${modelo.C} · e^(${kS}${kD} · t)
N(${tP}) = ${modelo.C} · e^(${kS}${kD} · ${tP})
<strong>P1 = ${Np} citas</strong></div>
        </div>
      </div>

    </div>
  </div>`;
  })() : ''; */

  // ── TABLA DE PROYECCIÓN (5 meses) ───────────────────────────
  // Ahora usa tRelativo para el label de "meses después de K"
  // y tAbsoluto para mostrar la posición real en la escala del modelo.
  const tablaProyeccion = (proy5.length > 0 && modelo) ? `
  <div class="card">
    <div class="card-header"><div class="card-dot"></div>
      <div class="card-title">Tabla de proyección — 5 meses · ${filtroLabel}</div>
    </div>
    <div style="overflow-x:auto">
    <table>
      <thead>
        <tr>
          <th>t (modelo)</th><th>Mes clave</th><th>Mes proyectado</th>
          <th>Cálculo aplicado</th><th>N (citas)</th><th>Estado</th>
        </tr>
      </thead>
      <tbody>
        ${proy5.map(p => `
        <tr class="${p.esElegido ? 'row-result' : ''}">
          <td>${p.tAbsoluto}</td>
          <td>${mesKey(modelo.mes1, p.tRelativo)}</td>
          <td>${nombreMes(modelo.mes1, p.tRelativo)}</td>
          <td><code>${modelo.C}·e^(${modelo.k.toFixed(4)}·${p.tAbsoluto})</code></td>
          <td><strong>${p.Nt}</strong></td>
          <td>${p.esElegido
            ? '<span class="badge badge-result">P1 · Resultado elegido</span>'
            : '<span class="badge badge-teal">Extendido</span>'
          }</td>
        </tr>`).join('')}
      </tbody>
    </table>
    </div>
    <p style="font-size:11px;color:var(--text-muted);margin-top:8px">
      Fila resaltada = P1 solicitado (${mesesProy} mes${mesesProy > 1 ? 'es' : ''} después de K · t=${tP}).
      La gráfica muestra los 5 meses con línea naranja en P1.
    </p>
  </div>` : '';

  // ── TABLA HISTÓRICA (últimos 6 meses) ───────────────────────
  const tablaHistorial = ultimos6.map((m, i) => {
    const prev = ultimos6[i - 1];
    const v    = prev ? ((m.n - prev.n) / prev.n * 100).toFixed(1) : '—';
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
    
  </div>

  ${resultBox}
  
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
          aria-label="Gráfica de línea con histórico y proyección a 5 meses, línea naranja en P1">
        </canvas>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-dot"></div>
        <div class="card-title">${pieTitle}</div>
      </div>
      <div class="chart-wrap" style="height:270px">
        <canvas id="chartPie" role="img"
          aria-label="Gráfica de pastel: ${pieTitle}">
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
//  HELPERS PARA EL PASTEL
//  Cada función recibe los datos YA filtrados del historial
//  y devuelve { labels, data } listos para Chart.js.
// ═══════════════════════════════════════════════════════════════

// Sin filtro: agrupa por mes y muestra el % de cada mes sobre el total.
function pieDataPorMes(rawData) {
  const map = {};
  rawData.forEach(r => {
    const mes = r.fecha ? r.fecha.substring(0, 7) : 'Sin fecha';
    map[mes]  = (map[mes] || 0) + 1;
  });
  const entries = Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  const total   = entries.reduce((s, [, v]) => s + v, 0);
  return {
    labels: entries.map(([mes, n]) => `${mes} (${((n / total) * 100).toFixed(1)}%)`),
    data:   entries.map(([, n]) => n),
  };
}

// Por médico: igual que antes, usa nombre_medico del registro.
function pieDataPorMedico(rawData) {
  const map = {};
  rawData.forEach(r => {
    const n = r.nombre_medico || 'Desconocido';
    map[n]  = (map[n] || 0) + 1;
  });
  const entries = Object.entries(map);
  const total   = entries.reduce((s, [, v]) => s + v, 0);
  return {
    labels: entries.map(([n, v]) => `${n.substring(0, 20)} (${((v / total) * 100).toFixed(1)}%)`),
    data:   entries.map(([, v]) => v),
  };
}

// Por grupo de edad: clasifica cada registro en su grupo y suma.
// Si r.edad es null el registro se omite del pastel.
function pieDataPorEdad(rawData) {
  // Inicializar todos los grupos en 0
  const map = {};
  GRUPOS_EDAD.forEach(g => { map[g.id] = 0; });

  rawData.forEach(r => {
    if (r.edad === null) return;
    const grupo = GRUPOS_EDAD.find(g => r.edad >= g.min && r.edad <= g.max);
    if (grupo) map[grupo.id]++;
  });

  const total = Object.values(map).reduce((s, v) => s + v, 0);
  // Filtrar grupos con 0 citas para no contaminar el pastel
  const activos = GRUPOS_EDAD.filter(g => map[g.id] > 0);

  return {
    labels: activos.map(g =>
      `${g.label} (${((map[g.id] / total) * 100).toFixed(1)}%)`
    ),
    data: activos.map(g => map[g.id]),
  };
}

// Por sexo: solo dos segmentos, H y M.
function pieDataPorSexo(rawData) {
  let h = 0, m = 0, sin = 0;
  rawData.forEach(r => {
    if      (r.sexo === 'H') h++;
    else if (r.sexo === 'M') m++;
    else                     sin++;
  });
  const total   = h + m + sin;
  const labels  = [];
  const data    = [];
  if (h   > 0) { labels.push(`Hombres (${((h   / total) * 100).toFixed(1)}%)`); data.push(h);   }
  if (m   > 0) { labels.push(`Mujeres (${((m   / total) * 100).toFixed(1)}%)`); data.push(m);   }
  if (sin > 0) { labels.push(`Sin dato (${((sin / total) * 100).toFixed(1)}%)`); data.push(sin); }
  return { labels, data };
}

// ═══════════════════════════════════════════════════════════════
//  GRÁFICAS (Chart.js)
//
//  Parámetros nuevos:
//    filtrado   — registros ya filtrados (para barras y pastel contextual)
//    tipoFiltro — controla qué función de pie usar
// ═══════════════════════════════════════════════════════════════
function renderCharts(ultimos6, proy5, modelo, rawData, filtrado, tipoFiltro) {
  // Destruir instancias anteriores para liberar memoria
  if (chartLine) chartLine.destroy();
  if (chartPie)  chartPie.destroy();
  if (chartBar)  chartBar.destroy();

  const labelsHist = ultimos6.map(m => m.mes);
  const dataHist   = ultimos6.map(m => m.n);

  // Etiquetas del eje X para los meses proyectados (usando tRelativo)
  const labelsProy = proy5.map(p =>
    mesKey(modelo?.mes1 || labelsHist[labelsHist.length - 1], p.tRelativo)
  );
  const dataProy = proy5.map(p => p.Nt);
  const allLabels = [...labelsHist, ...labelsProy];

  // Dataset histórico: valores reales + null en las posiciones proyectadas
  const lineHist = [...dataHist, ...Array(labelsProy.length).fill(null)];

  // Dataset proyectado: null hasta el último histórico (para conectar),
  // luego todos los valores de la proyección.
  const lineProy = [
    ...Array(labelsHist.length - 1).fill(null),
    dataHist[dataHist.length - 1], // punto de conexión con la línea histórica
    ...dataProy,
  ];

  // ─────────────────────────────────────────────────────────────
  //  BUG CORREGIDO: punto/estrella naranja de P1
  //
  //  Antes: se buscaba proy5[pi]?.esElegido donde pi = i - labelsHist.length,
  //  pero proy5 ahora tiene tRelativo/tAbsoluto y el índice 0 de proy5
  //  corresponde al primer mes proyectado (tRelativo=1).
  //  La coincidencia de índices era correcta, pero esElegido nunca se
  //  activaba por el bug del modelo (t === mesesElegidos con t empezando en 1).
  //  Con el modelo corregido, esElegido ya funciona. Solo hay que asegurarse
  //  de indexar correctamente proy5 al mapear sobre allLabels.
  //
  //  Adicionalmente se añade una LÍNEA HORIZONTAL ANOTADA en el valor de P1
  //  usando el plugin de anotaciones de Chart.js... pero como no se puede
  //  cargar plugins externos, se implementa con un segundo eje Y y una
  //  dataset tipo 'line' plana con color naranja para lograr el efecto visual.
  // ─────────────────────────────────────────────────────────────

  // Valor del mes P1 elegido (para la línea horizontal)
  const p1Elegido = proy5.find(p => p.esElegido);
  const p1Valor   = p1Elegido?.Nt ?? null;

  // Dataset estrella: solo el punto exacto de P1
  const lineP1 = allLabels.map((_, i) => {
    const pi = i - labelsHist.length; // índice dentro de proy5 (0-based)
    if (pi < 0 || pi >= proy5.length) return null;
    return proy5[pi].esElegido ? proy5[pi].Nt : null;
  });

  // Dataset línea horizontal naranja: valor constante de P1 en toda la gráfica
  // Solo se pinta si hay un P1 válido; crea el efecto de línea de referencia.
  const lineHorizontal = p1Valor !== null
    ? allLabels.map(() => p1Valor)
    : [];

  // ── Gráfica de línea principal ───────────────────────────────
  const ctxL = document.getElementById('chartLine');
  if (ctxL) {
    chartLine = new Chart(ctxL, {
      type: 'line',
      data: {
        labels: allLabels,
        datasets: [
          // 1. Línea histórica (relleno verde oscuro)
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
            order: 3,
          },
          // 2. Línea proyectada (punteada, verde claro)
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
            order: 2,
          },
          // 3. Estrella naranja: marca visualmente el punto P1
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
            order: 0,             // se dibuja encima de todo
            pointHoverRadius: 14,
          },
          // 4. Línea horizontal naranja al nivel de P1
          //    Usa borderDash largo para parecer una guía de referencia.
          //    pointRadius: 0 para que no aparezcan puntos en cada columna.
          ...(p1Valor !== null ? [{
            label: 'Nivel P1',
            data: lineHorizontal,
            borderColor: 'rgba(216,90,48,.55)',
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderDash: [4, 6],
            pointRadius: 0,
            fill: false,
            tension: 0,
            spanGaps: true,
            order: 1,
          }] : []),
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            // Muestra el valor exacto con etiqueta amigable
            callbacks: {
              label: ctx => {
                if (ctx.dataset.label === 'Nivel P1') return null; // ocultar tooltip de la línea guía
                return `${ctx.dataset.label}: ${ctx.parsed.y} citas`;
              },
            },
          },
        },
        scales: {
          x: {
            ticks: { autoSkip: false, maxRotation: 45, font: { size: 10 } },
            grid:  { color: 'rgba(13,92,74,.07)' },
          },
          y: {
            beginAtZero: false,
            grid: { color: 'rgba(13,92,74,.07)' },
          },
        },
      },
    });
  }

  // ── Gráfica de pastel (contenido dinámico según filtro) ──────
  //
  //  BUG CORREGIDO: antes siempre usaba rawData completo con agrupación
  //  por médico. Ahora elige la función correcta según tipoFiltro.
  //
  //  - all    → participación de cada mes en el total histórico
  //  - medico → distribución entre médicos (usando filtrado, que ya tiene
  //             solo los registros del médico seleccionado, así que se
  //             usa rawData completo para ver todos los médicos)
  //  - edad   → distribución por grupo de edad sobre los datos filtrados
  //  - sexo   → hombres vs mujeres sobre los datos filtrados
  const ctxP = document.getElementById('chartPie');
  if (ctxP) {
    let pieLabels, pieData;

    if (tipoFiltro === 'all') {
      // Sin filtro: todos los meses del historial completo
      ({ labels: pieLabels, data: pieData } = pieDataPorMes(rawData));

    } else if (tipoFiltro === 'medico') {
      // Por médico: distribución de TODOS los médicos en el historial completo,
      // así el usuario ve el peso relativo del médico seleccionado vs el resto.
      ({ labels: pieLabels, data: pieData } = pieDataPorMedico(rawData));

    } else if (tipoFiltro === 'edad') {
      // Por edad: distribución de grupos en el historial completo
      // (para ver el peso relativo del grupo seleccionado)
      ({ labels: pieLabels, data: pieData } = pieDataPorEdad(rawData));

    } else if (tipoFiltro === 'sexo') {
      // Por sexo: hombres vs mujeres en el historial completo
      ({ labels: pieLabels, data: pieData } = pieDataPorSexo(rawData));
    }

    chartPie = new Chart(ctxP, {
      type: 'pie',
      data: {
        labels: pieLabels,
        datasets: [{
          data:            pieData,
          backgroundColor: COLORES_PIE.slice(0, pieData.length),
          borderWidth:     2,
          borderColor:     '#fff',
        }],
      },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels:   { font: { size: 11 }, boxWidth: 12, padding: 10 },
          },
        },
      },
    });
  }

  // ── Gráfica de barras (últimos 6 meses del filtro activo) ────
  const ctxB = document.getElementById('chartBar');
  if (ctxB) {
    chartBar = new Chart(ctxB, {
      type: 'bar',
      data: {
        labels: labelsHist,
        datasets: [{
          label:           'Citas',
          data:            dataHist,
          backgroundColor: 'rgba(13,92,74,.75)',
          borderRadius:    4,
        }],
      },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            ticks: { autoSkip: false, maxRotation: 45, font: { size: 10 } },
            grid:  { display: false },
          },
          y: {
            beginAtZero: false,
            grid: { color: 'rgba(13,92,74,.07)' },
          },
        },
      },
    });
  }
}

// ═══════════════════════════════════════════════════════════════
//  INICIO
//  Al cargar la página inicializa los controles y lanza el análisis.
// ═══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  updateSecondary();
  ejecutarAnalisis();
});
