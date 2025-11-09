import React, { useState } from 'react';
import { Download, FileText, HelpCircle, ChevronRight, Calculator, Grid } from 'lucide-react';

const App = () => {
  const [method, setMethod] = useState('noroeste');
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [costs, setCosts] = useState(Array(3).fill().map(() => Array(3).fill(0)));
  const [supply, setSupply] = useState(Array(3).fill(0));
  const [demand, setDemand] = useState(Array(3).fill(0));
  const [solution, setSolution] = useState(null);
  const [steps, setSteps] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);

  // Teoría de decisiones
  const [criteria, setCriteria] = useState(['Criterio 1', 'Criterio 2']);
  const [alternatives, setAlternatives] = useState(['Alternativa 1', 'Alternativa 2']);
  const [decisionMatrix, setDecisionMatrix] = useState(Array(2).fill().map(() => Array(2).fill(0)));
  const [decisionMethod, setDecisionMethod] = useState('laplace');

  const updateDimensions = (newRows, newCols) => {
    setRows(newRows);
    setCols(newCols);
    setCosts(Array(newRows).fill().map(() => Array(newCols).fill(0)));
    setSupply(Array(newRows).fill(0));
    setDemand(Array(newCols).fill(0));
  };

  const updateCost = (i, j, value) => {
    const newCosts = [...costs];
    newCosts[i][j] = parseFloat(value) || 0;
    setCosts(newCosts);
  };

  const updateSupply = (i, value) => {
    const newSupply = [...supply];
    newSupply[i] = parseFloat(value) || 0;
    setSupply(newSupply);
  };

  const updateDemand = (j, value) => {
    const newDemand = [...demand];
    newDemand[j] = parseFloat(value) || 0;
    setDemand(newDemand);
  };

  // Método de la Esquina Noroeste
  const solveNorthwest = () => {
    const stepsLog = [];
    const allocation = Array(rows).fill().map(() => Array(cols).fill(0));
    const supplyLeft = [...supply];
    const demandLeft = [...demand];
    
    stepsLog.push({
      title: "Inicio del Método de la Esquina Noroeste",
      description: "Comenzamos desde la celda superior izquierda (esquina noroeste) y asignamos la máxima cantidad posible."
    });

    let i = 0, j = 0;
    let stepNum = 1;

    while (i < rows && j < cols) {
      const allocAmount = Math.min(supplyLeft[i], demandLeft[j]);
      allocation[i][j] = allocAmount;
      
      stepsLog.push({
        title: `Paso ${stepNum}`,
        description: `Celda [${i + 1},${j + 1}]: Asignamos ${allocAmount} unidades (mín entre oferta=${supplyLeft[i]} y demanda=${demandLeft[j]}). Costo unitario: ${costs[i][j]}`
      });

      supplyLeft[i] -= allocAmount;
      demandLeft[j] -= allocAmount;

      if (supplyLeft[i] === 0) i++;
      if (demandLeft[j] === 0) j++;
      stepNum++;
    }

    const totalCost = allocation.reduce((sum, row, i) => 
      sum + row.reduce((rowSum, val, j) => rowSum + val * costs[i][j], 0), 0
    );

    stepsLog.push({
      title: "Resultado Final",
      description: `Costo total de transporte: $${totalCost.toFixed(2)}`
    });

    setSteps(stepsLog);
    setSolution({ allocation, totalCost, method: 'Esquina Noroeste' });
  };

  // Método de Costo Mínimo
  const solveMinimumCost = () => {
    const stepsLog = [];
    const allocation = Array(rows).fill().map(() => Array(cols).fill(0));
    const supplyLeft = [...supply];
    const demandLeft = [...demand];
    
    stepsLog.push({
      title: "Inicio del Método de Costo Mínimo",
      description: "Seleccionamos siempre la celda con el menor costo disponible y asignamos la máxima cantidad posible."
    });

    let stepNum = 1;

    while (supplyLeft.some(s => s > 0) && demandLeft.some(d => d > 0)) {
      let minCost = Infinity;
      let minI = -1, minJ = -1;

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          if (supplyLeft[i] > 0 && demandLeft[j] > 0 && costs[i][j] < minCost) {
            minCost = costs[i][j];
            minI = i;
            minJ = j;
          }
        }
      }

      if (minI === -1) break;

      const allocAmount = Math.min(supplyLeft[minI], demandLeft[minJ]);
      allocation[minI][minJ] = allocAmount;

      stepsLog.push({
        title: `Paso ${stepNum}`,
        description: `Celda [${minI + 1},${minJ + 1}]: Costo mínimo = ${minCost}. Asignamos ${allocAmount} unidades (mín entre oferta=${supplyLeft[minI]} y demanda=${demandLeft[minJ]})`
      });

      supplyLeft[minI] -= allocAmount;
      demandLeft[minJ] -= allocAmount;
      stepNum++;
    }

    const totalCost = allocation.reduce((sum, row, i) => 
      sum + row.reduce((rowSum, val, j) => rowSum + val * costs[i][j], 0), 0
    );

    stepsLog.push({
      title: "Resultado Final",
      description: `Costo total de transporte: $${totalCost.toFixed(2)}`
    });

    setSteps(stepsLog);
    setSolution({ allocation, totalCost, method: 'Costo Mínimo' });
  };

  // Método de Vogel (Aproximación)
  const solveVogel = () => {
    const stepsLog = [];
    const allocation = Array(rows).fill().map(() => Array(cols).fill(0));
    const supplyLeft = [...supply];
    const demandLeft = [...demand];
    
    stepsLog.push({
      title: "Inicio del Método de Vogel (VAM)",
      description: "Calculamos las penalizaciones (diferencia entre los dos costos más bajos) para cada fila y columna, y seleccionamos la mayor penalización."
    });

    let stepNum = 1;

    while (supplyLeft.some(s => s > 0) && demandLeft.some(d => d > 0)) {
      const rowPenalties = [];
      const colPenalties = [];

      // Calcular penalizaciones de filas
      for (let i = 0; i < rows; i++) {
        if (supplyLeft[i] === 0) {
          rowPenalties.push(-1);
          continue;
        }
        const availableCosts = [];
        for (let j = 0; j < cols; j++) {
          if (demandLeft[j] > 0) availableCosts.push(costs[i][j]);
        }
        if (availableCosts.length >= 2) {
          availableCosts.sort((a, b) => a - b);
          rowPenalties.push(availableCosts[1] - availableCosts[0]);
        } else if (availableCosts.length === 1) {
          rowPenalties.push(availableCosts[0]);
        } else {
          rowPenalties.push(-1);
        }
      }

      // Calcular penalizaciones de columnas
      for (let j = 0; j < cols; j++) {
        if (demandLeft[j] === 0) {
          colPenalties.push(-1);
          continue;
        }
        const availableCosts = [];
        for (let i = 0; i < rows; i++) {
          if (supplyLeft[i] > 0) availableCosts.push(costs[i][j]);
        }
        if (availableCosts.length >= 2) {
          availableCosts.sort((a, b) => a - b);
          colPenalties.push(availableCosts[1] - availableCosts[0]);
        } else if (availableCosts.length === 1) {
          colPenalties.push(availableCosts[0]);
        } else {
          colPenalties.push(-1);
        }
      }

      // Encontrar máxima penalización
      let maxPenalty = -1;
      let isRow = true;
      let index = -1;

      rowPenalties.forEach((p, i) => {
        if (p > maxPenalty) {
          maxPenalty = p;
          isRow = true;
          index = i;
        }
      });

      colPenalties.forEach((p, j) => {
        if (p > maxPenalty) {
          maxPenalty = p;
          isRow = false;
          index = j;
        }
      });

      if (index === -1) break;

      // Encontrar celda de mínimo costo en la fila/columna seleccionada
      let minCost = Infinity;
      let minI = -1, minJ = -1;

      if (isRow) {
        for (let j = 0; j < cols; j++) {
          if (demandLeft[j] > 0 && costs[index][j] < minCost) {
            minCost = costs[index][j];
            minI = index;
            minJ = j;
          }
        }
      } else {
        for (let i = 0; i < rows; i++) {
          if (supplyLeft[i] > 0 && costs[i][index] < minCost) {
            minCost = costs[i][index];
            minI = i;
            minJ = index;
          }
        }
      }

      if (minI === -1) break;

      const allocAmount = Math.min(supplyLeft[minI], demandLeft[minJ]);
      allocation[minI][minJ] = allocAmount;

      stepsLog.push({
        title: `Paso ${stepNum}`,
        description: `Penalización máxima = ${maxPenalty.toFixed(2)} en ${isRow ? 'fila' : 'columna'} ${index + 1}. Celda [${minI + 1},${minJ + 1}]: Asignamos ${allocAmount} unidades. Costo: ${minCost}`
      });

      supplyLeft[minI] -= allocAmount;
      demandLeft[minJ] -= allocAmount;
      stepNum++;
    }

    const totalCost = allocation.reduce((sum, row, i) => 
      sum + row.reduce((rowSum, val, j) => rowSum + val * costs[i][j], 0), 0
    );

    stepsLog.push({
      title: "Resultado Final",
      description: `Costo total de transporte: $${totalCost.toFixed(2)}`
    });

    setSteps(stepsLog);
    setSolution({ allocation, totalCost, method: 'Vogel (VAM)' });
  };

  // Teoría de Decisiones
  const solveDecision = () => {
    const stepsLog = [];
    let result = {};

    stepsLog.push({
      title: `Método: ${decisionMethod.toUpperCase()}`,
      description: "Aplicando criterio de decisión seleccionado"
    });

    switch (decisionMethod) {
      case 'laplace':
        // Criterio de Laplace (equiprobabilidad)
        const avgValues = alternatives.map((_, i) => {
          const sum = decisionMatrix[i].reduce((a, b) => a + b, 0);
          return sum / decisionMatrix[i].length;
        });
        const maxAvgIdx = avgValues.indexOf(Math.max(...avgValues));
        
        stepsLog.push({
          title: "Criterio de Laplace",
          description: "Asume que todos los estados son equiprobables. Calculamos el promedio para cada alternativa."
        });
        
        alternatives.forEach((alt, i) => {
          stepsLog.push({
            title: `${alt}`,
            description: `Promedio = ${avgValues[i].toFixed(2)}`
          });
        });

        result = {
          method: 'Laplace',
          decision: alternatives[maxAvgIdx],
          value: avgValues[maxAvgIdx],
          details: avgValues
        };
        break;

      case 'maximin':
        // Criterio Maximin (pesimista)
        const minValues = alternatives.map((_, i) => Math.min(...decisionMatrix[i]));
        const maxMinIdx = minValues.indexOf(Math.max(...minValues));
        
        stepsLog.push({
          title: "Criterio Maximin (Wald)",
          description: "Criterio pesimista: selecciona el máximo de los mínimos."
        });
        
        alternatives.forEach((alt, i) => {
          stepsLog.push({
            title: `${alt}`,
            description: `Mínimo = ${minValues[i].toFixed(2)}`
          });
        });

        result = {
          method: 'Maximin',
          decision: alternatives[maxMinIdx],
          value: minValues[maxMinIdx],
          details: minValues
        };
        break;

      case 'maximax':
        // Criterio Maximax (optimista)
        const maxValues = alternatives.map((_, i) => Math.max(...decisionMatrix[i]));
        const maxMaxIdx = maxValues.indexOf(Math.max(...maxValues));
        
        stepsLog.push({
          title: "Criterio Maximax",
          description: "Criterio optimista: selecciona el máximo de los máximos."
        });
        
        alternatives.forEach((alt, i) => {
          stepsLog.push({
            title: `${alt}`,
            description: `Máximo = ${maxValues[i].toFixed(2)}`
          });
        });

        result = {
          method: 'Maximax',
          decision: alternatives[maxMaxIdx],
          value: maxValues[maxMaxIdx],
          details: maxValues
        };
        break;

      case 'savage':
        // Criterio de Savage (arrepentimiento)
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
        
        stepsLog.push({
          title: "Criterio de Savage",
          description: "Minimiza el arrepentimiento máximo. Calculamos matriz de arrepentimiento."
        });
        
        alternatives.forEach((alt, i) => {
          stepsLog.push({
            title: `${alt}`,
            description: `Arrepentimiento máximo = ${maxRegrets[i].toFixed(2)}`
          });
        });

        result = {
          method: 'Savage',
          decision: alternatives[minRegretIdx],
          value: maxRegrets[minRegretIdx],
          details: maxRegrets,
          regretMatrix
        };
        break;
    }

    stepsLog.push({
      title: "Decisión Final",
      description: `Mejor alternativa: ${result.decision} con valor ${result.value.toFixed(2)}`
    });

    setSteps(stepsLog);
    setSolution(result);
  };

  const solve = () => {
    if (method === 'decision') {
      solveDecision();
      return;
    }

    const totalSupply = supply.reduce((a, b) => a + b, 0);
    const totalDemand = demand.reduce((a, b) => a + b, 0);

    if (totalSupply !== totalDemand) {
      alert(`Error: La oferta total (${totalSupply}) debe ser igual a la demanda total (${totalDemand})`);
      return;
    }

    switch (method) {
      case 'noroeste':
        solveNorthwest();
        break;
      case 'minimo':
        solveMinimumCost();
        break;
      case 'vogel':
        solveVogel();
        break;
    }
  };

  const exportToPDF = () => {
    const content = document.getElementById('solution-content');
    if (!content) return;

    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Solución</title>');
    printWindow.document.write('<style>body{font-family:Arial,sans-serif;padding:20px}table{border-collapse:collapse;width:100%;margin:20px 0}td,th{border:1px solid #ddd;padding:8px;text-align:center}.step{margin:15px 0;padding:10px;border-left:3px solid #3b82f6}</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(content.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  const exportToExcel = () => {
    if (!solution) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (method === 'decision') {
      csvContent += "Teoría de Decisiones\n\n";
      csvContent += "Método," + solution.method + "\n";
      csvContent += "Decisión," + solution.decision + "\n";
      csvContent += "Valor," + solution.value + "\n\n";
      csvContent += "Matriz de Decisión\n";
      csvContent += "," + criteria.join(",") + "\n";
      alternatives.forEach((alt, i) => {
        csvContent += alt + "," + decisionMatrix[i].join(",") + "\n";
      });
    } else {
      csvContent += "Método," + solution.method + "\n";
      csvContent += "Costo Total," + solution.totalCost + "\n\n";
      csvContent += "Matriz de Asignación\n,";
      for (let j = 0; j < cols; j++) {
        csvContent += "Destino " + (j + 1) + ",";
      }
      csvContent += "\n";
      
      solution.allocation.forEach((row, i) => {
        csvContent += "Origen " + (i + 1) + ",";
        csvContent += row.join(",") + "\n";
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "solucion.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          <h1 className="text-4xl font-bold text-indigo-900 mb-2 flex items-center gap-3">
            <Calculator className="w-10 h-10" />
            Solucionador de Problemas de Optimización
          </h1>
          <p className="text-gray-600">Métodos de transporte y teoría de decisiones</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <button
            onClick={() => setMethod('noroeste')}
            className={`p-6 rounded-xl font-semibold transition-all ${
              method === 'noroeste'
                ? 'bg-indigo-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 hover:bg-indigo-50'
            }`}
          >
            Esquina Noroeste
          </button>
          <button
            onClick={() => setMethod('minimo')}
            className={`p-6 rounded-xl font-semibold transition-all ${
              method === 'minimo'
                ? 'bg-indigo-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 hover:bg-indigo-50'
            }`}
          >
            Costo Mínimo
          </button>
          <button
            onClick={() => setMethod('vogel')}
            className={`p-6 rounded-xl font-semibold transition-all ${
              method === 'vogel'
                ? 'bg-indigo-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 hover:bg-indigo-50'
            }`}
          >
            Método de Vogel
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
          <button
            onClick={() => setMethod('decision')}
            className={`w-full p-6 rounded-xl font-semibold transition-all ${
              method === 'decision'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-green-50 text-green-700 hover:bg-green-100'
            }`}
          >
            Teoría de Decisiones
          </button>
        </div>

        {method !== 'decision' ? (
          <div className="bg-white rounded-xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Configurar Problema de Transporte</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Orígenes (filas)</label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={rows}
                  onChange={(e) => updateDimensions(parseInt(e.target.value) || 2, cols)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Destinos (columnas)</label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={cols}
                  onChange={(e) => updateDimensions(rows, parseInt(e.target.value) || 2)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Matriz de Costos</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 bg-gray-100 p-2"></th>
                      {Array(cols).fill().map((_, j) => (
                        <th key={j} className="border border-gray-300 bg-indigo-100 p-2 font-semibold">
                          D{j + 1}
                        </th>
                      ))}
                      <th className="border border-gray-300 bg-yellow-100 p-2 font-semibold">Oferta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array(rows).fill().map((_, i) => (
                      <tr key={i}>
                        <td className="border border-gray-300 bg-indigo-100 p-2 font-semibold">O{i + 1}</td>
                        {Array(cols).fill().map((_, j) => (
                          <td key={j} className="border border-gray-300 p-1">
                            <input
                              type="number"
                              value={costs[i][j]}
                              onChange={(e) => updateCost(i, j, e.target.value)}
                              className="w-full px-2 py-1 text-center border-0 focus:ring-2 focus:ring-indigo-400 rounded"
                            />
                          </td>
                        ))}
                        <td className="border border-gray-300 p-1">
                          <input
                            type="number"
                            value={supply[i]}
                            onChange={(e) => updateSupply(i, e.target.value)}
                            className="w-full px-2 py-1 text-center bg-yellow-50 focus:ring-2 focus:ring-yellow-400 rounded font-semibold"
                          />
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td className="border border-gray-300 bg-yellow-100 p-2 font-semibold">Demanda</td>
                      {Array(cols).fill().map((_, j) => (
                        <td key={j} className="border border-gray-300 p-1">
                          <input
                            type="number"
                            value={demand[j]}
                            onChange={(e) => updateDemand(j, e.target.value)}
                            className="w-full px-2 py-1 text-center bg-yellow-50 focus:ring-2 focus:ring-yellow-400 rounded font-semibold"
                          />
                        </td>
                      ))}
                      <td className="border border-gray-300 bg-gray-100"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <button
              onClick={solve}
              className="w-full bg-indigo-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg"
            >
              Resolver Problema
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Teoría de Decisiones</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Método de Decisión</label>
              <select
                value={decisionMethod}
                onChange={(e) => setDecisionMethod(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="laplace">Laplace (Equiprobabilidad)</option>
                <option value="maximin">Maximin (Wald - Pesimista)</option>
                <option value="maximax">Maximax (Optimista)</option>
                <option value="savage">Savage (Arrepentimiento)</option>
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Número de Alternativas</label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={alternatives.length}
                  onChange={(e) => {
                    const n = parseInt(e.target.value) || 2;
                    setAlternatives(Array(n).fill().map((_, i) => `Alternativa ${i + 1}`));
                    setDecisionMatrix(Array(n).fill().map(() => Array(criteria.length).fill(0)));
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Número de Estados/Criterios</label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={criteria.length}
                  onChange={(e) => {
                    const n = parseInt(e.target.value) || 2;
                    setCriteria(Array(n).fill().map((_, i) => `Criterio ${i + 1}`));
                    setDecisionMatrix(decisionMatrix.map(row => 
                      Array(n).fill().map((_, j) => row[j] || 0)
                    ));
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Matriz de Decisión (Valores de Retorno)</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 bg-gray-100 p-2"></th>
                      {criteria.map((crit, j) => (
                        <th key={j} className="border border-gray-300 bg-green-100 p-2">
                          <input
                            type="text"
                            value={crit}
                            onChange={(e) => {
                              const newCriteria = [...criteria];
                              newCriteria[j] = e.target.value;
                              setCriteria(newCriteria);
                            }}
                            className="w-full px-2 py-1 text-center bg-transparent font-semibold focus:ring-2 focus:ring-green-400 rounded"
                          />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {alternatives.map((alt, i) => (
                      <tr key={i}>
                        <td className="border border-gray-300 bg-green-100 p-2">
                          <input
                            type="text"
                            value={alt}
                            onChange={(e) => {
                              const newAlts = [...alternatives];
                              newAlts[i] = e.target.value;
                              setAlternatives(newAlts);
                            }}
                            className="w-full px-2 py-1 text-center bg-transparent font-semibold focus:ring-2 focus:ring-green-400 rounded"
                          />
                        </td>
                        {criteria.map((_, j) => (
                          <td key={j} className="border border-gray-300 p-1">
                            <input
                              type="number"
                              value={decisionMatrix[i][j]}
                              onChange={(e) => {
                                const newMatrix = [...decisionMatrix];
                                newMatrix[i][j] = parseFloat(e.target.value) || 0;
                                setDecisionMatrix(newMatrix);
                              }}
                              className="w-full px-2 py-1 text-center border-0 focus:ring-2 focus:ring-green-400 rounded"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <button
              onClick={solve}
              className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors shadow-lg"
            >
              Resolver Decisión
            </button>
          </div>
        )}

        {solution && (
          <div className="bg-white rounded-xl shadow-xl p-8 mt-6" id="solution-content">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Solución</h2>
              <div className="flex gap-3">
                <button
                  onClick={exportToPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <FileText className="w-5 h-5" />
                  Exportar PDF
                </button>
                <button
                  onClick={exportToExcel}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Grid className="w-5 h-5" />
                  Exportar Excel
                </button>
                <button
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <HelpCircle className="w-5 h-5" />
                  {showExplanation ? 'Ocultar' : 'Mostrar'} Explicación
                </button>
              </div>
            </div>

            {method !== 'decision' ? (
              <>
                <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 mb-6">
                  <p className="text-lg font-semibold text-indigo-900">
                    Método: {solution.method}
                  </p>
                  <p className="text-2xl font-bold text-indigo-900 mt-2">
                    Costo Total: ${solution.totalCost.toFixed(2)}
                  </p>
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-4">Matriz de Asignación</h3>
                <div className="overflow-x-auto mb-6">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border border-gray-300 bg-gray-100 p-3"></th>
                        {Array(cols).fill().map((_, j) => (
                          <th key={j} className="border border-gray-300 bg-indigo-100 p-3 font-semibold">
                            Destino {j + 1}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {solution.allocation.map((row, i) => (
                        <tr key={i}>
                          <td className="border border-gray-300 bg-indigo-100 p-3 font-semibold">
                            Origen {i + 1}
                          </td>
                          {row.map((val, j) => (
                            <td
                              key={j}
                              className={`border border-gray-300 p-3 text-center font-semibold ${
                                val > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-50'
                              }`}
                            >
                              {val > 0 ? val : '-'}
                              {val > 0 && (
                                <span className="block text-xs text-gray-600 mt-1">
                                  (costo: ${(val * costs[i][j]).toFixed(2)})
                                </span>
                              )}
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
                  <p className="text-lg font-semibold text-green-900">
                    Método: {solution.method}
                  </p>
                  <p className="text-2xl font-bold text-green-900 mt-2">
                    Mejor Decisión: {solution.decision}
                  </p>
                  <p className="text-lg text-green-800 mt-1">
                    Valor: {solution.value.toFixed(2)}
                  </p>
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-4">Valores por Alternativa</h3>
                <div className="overflow-x-auto mb-6">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border border-gray-300 bg-gray-100 p-3">Alternativa</th>
                        <th className="border border-gray-300 bg-green-100 p-3">Valor Calculado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alternatives.map((alt, i) => (
                        <tr key={i} className={solution.decision === alt ? 'bg-green-50' : ''}>
                          <td className="border border-gray-300 p-3 font-semibold">
                            {alt}
                            {solution.decision === alt && (
                              <span className="ml-2 text-green-600">★ Mejor opción</span>
                            )}
                          </td>
                          <td className="border border-gray-300 p-3 text-center font-semibold">
                            {solution.details[i].toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {solution.regretMatrix && (
                  <>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Matriz de Arrepentimiento</h3>
                    <div className="overflow-x-auto mb-6">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr>
                            <th className="border border-gray-300 bg-gray-100 p-3"></th>
                            {criteria.map((crit, j) => (
                              <th key={j} className="border border-gray-300 bg-orange-100 p-3">
                                {crit}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {alternatives.map((alt, i) => (
                            <tr key={i}>
                              <td className="border border-gray-300 bg-orange-100 p-3 font-semibold">
                                {alt}
                              </td>
                              {solution.regretMatrix[i].map((val, j) => (
                                <td key={j} className="border border-gray-300 p-3 text-center">
                                  {val.toFixed(2)}
                                </td>
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
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <ChevronRight className="w-6 h-6" />
                  Paso a Paso
                </h3>
                <div className="space-y-4">
                  {steps.map((step, idx) => (
                    <div key={idx} className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
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
                      <p>Este método comienza en la celda superior izquierda (esquina noroeste) de la matriz de costos.</p>
                      <p>En cada paso, asigna la máxima cantidad posible (el mínimo entre la oferta disponible y la demanda requerida).</p>
                      <p>Luego se mueve hacia la derecha si se agota la demanda de esa columna, o hacia abajo si se agota la oferta de esa fila.</p>
                      <p><strong>Ventajas:</strong> Simple y rápido de calcular.</p>
                      <p><strong>Desventajas:</strong> No considera los costos, por lo que no garantiza la solución óptima.</p>
                    </div>
                  )}
                  {method === 'minimo' && (
                    <div className="text-gray-700 space-y-2">
                      <p><strong>Método del Costo Mínimo:</strong></p>
                      <p>Busca la celda con el costo unitario más bajo en toda la matriz.</p>
                      <p>Asigna la máxima cantidad posible a esa celda y elimina la fila o columna que se agote.</p>
                      <p>Repite el proceso con las celdas restantes hasta completar todas las asignaciones.</p>
                      <p><strong>Ventajas:</strong> Considera los costos y suele dar mejores soluciones que el método de la esquina noroeste.</p>
                      <p><strong>Desventajas:</strong> Aún no garantiza la solución óptima, pero es una buena aproximación.</p>
                    </div>
                  )}
                  {method === 'vogel' && (
                    <div className="text-gray-700 space-y-2">
                      <p><strong>Método de Vogel (VAM - Vogel's Approximation Method):</strong></p>
                      <p>Calcula la "penalización" para cada fila y columna (diferencia entre los dos costos más bajos).</p>
                      <p>Selecciona la fila o columna con la mayor penalización.</p>
                      <p>En esa fila/columna, asigna la máxima cantidad a la celda de menor costo.</p>
                      <p><strong>Ventajas:</strong> Generalmente proporciona la mejor solución inicial entre los métodos heurísticos.</p>
                      <p><strong>Desventajas:</strong> Más complejo de calcular que los otros métodos.</p>
                    </div>
                  )}
                  {method === 'decision' && (
                    <div className="text-gray-700 space-y-2">
                      <p><strong>Teoría de Decisiones:</strong></p>
                      {decisionMethod === 'laplace' && (
                        <>
                          <p><strong>Criterio de Laplace:</strong> Asume que todos los estados de la naturaleza son igualmente probables.</p>
                          <p>Calcula el promedio de cada alternativa y selecciona la que tenga el mayor promedio.</p>
                        </>
                      )}
                      {decisionMethod === 'maximin' && (
                        <>
                          <p><strong>Criterio Maximin (Wald):</strong> Enfoque pesimista o conservador.</p>
                          <p>Para cada alternativa, identifica el peor resultado posible (mínimo).</p>
                          <p>Selecciona la alternativa cuyo peor caso sea el mejor (maximizar el mínimo).</p>
                        </>
                      )}
                      {decisionMethod === 'maximax' && (
                        <>
                          <p><strong>Criterio Maximax:</strong> Enfoque optimista.</p>
                          <p>Para cada alternativa, identifica el mejor resultado posible (máximo).</p>
                          <p>Selecciona la alternativa con el mejor resultado posible (maximizar el máximo).</p>
                        </>
                      )}
                      {decisionMethod === 'savage' && (
                        <>
                          <p><strong>Criterio de Savage:</strong> Minimiza el arrepentimiento.</p>
                          <p>Crea una matriz de arrepentimiento restando cada valor del máximo de su columna.</p>
                          <p>Para cada alternativa, encuentra el máximo arrepentimiento.</p>
                          <p>Selecciona la alternativa con el menor arrepentimiento máximo.</p>
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
};

export default App;