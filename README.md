# 📦 Solucionador de Optimización

Una herramienta web interactiva para resolver problemas de **Investigación de Operaciones**, especializada en métodos de transporte y teoría de decisiones. Implementada con React + Vite con interfaz intuitiva y cálculos en tiempo real.

**Sitio Web:** [metodos-inv-op.vercel.app](https://metodos-inv-op.vercel.app/)

---

## 📋 Tabla de Contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Instalación](#instalación)
- [Uso](#uso)
- [Manual del Usuario](#manual-del-usuario)
  - [Problema de Transporte](#problema-de-transporte)
  - [Teoría de Decisiones](#teoría-de-decisiones)
- [Métodos Disponibles](#métodos-disponibles)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Contribuciones](#contribuciones)

---

## 🎯 Características

✅ **Problemas de Transporte:**
- Solución mediante tres métodos clásicos
- Matriz de costos personalizable
- Cálculo automático de penalizaciones
- Visualización de resultados optimizados

✅ **Teoría de Decisiones:**
- Análisis de criterios de decisión bajo incertidumbre
- Evaluación de múltiples alternativas
- Reportes detallados

✅ **Interfaz Amigable:**
- Diseño responsive con Tailwind CSS
- Entrada de datos intuitiva
- Visualización gráfica de resultados
- Cálculos en tiempo real

---

## 🛠️ Tecnologías

- **Frontend:** React 18+ con Vite
- **Estilos:** Tailwind CSS + PostCSS
- **Herramientas:** ESLint, Node.js
- **Despliegue:** Vercel

```json
{
  "react": "^18.x",
  "react-dom": "^18.x",
  "vite": "latest",
  "tailwindcss": "latest"
}
```

---

## 📦 Instalación

### Requisitos Previos
- Node.js (v18+)
- npm, yarn, pnpm o bun

### Pasos de Instalación

1. **Clonar el repositorio:**
```bash
git clone https://github.com/DubhanX/solucionador-optimizacion.git
cd solucionador-optimizacion
```

2. **Instalar dependencias:**
```bash
pnpm install
# o
npm install
```

3. **Ejecutar en desarrollo:**
```bash
pnpm dev
# o
npm run dev
```

4. **Construir para producción:**
```bash
pnpm build
# o
npm run build
```

La aplicación estará disponible en `http://localhost:5173`

---

## 🚀 Uso

### Acceso Rápido
1. Visita [metodos-inv-op.vercel.app](https://metodos-inv-op.vercel.app/)
2. Selecciona el método que necesitas resolver
3. Ingresa los datos del problema
4. Haz clic en "Resolver Problema"
5. Visualiza los resultados y análisis detallados

---

## 📚 Manual del Usuario

### Problema de Transporte

El **Problema de Transporte** es un problema de programación lineal clásico que busca minimizar el costo total de envío desde múltiples orígenes (proveedores) a múltiples destinos (clientes).

#### 1️⃣ Elementos Básicos

**Variables:**
- **Orígenes (Filas):** Puntos de suministro con capacidad disponible
- **Destinos (Columnas):** Puntos de demanda con requisitos específicos
- **Matriz de Costos:** Costo unitario de transporte desde cada origen a cada destino

**Función Objetivo:**
```
Minimizar: Z = Σ(cij × xij)
```
Donde:
- `cij` = Costo unitario desde origen i al destino j
- `xij` = Cantidad a transportar desde origen i al destino j

**Restricciones:**
```
Σ xij = Oferta en origen i  (para todo i)
Σ xij = Demanda en destino j  (para todo j)
xij ≥ 0  (no negatividad)
```

#### 2️⃣ Cómo Configurar el Problema

1. **Definir Dimensiones:**
   - Especifica número de orígenes (filas)
   - Especifica número de destinos (columnas)

2. **Ingresar Matriz de Costos:**
   - Ingresa el costo unitario en cada celda
   - Especifica la oferta disponible en cada origen (columna derecha)
   - Especifica la demanda requerida en cada destino (fila inferior)

3. **Validación Automática:**
   - La suma de ofertas debe ser ≥ suma de demandas
   - Si hay exceso de oferta, se crea un destino ficticio
   - Si hay exceso de demanda, se crea un origen ficticio

#### 3️⃣ Métodos de Solución Disponibles

##### **A) Método de la Esquina Noroeste (ENO)**

El método más simple pero menos óptimo. Comienza en la esquina superior izquierda.

**Pasos:**
1. Comienza en la celda (1,1) - esquina noroeste
2. Asigna la máxima cantidad posible (mín de oferta y demanda)
3. Elimina la fila o columna satisfecha
4. Muévete a la siguiente celda disponible (hacia la derecha o abajo)
5. Repite hasta asignar toda la oferta y demanda

**Ventajas:**
- Fácil de implementar manualmente
- Converge rápidamente

**Desventajas:**
- No considera costos
- Frecuentemente genera soluciones poco óptimas

**Ejemplo:**
```
        Dest1  Dest2  Dest3 | Oferta
Origen1   100    -      -    |  100
Origen2   50     100    -    |  150
Origen3   -      100    100  |  200
        ___   ___   ___
Demanda  150   200   100
```

##### **B) Método de Costo Mínimo (MCM)**

Considera los costos desde el inicio, priorizando asignaciones en celdas baratas.

**Pasos:**
1. Identifica la celda con el costo mínimo en toda la matriz
2. Asigna la máxima cantidad posible (mín de oferta y demanda)
3. Elimina la fila o columna satisfecha
4. Repite hasta asignar toda la oferta y demanda

**Ventajas:**
- Considera costos desde el inicio
- Generalmente mejor que Esquina Noroeste

**Desventajas:**
- Aún puede no ser solución óptima
- Requiere más búsquedas que ENO

**Ejemplo:**
```
        Dest1(c:5) Dest2(c:8) Dest3(c:6) | Oferta
Origen1    -         50         50       |  100
Origen2   100        -          50       |  150
Origen3    50        150        -        |  200
        ___       ___       ___
Demanda  150       200       100
```

##### **C) Método de Vogel (Aproximación de Vogel - VAM)**

El método más sofisticado. Usa "penalizaciones" para identificar asignaciones críticas.

**Concepto de Penalización:**
```
Penalización = (Costo Mínimo) - (Segundo Costo Mínimo)
```
Representa el "costo extra" de no usar la ruta más barata.

**Pasos:**
1. Calcula penalizaciones para cada fila (diferencia entre dos costos menores)
2. Calcula penalizaciones para cada columna
3. Identifica la fila/columna con máxima penalización
4. Asigna máxima cantidad a la celda con menor costo en esa fila/columna
5. Elimina fila o columna satisfecha
6. Recalcula penalizaciones
7. Repite hasta completar asignaciones

**Ventajas:**
- Casi siempre genera soluciones óptimas u óptimas
- Considera oportunidades de costo efectivamente

**Desventajas:**
- Más cálculos manuales que otros métodos
- Requiere cuidado en implementación

**Ejemplo de Penalizaciones:**
```
Origen 1: Costos en destinos [5, 8, 6] → Penalización = 6 - 5 = 1
Origen 2: Costos en destinos [4, 7, 9] → Penalización = 7 - 4 = 3
Origen 3: Costos en destinos [6, 5, 8] → Penalización = 6 - 5 = 1

Máxima penalización: Origen 2 (valor 3)
→ Asignar en la celda de menor costo en Origen 2
```

#### 4️⃣ Interpretación de Resultados

Tras resolver, obtendrás:

- **Tabla de Asignaciones:** Cantidad a transportar en cada ruta
- **Costo Total:** Sumatoria de (cantidad × costo) para todas las rutas
- **Rutas Activas:** Asignaciones con cantidad > 0
- **Rutas Inactivas:** Celdas con asignación 0
- **Validación:** Confirmación de que se satisfacen ofertas y demandas

#### 5️⃣ Consejos Prácticos

- **Revisión:** Verifica que oferta total ≈ demanda total antes de resolver
- **Comparación:** Resuelve con los tres métodos y compara costos totales
- **Mejora:** Para soluciones iniciales, considera métodos posteriores (MODI, Stepping Stone)
- **Casos Especiales:** Detecta variables básicas (m + n - 1) y degeneración

---

### Teoría de Decisiones

La **Teoría de Decisiones** es el estudio de cómo elegir la mejor alternativa cuando hay incertidumbre sobre los resultados futuros.

#### 1️⃣ Conceptos Fundamentales

**Elementos de un Problema de Decisión:**

1. **Decisor:** Quien toma la decisión
2. **Alternativas:** Opciones disponibles (acciones posibles)
3. **Estados de la Naturaleza:** Posibles escenarios futuros (no controlables)
4. **Payoffs/Resultados:** Ganancias o pérdidas en cada combinación alternativa-estado

**Matriz de Decisión:**
```
                Estado 1    Estado 2    Estado 3
Alternativa A      500         300        -100
Alternativa B      400         400         200
Alternativa C      600         100         -200
```

#### 2️⃣ Configuración del Problema

1. **Crear Alternativas:**
   - Ingresa nombre y descripción de cada opción
   - Ejemplo: "Invertir en Acción A", "Invertir en Acción B", etc.

2. **Definir Estados de la Naturaleza:**
   - Especifica escenarios posibles
   - Ejemplo: "Mercado Alcista", "Mercado Lateral", "Mercado Bajista"

3. **Estimar Payoffs:**
   - Para cada combinación alternativa-estado, ingresa el resultado esperado
   - Pueden ser ganancias (+) o pérdidas (-)

4. **Especificar Probabilidades (si aplica):**
   - Asigna probabilidad a cada estado de la naturaleza
   - Suma debe ser 1.0 (100%)

#### 3️⃣ Criterios de Decisión Disponibles

##### **A) Criterio de Optimismo (Maximax)**

**Asunción:** El decisor es optimista y supone el mejor escenario.

**Método:**
```
1. Para cada alternativa, selecciona el payoff máximo
2. Elige la alternativa con el máximo de estos máximos
```

**Fórmula:**
```
Decisión = máx(máx de cada alternativa)
```

**Ejemplo:**
```
Alternativa A: máx(500, 300, -100) = 500
Alternativa B: máx(400, 400, 200) = 400
Alternativa C: máx(600, 100, -200) = 600  ← ELEGIR (mejor de los mejores)
```

**Cuándo usar:**
- Situaciones de bajo riesgo
- Proyectos con recursos disponibles
- Sectores de alto crecimiento

##### **B) Criterio de Pesimismo (Maximin) - Wald**

**Asunción:** El decisor es pesimista y se protege contra el peor escenario.

**Método:**
```
1. Para cada alternativa, selecciona el payoff mínimo (peor caso)
2. Elige la alternativa que tiene el mínimo más alto
```

**Fórmula:**
```
Decisión = máx(mín de cada alternativa)
```

**Ejemplo:**
```
Alternativa A: mín(500, 300, -100) = -100
Alternativa B: mín(400, 400, 200) = 200   ← ELEGIR (mejor de los peores)
Alternativa C: mín(600, 100, -200) = -200
```

**Cuándo usar:**
- Situaciones de alto riesgo
- Recursos limitados
- Aversión al riesgo pronunciada
- Decisiones críticas

##### **C) Criterio de Hurwicz (Optimismo Ponderado)**

**Asunción:** Posición intermedia entre optimismo y pesimismo.

**Método:**
```
Para cada alternativa:
  Resultado = α × (máximo) + (1 - α) × (mínimo)
  
Donde:
  α = coeficiente de optimismo (0 ≤ α ≤ 1)
  α = 0   → completamente pesimista
  α = 0.5 → neutral
  α = 1   → completamente optimista
```

**Ejemplo (con α = 0.6):**
```
Alternativa A: 0.6(500) + 0.4(-100) = 300 - 40 = 260
Alternativa B: 0.6(400) + 0.4(200) = 240 + 80 = 320  ← ELEGIR
Alternativa C: 0.6(600) + 0.4(-200) = 360 - 80 = 280
```

**Cuándo usar:**
- Decisiones con riesgo moderado
- Cuando se conoce el grado de optimismo del decisor
- Equilibrio entre aspiración y cautela

##### **D) Criterio de Equiprobabilidad (Laplace)**

**Asunción:** Todos los estados de la naturaleza son igualmente probables.

**Método:**
```
Para cada alternativa:
  Resultado = (Suma de todos los payoffs) / (Número de estados)
  
Elegir la alternativa con promedio más alto
```

**Ejemplo:**
```
Alternativa A: (500 + 300 - 100) / 3 = 233.33
Alternativa B: (400 + 400 + 200) / 3 = 333.33  ← ELEGIR
Alternativa C: (600 + 100 - 200) / 3 = 166.67
```

**Cuándo usar:**
- Sin información sobre probabilidades
- Estados de la naturaleza parecen equiprobables
- Situaciones de incertidumbre "pura"

##### **E) Criterio de Pérdida de Oportunidad (Savage)**

**Asunción:** Se minimiza el "arrepentimiento" de no haber elegido mejor.

**Método:**
```
1. Para cada estado, calcula la ganancia máxima posible
2. Crea "matriz de arrepentimiento":
   Arrepentimiento = Máximo del estado - Valor real
3. Para cada alternativa, busca el máximo arrepentimiento
4. Elige la alternativa con menor máximo arrepentimiento
```

**Ejemplo:**
```
Matriz de Costos de Oportunidad (Arrepentimiento):

                Estado 1    Estado 2    Estado 3
Alternativa A      100        100        300
Alternativa B      200        0          0      ← ELEGIR (máx arrepentimiento = 200)
Alternativa C      0          300        400

Máximo arrepentimiento por alternativa:
A: 300
B: 200  ← ELEGIR (mínimo arrepentimiento)
C: 400
```

**Cuándo usar:**
- Cuando el arrepentimiento es una preocupación importante
- Decisiones comerciales con competencia
- Análisis de casos hipotéticos

##### **F) Criterio del Valor Esperado (Probabilístico)**

**Asunción:** Se conocen las probabilidades de los estados de la naturaleza.

**Método:**
```
Para cada alternativa:
  VE = Σ(Payoff × Probabilidad del estado)
  
Elegir la alternativa con mayor VE
```

**Ejemplo (con probabilidades: P1=0.5, P2=0.3, P3=0.2):**
```
Alternativa A: 500(0.5) + 300(0.3) + (-100)(0.2) = 250 + 90 - 20 = 320
Alternativa B: 400(0.5) + 400(0.3) + 200(0.2) = 200 + 120 + 40 = 360  ← ELEGIR
Alternativa C: 600(0.5) + 100(0.3) + (-200)(0.2) = 300 + 30 - 40 = 290
```

**Cuándo usar:**
- Probabilidades conocidas o estimables
- Decisiones repetidas (ley de grandes números)
- Análisis de riesgo formal

#### 4️⃣ Cómo Usar la Herramienta

1. **Ingresa Alternativas:**
   - Nombre descriptivo de cada opción
   - Número mínimo: 2 alternativas

2. **Ingresa Estados de la Naturaleza:**
   - Descripción de cada escenario posible
   - Número mínimo: 2 estados

3. **Completa la Matriz de Payoffs:**
   - Valida que todos los valores estén cubiertos
   - Pueden ser números positivos o negativos

4. **Selecciona Criterios:**
   - Elige los criterios que deseas aplicar
   - Algunos requieren parámetros adicionales (ej: α en Hurwicz)

5. **Analiza Resultados:**
   - Compara recomendaciones entre criterios
   - Nota cuando hay acuerdo/desacuerdo

#### 5️⃣ Interpretación de Resultados

**Resultado de cada Criterio:**
```
Criterio            | Recomendación  | Valor
Optimismo (Maximax) | Alternativa C   | 600
Pesimismo (Maximin) | Alternativa B   | 200
Hurwicz (α=0.6)     | Alternativa B   | 320
Equiprobabilidad    | Alternativa B   | 333.33
Pérdida Oportunidad | Alternativa B   | 200
Valor Esperado      | Alternativa B   | 360
```

#### 6️⃣ Guía de Decisión

**Si hay acuerdo entre criterios:**
- La recomendación es robusta
- Procede con confianza

**Si hay desacuerdo:**
- Analiza el tipo de decisor (optimista/pesimista)
- Considera las consecuencias del error
- Evalúa el apetito al riesgo
- Busca información adicional si es posible

**Pasos para Mejorar la Decisión:**
1. Recopila más información sobre probabilidades
2. Reduce la incertidumbre con estudios/pilotos
3. Utiliza análisis de sensibilidad
4. Consulta expertos en el área

#### 7️⃣ Casos de Uso Comunes

- **Inversiones:** Comparar proyectos de inversión
- **Gestión de Empresas:** Elegir estrategias de negocio
- **Gestión de Proyectos:** Evaluar alternativas de riesgo
- **Recursos Humanos:** Decisiones de contratación
- **Marketing:** Seleccionar estrategias de campaña
- **Logística:** Elegir proveedores o rutas

---

## 🔧 Métodos Disponibles

### Problema de Transporte
| Método | Complejidad | Precisión | Tiempo Cálculo |
|--------|------------|-----------|----------------|
| **Esquina Noroeste** | ⭐ Baja | ⭐ Baja | ⭐⭐⭐ Muy Rápido |
| **Costo Mínimo** | ⭐⭐ Media | ⭐⭐ Media | ⭐⭐ Rápido |
| **Método de Vogel** | ⭐⭐⭐ Alta | ⭐⭐⭐ Alta | ⭐ Normal |

### Teoría de Decisiones
- Criterio de Optimismo (Maximax)
- Criterio de Pesimismo (Maximin/Wald)
- Criterio de Hurwicz
- Criterio de Equiprobabilidad (Laplace)
- Criterio de Pérdida de Oportunidad (Savage)
- Criterio del Valor Esperado

---

## 📁 Estructura del Proyecto

```
solucionador-optimizacion/
├── src/
│   ├── components/          # Componentes React reutilizables
│   ├── pages/              # Páginas principales
│   ├── utils/              # Funciones de cálculo
│   ├── App.jsx             # Componente principal
│   └── main.jsx            # Punto de entrada
├── public/                 # Archivos estáticos
├── index.html              # HTML principal
├── tailwind.config.js      # Configuración Tailwind
├── vite.config.js          # Configuración Vite
├── package.json            # Dependencias
└── README.md              # Este archivo
```

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para contribuir:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

### Ideas de Mejora
- [ ] Agregar validación de degeneración
- [ ] Implementar métodos posteriores (MODI, Stepping Stone)
- [ ] Gráficos de análisis de sensibilidad
- [ ] Exportar resultados (PDF, Excel)
- [ ] Historial de problemas resueltos
- [ ] Más criterios de decisión
- [ ] Análisis de valor de información perfecta

---

## 📄 Licencia

Este proyecto está disponible bajo la licencia que especifique el autor. Consulta el repositorio para detalles.

---

## 👨‍💻 Autor

**DubhanX** - Desarrollador de soluciones en Investigación de Operaciones

- GitHub: [@DubhanX](https://github.com/DubhanX)
- Repositorio: [solucionador-optimizacion](https://github.com/DubhanX/solucionador-optimizacion)
- Sitio: [metodos-inv-op.vercel.app](https://metodos-inv-op.vercel.app/)

---

## 📞 Soporte

Si encuentras problemas o tienes preguntas:
- Abre un [Issue](https://github.com/DubhanX/solucionador-optimizacion/issues) en GitHub
- Revisa la documentación completa en este README
- Consulta la página web para ejemplos interactivos

---

## 🎓 Referencias Académicas

Este proyecto implementa métodos clásicos enseñados en cursos de:
- Investigación de Operaciones
- Programación Lineal
- Teoría de Decisiones
- Métodos Cuantitativos en Administración

Basado en literatura estándar de O.R. y teoría de decisiones.

---

## ✨ Última Actualización

Proyecto activo y en desarrollo continuo. Última actualización: Noviembre 2025

