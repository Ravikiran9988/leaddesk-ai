import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AI LeadDesk Mini - Enterprise API',
      version: '1.0.0',
      description:
        'Enterprise MERN CRM REST API with AI automated lead scoring, real-time Socket.IO, analytics, and authentication.',
      contact: {
        name: 'Digital Heroes Team',
        email: 'admin@leaddesk.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Provide JWT access token in authorization header (`Bearer <token>`)',
        },
      },
      schemas: {
        Lead: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '66a123456789abcdef012345' },
            name: { type: 'string', example: 'Sarah Jenkins' },
            email: { type: 'string', example: 'sarah.j@acme.com' },
            budget: { type: 'string', example: '$1000-$5000' },
            message: { type: 'string', example: 'We are looking for enterprise CRM integration.' },
            status: { type: 'string', example: 'Qualified' },
            source: { type: 'string', example: 'LinkedIn' },
            category: { type: 'string', example: 'Enterprise' },
            tags: { type: 'array', items: { type: 'string' }, example: ['Enterprise', 'High-Touch'] },
            assignedTo: { type: 'string', example: '66a987654321fedcba543210' },
            createdAt: { type: 'string', example: '2026-07-26T12:00:00.000Z' },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '66a987654321fedcba543210' },
            name: { type: 'string', example: 'Admin User' },
            email: { type: 'string', example: 'admin@example.com' },
            role: { type: 'string', example: 'admin' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Invalid credentials or resource not found' },
          },
        },
      },
    },
    paths: {
      '/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'Login admin/manager/sales user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', example: 'admin@example.com' },
                    password: { type: 'string', example: 'Admin123!' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Authenticated successfully' },
            401: { description: 'Invalid credentials' },
          },
        },
      },
      '/leads': {
        get: {
          tags: ['Leads'],
          summary: 'Fetch paginated and filtered leads',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
            { name: 'status', in: 'query', schema: { type: 'string' } },
            { name: 'search', in: 'query', schema: { type: 'string' } },
          ],
          responses: {
            200: { description: 'Leads fetched successfully' },
          },
        },
        post: {
          tags: ['Leads'],
          summary: 'Submit a new lead',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Lead' },
              },
            },
          },
          responses: {
            201: { description: 'Lead created successfully' },
          },
        },
      },
      '/leads/analytics': {
        get: {
          tags: ['Analytics'],
          summary: 'Get 8 KPI cards & 6 Recharts visualization datasets',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Analytics fetched successfully' },
          },
        },
      },
      '/health': {
        get: {
          tags: ['System'],
          summary: 'System health check endpoint',
          responses: {
            200: { description: 'System health metrics' },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app) => {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
