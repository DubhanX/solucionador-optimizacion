import React, { useState } from 'react';
import { FileText, Calculator, Grid, ChevronDown, ChevronRight } from 'lucide-react';

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
  const [objType, setObjType] = useState('min');

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
    const log = [];
    
    let i = 0, j = 0;
    while (i < rows && j < cols) {
      const amt = Math.min(sup[i], dem[j]);
      alloc[i][j] = amt;
      log.push(`Celda [${i+1},${j+1}]: ${amt} unidades`);
      sup[i] -= amt;
      dem[j] -= amt;
      if (sup[i] === 0) i++;
      if (dem[j] === 0) j++;
    }
    
    const total = alloc.reduce((s, r, i) => s + r.reduce((rs, v, j) => rs + v * costs[i][j], 0), 0);
    setSteps(log);
    setSolution({ alloc, total, name: 'Noroeste' });
  };

  const solveMin = () => {
    const alloc = Array(rows).fill().map(() => Array(cols).fill(0));
    const sup = [...supply];
    const dem = [...demand];
    const log = [];
    
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
      log.push(`Celda [${minI+1},${minJ+1}]: ${amt} unidades (costo ${minC})`);
      sup[minI] -= amt;
      dem[minJ] -= amt;
    }
    
    const total = alloc.reduce((s, r, i) => s + r.reduce((rs, v, j) => rs + v * costs[i][j], 0), 0);
    setSteps(log);
    setSolution({ alloc, total, name: 'Costo Mínimo' });
  };

  const solveVogel = () => {
    const alloc = Array(rows).fill().map(() => Array(cols).fill(0));
    const sup = [...supply];
    const dem = [...demand];
    const log = [];
    
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
      log.push(`Celda [${minI+1},${minJ+1}]: ${amt} unidades`);
      sup[minI] -= amt;
      dem[minJ] -= amt;
    }
    
    const total = alloc.reduce((s, r, i) => s + r.reduce((rs, v, j) => rs + v * costs[i][j], 0), 0);
    setSteps(log);
    setSolution({ alloc, total, name: 'Vogel' });
  };

  const solve = () => {
    const tSup = supply.reduce((a, b) => a + b, 0);
    const tDem = demand.reduce((a, b) => a + b, 0);
    if (tSup !== tDem) {
      alert(`Error: Oferta (${tSup}) ≠ Demanda (${tDem})`);
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
    let csv = `Método,${solution.name}\nCosto Total,${solution.total}\n\n`;
    solution.alloc.forEach((r, i) => {
      csv += `O${i+1},${r.join(',')}\n`;
    });
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
            Solucionador de Transporte
          </h1>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {['noroeste', 'minimo', 'vogel'].map(m => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={`p-6 rounded-xl font-semibold transition ${
                method === m ? 'bg-indigo-600 text-white scale-105' : 'bg-white text-gray-700'
              }`}
            >
              {m === 'noroeste' ? 'Esquina Noroeste' : m === 'minimo' ? 'Costo Mínimo' : 'Vogel'}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="bg-purple-50 rounded-lg p-6 mb-6 border-2 border-purple-200">
            <button
              onClick={() => setShowObj(!showObj)}
              className="w-full flex justify-between items-center"
            >
              <h3 className="text-xl font-bold text-purple-900 flex items-center gap-2">
                <Calculator className="w-6 h-6" />
                Función Objetivo
              </h3>
              {showObj ? <ChevronDown className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
            </button>
            
            {showObj && (
              <div className="mt-4 space-y-4">
                <select
                  value={objType}
                  onChange={(e) => setObjType(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-purple-300 rounded-lg"
                >
                  <option value="min">Minimizar Costos</option>
                  <option value="max">Maximizar Beneficios</option>
                </select>

                <div className="bg-white rounded p-4 border-2 border-purple-200">
                  <h4 className="font-bold text-purple-900 mb-2">Función:</h4>
                  <div className="bg-purple-50 p-3 rounded text-sm overflow-x-auto">
                    {objType === 'min' ? 'Min' : 'Max'} Z = 
                    {costs.map((row, i) => row.map((c, j) => (
                      <span key={`${i}${j}`}>
                        {i === 0 && j === 0 ? ' ' : ' + '}
                        <b className="text-purple-700">{c}</b>
                        <span className="text-indigo-600">X{i+1}{j+1}</span>
                      </span>
                    )))}
                  </div>
                </div>

                <div className="bg-white rounded p-4 border-2 border-purple-200">
                  <h4 className="font-bold text-purple-900 mb-2">Variables:</h4>
                  <p className="text-sm bg-indigo-50 p-2 rounded">
                    Xij = Unidades del origen i al destino j
                  </p>
                </div>

                <div className="bg-white rounded p-4 border-2 border-purple-200">
                  <h4 className="font-bold text-purple-900 mb-2">Restricciones:</h4>
                  <div className="text-xs space-y-2 max-h-40 overflow-y-auto">
                    <div>
                      <p className="font-semibold mb-1">Oferta:</p>
                      {supply.map((s, i) => (
                        <p key={i} className="bg-yellow-50 p-1 rounded mb-1">
                          {Array(cols).fill().map((_, j) => `X${i+1}${j+1}`).join(' + ')} = {s}
                        </p>
                      ))}
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Demanda:</p>
                      {demand.map((d, j) => (
                        <p key={j} className="bg-blue-50 p-1 rounded mb-1">
                          {Array(rows).fill().map((_, i) => `X${i+1}${j+1}`).join(' + ')} = {d}
                        </p>
                      ))}
                    </div>
                    <p className="bg-green-50 p-1 rounded">Xij ≥ 0</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Orígenes</label>
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
              <label className="block text-sm font-medium mb-2">Destinos</label>
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
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border bg-gray-100 p-2"></th>
                  {Array(cols).fill().map((_, j) => (
                    <th key={j} className="border bg-indigo-100 p-2">D{j+1}</th>
                  ))}
                  <th className="border bg-yellow-100 p-2">Oferta</th>
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
            className="w-full bg-indigo-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-indigo-700"
          >
            Resolver Problema
          </button>
        </div>

        {solution && (
          <div className="bg-white rounded-xl shadow-xl p-8 mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Solución</h2>
              <div className="flex gap-3">
                <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg">
                  <FileText className="w-5 h-5" />
                  PDF
                </button>
                <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg">
                  <Grid className="w-5 h-5" />
                  CSV
                </button>
              </div>
            </div>

            <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 mb-6">
              <p className="text-sm font-semibold text-indigo-700">
                Objetivo: {objType === 'min' ? 'Minimizar' : 'Maximizar'} Costos
              </p>
              <p className="text-lg font-semibold text-indigo-900">Método: {solution.name}</p>
              <p className="text-2xl font-bold text-indigo-900 mt-2">
                Costo Total: ${solution.total.toFixed(2)}
              </p>
            </div>

            <h3 className="text-xl font-bold mb-4">Matriz de Asignación</h3>
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border bg-gray-100 p-3"></th>
                    {Array(cols).fill().map((_, j) => (
                      <th key={j} className="border bg-indigo-100 p-3">D{j+1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {solution.alloc.map((row, i) => (
                    <tr key={i}>
                      <td className="border bg-indigo-100 p-3 font-semibold">O{i+1}</td>
                      {row.map((v, j) => (
                        <td key={j} className={`border p-3 text-center font-semibold ${v > 0 ? 'bg-green-100' : 'bg-gray-50'}`}>
                          {v > 0 ? v : '-'}
                          {v > 0 && <span className="block text-xs text-gray-600">(${(v * costs[i][j]).toFixed(2)})</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-bold mb-4">Paso a Paso</h3>
            <div className="space-y-3">
              {steps.map((step, i) => (
                <div key={i} className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
                  <p className="text-gray-700">{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}