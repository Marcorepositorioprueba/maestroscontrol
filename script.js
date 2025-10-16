document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('registro-form');
    const messageDiv = document.getElementById('form-message');
    const submitButton = document.getElementById('submit-button');
    
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxocVKHpC0iI5tS6tfS_uf1Fyp0sFhHzMn6j7923ImzoshiKaDWcnntgHCYgOT8kZZVWA/exec';

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // --- Lógica para los checkboxes ---
        const checkedGroups = form.querySelectorAll('input[name="grupos"]:checked');
        if (checkedGroups.length === 0) {
            messageDiv.textContent = 'Por favor, seleccione al menos un grupo.';
            messageDiv.className = 'error';
            messageDiv.style.display = 'block';
            return; // Detiene el envío si no se seleccionó ningún grupo
        }
        const gruposAtendidosValue = Array.from(checkedGroups).map(cb => cb.value).join(', ');
        // --- Fin de la lógica ---

        submitButton.disabled = true;
        submitButton.textContent = 'Enviando...';
        messageDiv.style.display = 'none';

        const formData = new FormData(form);
        // Añade nuestro valor combinado de grupos al FormData que se enviará
        formData.append('gruposAtendidos', gruposAtendidosValue);

        fetch(SCRIPT_URL, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                messageDiv.textContent = '¡Registro guardado con éxito!';
                messageDiv.className = 'success';
                form.reset();
            } else {
                throw new Error(data.message || 'Ocurrió un error desconocido.');
            }
        })
        .catch(error => {
            messageDiv.textContent = `Error al enviar el registro: ${error.message}`;
            messageDiv.className = 'error';
        })
        .finally(() => {
            messageDiv.style.display = 'block';
            submitButton.disabled = false;
            submitButton.textContent = 'Registrar Jornada';
        });
    });
});