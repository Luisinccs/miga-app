function cargarFlujosDesdeCSV(elementoDOM, urlCSV) {
    fetch(urlCSV)
        .then(response => response.text())
        .then(csv => {
            const filas = csv.split('\n');
            const encabezados = filas[0].split(','); // Obtener encabezados
            for (let i = 1; i < filas.length; i++) { // Empezar desde la segunda fila (datos)
                const valores = filas[i].split(',');
                if (valores.length === encabezados.length) { // Asegurarse de tener todas las columnas
                    const flujo = {
                        fecha: valores[0],
                        descripcion: valores[1],
                        monto: parseFloat(valores[2]),
                        saldo: parseFloat(valores[3])
                    };

                    // Crear elementos HTML para cada fila
                    const filaDOM = document.createElement('div');
                    filaDOM.classList.add('data-row'); // Agregar clase para estilos

                    const fechaDOM = document.createElement('div');
                    fechaDOM.textContent = flujo.fecha;
                    filaDOM.appendChild(fechaDOM);

                    const descripcionDOM = document.createElement('div');
                    descripcionDOM.textContent = flujo.descripcion;
                    filaDOM.appendChild(descripcionDOM);

                    const montoDOM = document.createElement('div');
                    montoDOM.textContent = flujo.monto;
                    montoDOM.classList.add('monto');
                    filaDOM.appendChild(montoDOM);
                    const valor = parseFloat(flujo.monto);
                    // console.log(valor);
                    if (valor >= 0) {
                        montoDOM.classList.add('positivo');
                    } else {
                        montoDOM.classList.add('negativo');
                    }

                    const saldoDOM = document.createElement('div');
                    saldoDOM.textContent = flujo.saldo;
                    filaDOM.appendChild(saldoDOM);

                    elementoDOM.appendChild(filaDOM);
                }
            }
        })
        .catch(error => console.error('Error al cargar el archivo CSV:', error));
}
