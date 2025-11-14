import React, { useState } from 'react';
import { FileText, HelpCircle, Calculator, Grid, ChevronDown, ChevronRight } from 'lucide-react';

export default function App() {
  const [method, setMethod] = useState('noroeste');
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [costs, setCosts] = useState([[5,8,6],[4,7,9],[6,5,8]]);
  const [supply, setSupply] = useState([100,150,200]);
  const [demand, setDemand] = useState([150,200,100]);
  const [solution, setSolution] = useState(null);
  const [steps, setSteps] = useState([]);
  const [showObj, setShowObj] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [objType, setObjType] = useState('minimizar');
  
  const [criteria, setCriteria] = useState(['Criterio 1', 'Criterio 2']);
  const [alternatives, setAlternatives] = useState(['Alternativa 1', 'Alternativa 2']);
  const [decisionMatrix, setDecisionMatrix] = useState([[10,20],[15,25]]);
  const [decisionMethod, setDecisionMethod] = useState('laplace');

  const updateDim = (r, c) => {
    setRows(r);
    setCols(c);
    setCosts(Array(r).fill().map(() => Array(c).fill(0)));
    setSupply(Array(r).fill(0));
    setDemand(Array(c).fill(0));
  };

  const solveNW = () => {
    const alloc = Array(rows).fill().map(() => Array(cols).fill(0));
    const sup = [...supply];
    const dem = [...demand];
    const log = [{
      title: "Método de la Esquina Noroeste",
      description: "Comenzamos desde la esquina superior izquierda"
    }];
    
    let i = 0, j = 0, step = 1;
    while (i < rows && j < cols) {
      const amt = Math.min(sup[i], dem[j]);
      alloc[i][j] = amt;
      log.push({
        title: `Paso ${step}`,
        description: `Celda [${i+1},${j+1}]: Asignamos ${amt} unidades (oferta=${sup[i]}, demanda=${dem[j]}). Costo: ${costs[i][j]}`
      });
      sup[i] -= amt;
      dem[j] -= amt;
      if (sup[i] === 0) i++;
      if (dem[j] === 0) j++;
      step++;
    }
    
    const total = alloc.reduce((s, r, i) => s + r.reduce((rs, v, j) => rs + v * costs[i][j], 0), 0);
    log.push({ title: "Resultado", description: `Costo total: $${total.toFixed(2)}` });
    setSteps(log);
    setSolution({ allocation: alloc, totalCost: total, method: 'Esquina Noroeste' });
  };

  const solveMin = () => {
    const alloc = Array(rows).fill().map(() => Array(cols).fill(0));
    const sup = [...supply];
    const dem = [...demand];
    const log = [{
      title: "Método de Costo Mínimo",
      description: "Seleccionamos siempre la celda con menor costo"
    }];
    
    let step = 1;
    while (sup.some(s => s > 0) && dem.some(d => d > 0)) {
      let minC = Infinity, minI = -1, minJ = -1;
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          if (sup[i] > 0 && dem[j] > 0 && costs[i][j] < minC) {
            minC = costs[i][j];
            minI = i;
            minJ = j;
          }
        }
      }
      if (minI === -1) break;
      const amt = Math.min(sup[minI], dem[minJ]);
      alloc[minI][minJ] = amt;
      log.push({
        title: `Paso ${step}`,
        description: `Celda [${minI+1},${minJ+1}]: Costo mínimo=${minC}. Asignamos ${amt} unidades`
      });
      sup[minI] -= amt;
      dem[minJ] -= amt;
      step++;
    }
    
    const total = alloc.reduce((s, r, i) => s + r.reduce((rs, v, j) => rs + v * costs[i][j], 0), 0);
    log.push({ title: "Resultado", description: `Costo total: $${total.toFixed(2)}` });
    setSteps(log);
    setSolution({ allocation: alloc, totalCost: total, method: 'Costo Mínimo' });
  };

  const solveVogel = () => {
    const alloc = Array(rows).fill().map(() => Array(cols).fill(0));
    const sup = [...supply];
    const dem = [...demand];
    const log = [{
      title: "Método de Vogel (VAM)",
      description: "Calculamos penalizaciones para filas y columnas"
    }];
    
    let step = 1;
    while (sup.some(s => s > 0) && dem.some(d => d > 0)) {
      const rPen = [], cPen = [];
      
      for (let i = 0; i < rows; i++) {
        if (sup[i] === 0) { rPen.push(-1); continue; }
        const avail = [];
        for (let j = 0; j < cols; j++) {
          if (dem[j] > 0) avail.push(costs[i][j]);
        }
        if (avail.length >= 2) {
          avail.sort((a, b) => a - b);
          rPen.push(avail[1] - avail[0]);
        } else {
          rPen.push(avail[0] || -1);
        }
      }
      
      for (let j = 0; j < cols; j++) {
        if (dem[j] === 0) { cPen.push(-1); continue; }
        const avail = [];
        for (let i = 0; i < rows; i++) {
          if (sup[i] > 0) avail.push(costs[i][j]);
        }
        if (avail.length >= 2) {
          avail.sort((a, b) => a - b);
          cPen.push(avail[1] - avail[0]);
        } else {
          cPen.push(avail[0] || -1);
        }
      }
      
      let maxP = -1, isR = true, idx = -1;
      rPen.forEach((p, i) => { if (p > maxP) { maxP = p; isR = true; idx = i; } });
      cPen.forEach((p, j) => { if (p > maxP) { maxP = p; isR = false; idx = j; } });
      
      if (idx === -1) break;
      
      let minC = Infinity, minI = -1, minJ = -1;
      if (isR) {
        for (let j = 0; j < cols; j++) {
          if (dem[j] > 0 && costs[idx][j] < minC) {
            minC = costs[idx][j];
            minI = idx;
            minJ = j;
          }
        }
      } else {
        for (let i = 0; i < rows; i++) {
          if (sup[i] > 0 && costs[i][idx] < minC) {
            minC = costs[i][idx];
            minI = i;
            minJ = idx;
          }
        }
      }
      
      if (minI === -1) break;
      const amt = Math.min(sup[minI], dem[minJ]);
      alloc[minI][minJ] = amt;
      log.push({
        title: `Paso ${step}`,
        description: `Penalización máxima=${maxP.toFixed(2)} en ${isR ? 'fila' : 'columna'} ${idx+1}. Celda [${minI+1},${minJ+1}]: ${amt} unidades`
      });
      sup[minI] -= amt;
      dem[minJ] -= amt;
      step++;
    }
    
    const total = alloc.reduce((s, r, i) => s + r.reduce((rs, v, j) => rs + v * costs[i][j], 0), 0);
    log.push({ title: "Resultado", description: `Costo total: $${total.toFixed(2)}` });
    setSteps(log);
    setSolution({ allocation: alloc, totalCost: total, method: 'Vogel (VAM)' });
  };

  const solveDecision = () => {
    const log = [];
    let result = {};

    switch (decisionMethod) {
      case 'laplace':
        const avgValues = alternatives.map((_, i) => {
          const sum = decisionMatrix[i].reduce((a, b) => a + b, 0);
          return sum / decisionMatrix[i].length;
        });
        const maxAvgIdx = avgValues.indexOf(Math.max(...avgValues));
        
        log.push({ title: "Criterio de Laplace", description: "Equiprobabilidad" });
        alternatives.forEach((alt, i) => {
          log.push({ title: alt, description: `Promedio = ${avgValues[i].toFixed(2)}` });
        });

        result = { method: 'Laplace', decision: alternatives[maxAvgIdx], value: avgValues[maxAvgIdx], details: avgValues };
        break;

      case 'maximin':
        const minValues = alternatives.map((_, i) => Math.min(...decisionMatrix[i]));
        const maxMinIdx = minValues.indexOf(Math.max(...minValues));
        
        log.push({ title: "Criterio Maximin (Wald)", description: "Criterio pesimista" });
        alternatives.forEach((alt, i) => {
          log.push({ title: alt, description: `Mínimo = ${minValues[i].toFixed(2)}` });
        });

        result = { method: 'Maximin', decision: alternatives[maxMinIdx], value: minValues[maxMinIdx], details: minValues };
        break;

      case 'maximax':
        const maxValues = alternatives.map((_, i) => Math.max(...decisionMatrix[i]));
        const maxMaxIdx = maxValues.indexOf(Math.max(...maxValues));
        
        log.push({ title: "Criterio Maximax", description: "Criterio optimista" });
        alternatives.forEach((alt, i) => {
          log.push({ title: alt, description: `Máximo = ${maxValues[i].toFixed(2)}` });
        });

        result = { method: 'Maximax', decision: alternatives[maxMaxIdx], value: maxValues[maxMaxIdx], details: maxValues };
        break;

      case 'savage':
        const regretMatrix = [];
        for (let j = 0; j < criteria.length; j++) {
          const colMax = Math.max(...alternatives.map((_, i) => decisionMatrix[i][j]));
          for (let i = 0; i < alternatives.length; i++) {
            if (!regretMatrix[i]) regretMatrix[i] = [];
            regretMatrix[i][j] = colMax - decisionMatrix[i][j];
          }
        }
        
        const maxRegrets = regretMatrix.map(row => Math.max(...row));
        const minRegretIdx = maxRegrets.indexOf(Math.min(...maxRegrets));
        
        log.push({ title: "Criterio de Savage", description: "Minimiza arrepentimiento" });
        alternatives.forEach((alt, i) => {
          log.push({ title: alt, description: `Arrepentimiento máximo = ${maxRegrets[i].toFixed(2)}` });
        });

        result = { method: 'Savage', decision: alternatives[minRegretIdx], value: maxRegrets[minRegretIdx], details: maxRegrets, regretMatrix };
        break;
    }

    log.push({ title: "Decisión Final", description: `Mejor: ${result.decision}` });
    setSteps(log);
    setSolution(result);
  };

  const solve = () => {
    if (method === 'decision') {
      solveDecision();
      return;
    }
    
    const tSup = supply.reduce((a, b) => a + b, 0);
    const tDem = demand.reduce((a, b) => a + b, 0);
    if (tSup !== tDem) {
      alert(`Error: Oferta total (${tSup}) debe ser igual a Demanda total (${tDem})`);
      return;
    }
    
    if (method === 'noroeste') solveNW();
    else if (method === 'minimo') solveMin();
    else if (method === 'vogel') solveVogel();
  };

  const exportPDF = () => {
    window.print();
  };

  const exportCSV = () => {
    if (!solution) return;
    let csv = '';
    
    if (method === 'decision') {
      csv = `Método,${solution.method}\nDecisión,${solution.decision}\nValor,${solution.value}\n`;
    } else {
      csv = `Método,${solution.method}\nCosto Total,${solution.totalCost}\n\nAsignación\n`;
      solution.allocation.forEach((r, i) => {
        csv += `O${i+1},${r.join(',')}\n`;
      });
    }
    
    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    link.download = 'solucion.csv';
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          <h1 className="text-4xl font-bold text-indigo-900 flex items-center gap-3">
            <Calculator className="w-10 h-10" />
            Solucionador de Optimización
          </h1>
          <p className="text-gray-600">Métodos de transporte y teoría de decisiones</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <button
            onClick={() => setMethod('noroeste')}
            className={`p-6 rounded-xl font-semibold transition ${
              method === 'noroeste' ? 'bg-indigo-600 text-white scale-105' : 'bg-white text-gray-700 hover:bg-indigo-50'
            }`}
          >
            Esquina Noroeste
          </button>
          <button
            onClick={() => setMethod('minimo')}
            className={`p-6 rounded-xl font-semibold transition ${
              method === 'minimo' ? 'bg-indigo-600 text-white scale-105' : 'bg-white text-gray-700 hover:bg-indigo-50'
            }`}
          >
            Costo Mínimo
          </button>
          <button
            onClick={() => setMethod('vogel')}
            className={`p-6 rounded-xl font-semibold transition ${
              method === 'vogel' ? 'bg-indigo-600 text-white scale-105' : 'bg-white text-gray-700 hover:bg-indigo-50'
            }`}
          >
            Método de Vogel
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
          <button
            onClick={() => setMethod('decision')}
            className={`w-full p-6 rounded-xl font-semibold transition ${
              method === 'decision' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'
            }`}
          >
            Teoría de Decisiones
          </button>
        </div>

        {method !== 'decision' ? (
          <div className="bg-white rounded-xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Problema de Transporte</h2>
            
            <div className="bg-purple-50 rounded-lg p-6 mb-6 border-2 border-purple-200">
              <button
                onClick={() => setShowObj(!showObj)}
                className="w-full flex justify-between items-center hover:opacity-80"
              >
                <h3 className="text-xl font-bold text-purple-900 flex items-center gap-2">
                  <Calculator className="w-6 h-6" />
                  Función Objetivo y Variables de Decisión
                </h3>
                {showObj ? <ChevronDown className="w-6 h-6 text-purple-700" /> : <ChevronRight className="w-6 h-6 text-purple-700" />}
              </button>
              
              {showObj && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-purple-900 mb-2">Tipo de Optimización:</label>
                    <select
                      value={objType}
                      onChange={(e) => setObjType(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-purple-300 rounded-lg"
                    >
                      <option value="minimizar">Minimizar Costos</option>
                      <option value="maximizar">Maximizar Beneficios</option>
                    </select>
                  </div>

                  <div className="bg-white rounded p-4 border-2 border-purple-200">
                    <h4 className="font-bold text-purple-900 mb-2">📐 Función Objetivo:</h4>
                    <div className="bg-purple-50 p-3 rounded text-sm overflow-x-auto">
                      <span className="font-semibold">{objType === 'minimizar' ? 'Minimizar' : 'Maximizar'} Z = </span>
                      {costs.map((row, i) => row.map((c, j) => (
                        <span key={`${i}${j}`}>
                          {i === 0 && j === 0 ? '' : ' + '}
                          <b className="text-purple-700">{c}</b>
                          <span className="text-indigo-600">X<sub>{i+1}{j+1}</sub></span>
                        </span>
                      )))}
                    </div>
                  </div>

                  <div className="bg-white rounded p-4 border-2 border-purple-200">
                    <h4 className="font-bold text-purple-900 mb-2">📊 Variables de Decisión:</h4>
                    <p className="text-sm bg-indigo-50 p-2 rounded mb-2">
                      <b>X<sub>ij</sub></b> = Cantidad a transportar del origen <b>i</b> al destino <b>j</b>
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {costs.slice(0, Math.min(2, rows)).map((row, i) => 
                        row.slice(0, Math.min(3, cols)).map((_, j) => (
                          <p key={`${i}${j}`} className="text-xs bg-purple-50 p-2 rounded">
                            <b className="text-purple-700">X<sub>{i+1}{j+1}</sub></b> = Unidades de O{i+1} a D{j+1}
                          </p>
                        ))
                      )}
                      {rows * cols > 6 && <p className="col-span-2 text-center text-xs text-gray-500 italic">... y {rows * cols - 6} variables más</p>}
                    </div>
                  </div>

                  <div className="bg-white rounded p-4 border-2 border-purple-200">
                    <h4 className="font-bold text-purple-900 mb-2">🔒 Restricciones:</h4>
                    <div className="text-xs space-y-2 max-h-48 overflow-y-auto">
                      <div>
                        <p className="font-semibold text-indigo-700 mb-1">Restricciones de Oferta:</p>
                        {supply.map((s, i) => (
                          <p key={i} className="bg-yellow-50 p-1 rounded mb-1">
                            {Array(cols).fill().map((_, j) => `X${i+1}${j+1}`).join(' + ')} = <b className="text-yellow-700">{s}</b>
                          </p>
                        ))}
                      </div>
                      <div>
                        <p className="font-semibold text-indigo-700 mb-1">Restricciones de Demanda:</p>
                        {demand.map((d, j) => (
                          <p key={j} className="bg-blue-50 p-1 rounded mb-1">
                            {Array(rows).fill().map((_, i) => `X${i+1}${j+1}`).join(' + ')} = <b className="text-blue-700">{d}</b>
                          </p>
                        ))}
                      </div>
                      <p className="bg-green-50 p-1 rounded"><b>X<sub>ij</sub> ≥ 0</b> (No negatividad)</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Orígenes (filas)</label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={rows}
                  onChange={(e) => updateDim(parseInt(e.target.value) || 2, cols)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Destinos (columnas)</label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={cols}
                  onChange={(e) => updateDim(rows, parseInt(e.target.value) || 2)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="mb-6 overflow-x-auto">
              <h3 className="text-lg font-semibold mb-3">Matriz de Costos</h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border bg-gray-100 p-2"></th>
                    {Array(cols).fill().map((_, j) => (
                      <th key={j} className="border bg-indigo-100 p-2 font-semibold">D{j+1}</th>
                    ))}
                    <th className="border bg-yellow-100 p-2 font-semibold">Oferta</th>
                  </tr>
                </thead>
                <tbody>
                  {Array(rows).fill().map((_, i) => (
                    <tr key={i}>
                      <td className="border bg-indigo-100 p-2 font-semibold">O{i+1}</td>
                      {Array(cols).fill().map((_, j) => (
                        <td key={j} className="border p-1">
                          <input
                            type="number"
                            value={costs[i][j]}
                            onChange={(e) => {
                              const newC = [...costs];
                              newC[i][j] = parseFloat(e.target.value) || 0;
                              setCosts(newC);
                            }}
                            className="w-full px-2 py-1 text-center"
                          />
                        </td>
                      ))}
                      <td className="border p-1">
                        <input
                          type="number"
                          value={supply[i]}
                          onChange={(e) => {
                            const newS = [...supply];
                            newS[i] = parseFloat(e.target.value) || 0;
                            setSupply(newS);
                          }}
                          className="w-full px-2 py-1 text-center bg-yellow-50 font-semibold"
                        />
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className="border bg-yellow-100 p-2 font-semibold">Demanda</td>
                    {Array(cols).fill().map((_, j) => (
                      <td key={j} className="border p-1">
                        <input
                          type="number"
                          value={demand[j]}
                          onChange={(e) => {
                            const newD = [...demand];
                            newD[j] = parseFloat(e.target.value) || 0;
                            setDemand(newD);
                          }}
                          className="w-full px-2 py-1 text-center bg-yellow-50 font-semibold"
                        />
                      </td>
                    ))}
                    <td className="border bg-gray-100"></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <button
              onClick={solve}
              className="w-full bg-indigo-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
            >
              <Calculator className="w-6 h-6" />
              Resolver Problema ({objType === 'minimizar' ? 'Minimizar' : 'Maximizar'} Costos)
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-6">Teoría de Decisiones</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Método de Decisión</label>
              <select
                value={decisionMethod}
                onChange={(e) => setDecisionMethod(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="laplace">Laplace (Equiprobabilidad)</option>
                <option value="maximin">Maximin (Wald - Pesimista)</option>
                <option value="maximax">Maximax (Optimista)</option>
                <option value="savage">Savage (Arrepentimiento)</option>
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Número de Alternativas</label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={alternatives.length}
                  onChange={(e) => {
                    const n = parseInt(e.target.value) || 2;
                    setAlternatives(Array(n).fill().map((_, i) => `Alternativa ${i+1}`));
                    setDecisionMatrix(Array(n).fill().map(() => Array(criteria.length).fill(0)));
                  }}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Número de Estados/Criterios</label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={criteria.length}
                  onChange={(e) => {
                    const n = parseInt(e.target.value) || 2;
                    setCriteria(Array(n).fill().map((_, i) => `Criterio ${i+1}`));
                    setDecisionMatrix(decisionMatrix.map(row => 
                      Array(n).fill().map((_, j) => row[j] || 0)
                    ));
                  }}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="mb-6 overflow-x-auto">
              <h3 className="text-lg font-semibold mb-3">Matriz de Decisión</h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border bg-gray-100 p-2"></th>
                    {criteria.map((c, j) => (
                      <th key={j} className="border bg-green-100 p-2">
                        <input
                          type="text"
                          value={c}
                          onChange={(e) => {
                            const newC = [...criteria];
                            newC[j] = e.target.value;
                            setCriteria(newC);
                          }}
                          className="w-full px-2 py-1 text-center bg-transparent font-semibold"
                        />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {alternatives.map((a, i) => (
                    <tr key={i}>
                      <td className="border bg-green-100 p-2">
                        <input
                          type="text"
                          value={a}
                          onChange={(e) => {
                            const newA = [...alternatives];
                            newA[i] = e.target.value;
                            setAlternatives(newA);
                          }}
                          className="w-full px-2 py-1 text-center bg-transparent font-semibold"
                        />
                      </td>
                      {criteria.map((_, j) => (
                        <td key={j} className="border p-1">
                          <input
                            type="number"
                            value={decisionMatrix[i][j]}
                            onChange={(e) => {
                              const newM = [...decisionMatrix];
                              newM[i][j] = parseFloat(e.target.value) || 0;
                              setDecisionMatrix(newM);
                            }}
                            className="w-full px-2 py-1 text-center"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={solve}
              className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700"
            >
              Resolver Decisión
            </button>
          </div>
        )}

        {solution && (
          <div className="bg-white rounded-xl shadow-xl p-8 mt-6" id="solution-content">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Solución</h2>
              <div className="flex gap-3">
                <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  <FileText className="w-5 h-5" />
                  PDF
                </button>
                <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  <Grid className="w-5 h-5" />
                  Excel
                </button>
                <button 
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <HelpCircle className="w-5 h-5" />
                  {showExplanation ? 'Ocultar' : 'Mostrar'} Explicación
                </button>
              </div>
            </div>

            {method !== 'decision' ? (
              <>
                <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 mb-6">
                  <p className="text-sm font-semibold text-indigo-700">
                    Función Objetivo: {objType === 'minimizar' ? 'Minimizar' : 'Maximizar'} Costos Totales
                  </p>
                  <p className="text-lg font-semibold text-indigo-900">Método: {solution.method}</p>
                  <p className="text-2xl font-bold text-indigo-900 mt-2">
                    Costo Total: ${solution.totalCost.toFixed(2)}
                  </p>
                  <p className="text-xs text-indigo-600 mt-2">
                    Variables: X<sub>ij</sub> = unidades del origen i al destino j
                  </p>
                </div>

                <h3 className="text-xl font-bold mb-4">Matriz de Asignación</h3>
                <div className="overflow-x-auto mb-6">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border bg-gray-100 p-3"></th>
                        {Array(cols).fill().map((_, j) => (
                          <th key={j} className="border bg-indigo-100 p-3 font-semibold">Destino {j+1}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {solution.allocation.map((row, i) => (
                        <tr key={i}>
                          <td className="border bg-indigo-100 p-3 font-semibold">Origen {i+1}</td>
                          {row.map((v, j) => (
                            <td key={j} className={`border p-3 text-center font-semibold ${v > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-50'}`}>
                              {v > 0 ? v : '-'}
                              {v > 0 && <span className="block text-xs text-gray-600 mt-1">(costo: ${(v * costs[i][j]).toFixed(2)})</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <>
                <div className="bg-green-50 border-l-4 border-green-600 p-4 mb-6">
                  <p className="text-lg font-semibold text-green-900">Método: {solution.method}</p>
                  <p className="text-2xl font-bold text-green-900 mt-2">Mejor Decisión: {solution.decision}</p>
                  <p className="text-lg text-green-800 mt-1">Valor: {solution.value.toFixed(2)}</p>
                </div>

                <h3 className="text-xl font-bold mb-4">Valores por Alternativa</h3>
                <div className="overflow-x-auto mb-6">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border bg-gray-100 p-3">Alternativa</th>
                        <th className="border bg-green-100 p-3">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alternatives.map((alt, i) => (
                        <tr key={i} className={solution.decision === alt ? 'bg-green-50' : ''}>
                          <td className="border p-3 font-semibold">
                            {alt}
                            {solution.decision === alt && <span className="ml-2 text-green-600">★ Mejor</span>}
                          </td>
                          <td className="border p-3 text-center font-semibold">{solution.details[i].toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {solution.regretMatrix && (
                  <>
                    <h3 className="text-xl font-bold mb-4">Matriz de Arrepentimiento</h3>
                    <div className="overflow-x-auto mb-6">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr>
                            <th className="border bg-gray-100 p-3"></th>
                            {criteria.map((c, j) => (
                              <th key={j} className="border bg-orange-100 p-3">{c}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {alternatives.map((alt, i) => (
                            <tr key={i}>
                              <td className="border bg-orange-100 p-3 font-semibold">{alt}</td>
                              {solution.regretMatrix[i].map((v, j) => (
                                <td key={j} className="border p-3 text-center">{v.toFixed(2)}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </>
            )}

            {showExplanation && (
              <>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <ChevronRight className="w-6 h-6" />
                  Paso a Paso
                </h3>
                <div className="space-y-3">
                  {steps.map((step, i) => (
                    <div key={i} className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
                      <h4 className="font-bold text-blue-900 mb-2">{step.title}</h4>
                      <p className="text-gray-700">{step.description}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <h3 className="text-xl font-bold text-purple-900 mb-4">📚 Explicación del Método</h3>
                  {method === 'noroeste' && (
                    <div className="text-gray-700 space-y-2">
                      <p><strong>Método de la Esquina Noroeste:</strong></p>
                      <p>Comienza en la celda superior izquierda de la matriz.</p>
                      <p>Asigna el mínimo entre oferta y demanda disponible.</p>
                      <p>Se mueve a la derecha si se agota la demanda, o hacia abajo si se agota la oferta.</p>
                      <p><strong>Ventajas:</strong> Simple y rápido.</p>
                      <p><strong>Desventajas:</strong> No considera costos, no garantiza solución óptima.</p>
                    </div>
                  )}
                  {method === 'minimo' && (
                    <div className="text-gray-700 space-y-2">
                      <p><strong>Método del Costo Mínimo:</strong></p>
                      <p>Busca la celda con el costo más bajo en toda la matriz.</p>
                      <p>Asigna la máxima cantidad posible a esa celda.</p>
                      <p>Elimina la fila o columna agotada y repite.</p>
                      <p><strong>Ventajas:</strong> Considera costos, mejor que noroeste.</p>
                      <p><strong>Desventajas:</strong> No garantiza óptimo global.</p>
                    </div>
                  )}
                  {method === 'vogel' && (
                    <div className="text-gray-700 space-y-2">
                      <p><strong>Método de Vogel (VAM):</strong></p>
                      <p>Calcula penalizaciones (diferencia entre 2 costos más bajos) para cada fila y columna.</p>
                      <p>Selecciona la mayor penalización.</p>
                      <p>Asigna a la celda de menor costo en esa fila/columna.</p>
                      <p><strong>Ventajas:</strong> Mejor solución inicial entre métodos heurísticos.</p>
                      <p><strong>Desventajas:</strong> Más complejo de calcular.</p>
                    </div>
                  )}
                  {method === 'decision' && (
                    <div className="text-gray-700 space-y-2">
                      <p><strong>Teoría de Decisiones:</strong></p>
                      {decisionMethod === 'laplace' && (
                        <>
                          <p><strong>Laplace:</strong> Asume equiprobabilidad en todos los estados.</p>
                          <p>Calcula promedio y selecciona el mayor.</p>
                        </>
                      )}
                      {decisionMethod === 'maximin' && (
                        <>
                          <p><strong>Maximin:</strong> Criterio pesimista.</p>
                          <p>Identifica el peor caso de cada alternativa y elige el mejor de esos.</p>
                        </>
                      )}
                      {decisionMethod === 'maximax' && (
                        <>
                          <p><strong>Maximax:</strong> Criterio optimista.</p>
                          <p>Identifica el mejor caso de cada alternativa y elige el máximo.</p>
                        </>
                      )}
                      {decisionMethod === 'savage' && (
                        <>
                          <p><strong>Savage:</strong> Minimiza arrepentimiento.</p>
                          <p>Crea matriz de arrepentimiento y selecciona el menor arrepentimiento máximo.</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}