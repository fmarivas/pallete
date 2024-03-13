require('dotenv').config(); // Corrigi o método para carregar as variáveis de ambiente

const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "genius pallete",
      version: "1.0.0",
      description: "Documentação da GENIUSPALETTE",
    },
    servers: [
      // {
        // url: process.env.SWAGGER_BASE_URL || "http://localhost:3000",
        // description: "Servidor de Desenvolvimento",
      // },
      {
        url: process.env.PRODUCTION_BASE_URL || "http://localhost:3000",
        description: "Servidor de Produção",
      },
    ],
  },
  apis: ["./api/routes.js"], // Caminho para os arquivos contendo as rotas do seu API
};

const specs = swaggerJSDoc(swaggerOptions);

module.exports = { specs, swaggerUi };
