import swaggerJsdoc from "swagger-jsdoc";
const options = {
  definition: {
    openapi: "3.0.0", // OpenAPI version
    info: {
      title: "Room Management API",
      version: "1.0.0",
      description:
        "API documentation for managing hotels, cafés, and room bookings.",
    },
    servers: [
      {
        url: "http://localhost:5000", // Update based on your environment
        description: "Local development server",
      },
    ],
  },
  apis: ["../../app.js", "../routes/*.js"], // Paths where API routes are defined
};

export const swaggerSpec = swaggerJsdoc(options);

