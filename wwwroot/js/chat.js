// Funzione per inviare il messaggio a Ollama
function sendMessage() {
    const userInput = document.getElementById('chatInput').value;
    if (!userInput.trim()) return;

    appendMessage('Utente', userInput);
    document.getElementById('chatInput').value = '';
      
    fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: 'llama3.2',
            prompt: userInput,
            stream: false,                  // Disattiva lo streaming per ottenere la risposta completa subito
            temperature: 0.3,               // Risposte più precise e meno creative
            max_tokens: 50,                 // Risposte brevi
            top_p: 0.8,                     // Limita la scelta delle parole più probabili
            frequency_penalty: 0.5,         // Riduce la ripetizione di parole
            presence_penalty: 0.2          // Favorisce risposte concise senza troppa ripetizione
        })
    })
        .then(response => response.json())
        .then(data => {
            appendMessage('Ollama', data.response);
        })
        .catch(error => {
            console.error('Errore nella richiesta:', error);
            appendMessage('Errore', 'Non sono riuscito a contattare Ollama.');
        });
}

// Funzione per aggiungere i messaggi alla chat
function appendMessage(sender, message) {
    const chatMessages = document.getElementById('chatMessages');
    const messageElement = document.createElement('div');
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}