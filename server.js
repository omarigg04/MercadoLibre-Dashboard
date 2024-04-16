require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const querystring = require('querystring');

const app = express();
const PORT = process.env.PORT;

// Habilitar CORS
app.use(cors());

app.get('/api/test', (req, res) => {
    res.send('Respuesta desde el backend');
    console.log('ok');
});


// Ruta para reenviar las solicitudes a la API externa
app.get('/api/orders', async (req, res) => {
  try {
    let offset = 0;
    const limit = 50; // Establecer el límite por página
    
    let allOrders = []; // Arreglo para almacenar todas las órdenes
    
    // Realizar solicitudes hasta que no haya más datos para recuperar
    while (true) {
      const response = await axios.get(`https://api.mercadolibre.com/orders/search?seller=${process.env.SELLER_ID}`, {
        params: {
          offset,
          limit
        },
        headers: {
          'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`
        }
      });
      
      const orders = response.data.results;
      
      if (orders.length === 0) {
        // No hay más datos, terminar el bucle
        break;
      }
      
      allOrders = allOrders.concat(orders);
      
      // Incrementar el offset para la siguiente página
      offset += limit;
    }
    
    // console.log(allOrders);
    res.json(allOrders);
  
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Error fetching orders' });
  }
});


app.get('/api/shipments/:shipmentId', async (req, res) => {
  try {
    const { shipmentId } = req.params;
    const url = `https://api.mercadolibre.com/shipments/${shipmentId}`;
    const headers = {
      'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`
    };

    const response = await axios.get(url, { headers });
    const listCost = response.data.shipping_option.list_cost; // Acceder al list_cost
    res.json({ listCost });
  } catch (error) {
    console.error(`Error fetching shipment info for shipment ID ${req.params.shipmentId}:`, error);
    res.status(error.response ? error.response.status : 500).json({ error: 'Error fetching shipment info' });
  }
});


// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

