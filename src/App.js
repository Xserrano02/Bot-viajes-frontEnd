import React, { useState } from 'react';
import './App.css';
import { FaPlaneDeparture, FaPlaneArrival } from 'react-icons/fa';

function App() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte?' }
  ]);
  const [input, setInput] = useState('');
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (input.trim() === '') return;

    const newMessages = [...messages, { sender: 'user', text: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:4000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input
        })
      });

      const data = await response.json();

      if (data.flights) {
        const matches = input.match(/destino:\s*(\w+)/i);
        const destination = matches ? matches[1].toUpperCase() : null;

        const filteredFlights = destination
          ? data.flights.filter(flight => flight.arrival.iataCode === destination)
          : data.flights;

        setFlights(filteredFlights);
        setMessages([...newMessages, { sender: 'bot', text: `Se encontraron ${filteredFlights.length} vuelos para el destino ${destination}.` }]);
      } else {
        setFlights([]);
        setMessages([...newMessages, { sender: 'bot', text: data.reply }]);
      }
    } catch (error) {
      console.error('Error al obtener los vuelos:', error);
      setMessages([...newMessages, { sender: 'bot', text: 'Hubo un error al procesar tu solicitud.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App bg-gray-900 mx-auto text-gray-200 min-h-screen min-w-full flex flex-col">
      <h1 className="text-4xl font-bold text-center mb-8">Asistente de Vuelos</h1>

      <div className="chat-section mx-[20%] max-w-screen-lg mb-12">
        <div className="chat-window  bg-white shadow-md w-full rounded-lg p-6 h-[800px] flex flex-col">
          <div className="overflow-y-auto flex-grow">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message mb-4 p-4 rounded-lg text-lg ${msg.sender === 'bot' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'} `}
              >
                {msg.text}
              </div>
            ))}
          </div>
          {loading && <div className="text-center text-gray-500 mt-4">Cargando...</div>}
          <div className="input-area mt-4 flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu mensaje (e.g., destino: JFK)..."
              className="flex-grow border rounded-lg p-4 text-lg text-white focus:outline-none focus:ring focus:ring-blue-300 bg-gray-800"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSend();
                }
              }}
            />
            <button
              onClick={handleSend}
              className="ml-2 bg-blue-500 text-white px-6 py-2 rounded-lg text-lg hover:bg-blue-600"
            >
              Enviar
            </button>
          </div>
        </div>
      </div>

      {/* Flights Section */}
      {flights.length > 0 && (
        <div className="flights-section mx-auto max-w-screen-xl">
          <h2 className="text-3xl font-semibold mb-6 flex items-center gap-2">
            <FaPlaneDeparture className="text-blue-500" />
            Vuelos encontrados
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flights.map((flight, idx) => (
              <div key={idx} className="flight-card bg-white shadow-lg rounded-lg p-6 relative">
                <img
                  src="https://www.avionrevue.com/wp-content/uploads/2023/08/avianca-avion-volando.jpg"
                  alt="Imagen de vuelo"
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
                <p className="font-bold text-2xl text-gray-800 mb-2">{flight.airline}</p>
                <p className="text-gray-700 text-lg">
                  Precio: <span className="text-green-600 font-semibold">${flight.price}</span>
                </p>
                <div className="flex items-center gap-2 text-gray-700 text-lg mt-2">
                  <FaPlaneDeparture className="text-blue-500" />
                  <span>
                    Salida: {flight.departure.iataCode} - {formatDateTime(flight.departure.at)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 text-lg mt-2">
                  <FaPlaneArrival className="text-green-500" />
                  <span>
                    Llegada: {flight.arrival.iataCode} {flight.arrival.terminal ? `(Terminal ${flight.arrival.terminal})` : ''} - {formatDateTime(flight.arrival.at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatDateTime(dateTimeString) {
  const options = { dateStyle: 'short', timeStyle: 'short' };
  const date = new Date(dateTimeString);
  return date.toLocaleString('es-ES', options);
}

export default App;
