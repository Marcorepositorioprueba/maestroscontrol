/**
 * Maneja el envío del formulario de registro de horas a un Google Apps Script.
 * VERSIÓN FINAL: Corregido el formato de fecha para máxima compatibilidad.
 */
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registro-form');
    const messageDiv = document.getElementById('form-message');
    const submitButton = document.getElementById('submit-button');

    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzHy5Sm3vikStH6HWaGJEIPBC1ksX5FiqDI-0M8Qqyxu68jgBYPI7TyjOtAsKTklJwnCw/exec';

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // 1. --- VALIDACIÓN DE DATOS ---
        const horaEntrada = form.querySelector('#horaEntrada').value;
        const horaSalida = form.querySelector('#horaSalida').value;
        const checkedGroups = form.querySelectorAll('input[name="grupos"]:checked');

        if (horaSalida <= horaEntrada) {
            showMessage('La hora de salida debe ser posterior a la hora de entrada.', 'error');
            return;
        }

        if (checkedGroups.length === 0) {
            showMessage('Por favor, seleccione al menos un grupo atendido.', 'error');
            return;
        }
        
        if (!confirm('¿Confirmas que los datos son correctos para el registro?')) {
            return;
        }

        // 2. --- PREPARACIÓN DE DATOS ---
        setLoadingState(true);

        const gruposValue = Array.from(checkedGroups).map(cb => cb.value).join(', ');

        // Crear el objeto de datos que se enviará.
        // Los nombres de las propiedades coinciden EXACTAMENTE con lo que espera el Google Apps Script.
        const dataPayload = {
            nombreMaestro: form.querySelector('#nombreMaestro').value,
            horaEntrada: horaEntrada,
            horaSalida: horaSalida,
            // LA CORRECCIÓN CLAVE ESTÁ AQUÍ:
            // Se envía la fecha directamente en formato YYYY-MM-DD. Es universal y evita errores de región.
            fecha: form.querySelector('#fecha').value,
            gruposAtendidos: gruposValue 
        };

        // 3. --- ENVÍO DE DATOS (FETCH) ---
        fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(dataPayload)
        })
        .then(response => response.json())
        .then(handleResponse)
        .catch(handleError)
        .finally(() => {
            setLoadingState(false);
        });
    });

    function setLoadingState(isLoading) {
        submitButton.disabled = isLoading;
        submitButton.textContent = isLoading ? 'Enviando...' : 'Registrar Jornada';
    }

    function showMessage(message, type) {
        messageDiv.textContent = message;
        messageDiv.className = type;
        messageDiv.style.display = 'block';
    }

    function handleResponse(data) {
        if (data.status === 'success') {
            showMessage('¡Registro guardado con éxito!', 'success');
            form.reset();
        } else {
            throw new Error(data.message || 'El script de Google devolvió un error.');
        }
    }

    function handleError(error) {
        showMessage(`Error al enviar el registro: ${error.message}`, 'error');
        console.error('Error en el fetch:', error);
    }
});
