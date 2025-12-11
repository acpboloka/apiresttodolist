// server.js - API RESTful com Express e Swagger
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Banco de dados em memória (simples para o projeto)
let tasks = [
  { id: 1, title: 'Tarefa Exemplo', description: 'Primeira tarefa', completed: false, createdAt: new Date().toISOString() }
];
let nextId = 2;

// Documentação Swagger
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'API de Gerenciamento de Tarefas',
    version: '1.0.0',
    description: 'Sistema CRUD completo para gerenciar tarefas'
  },
  servers: [
    { url: 'http://localhost:3000', description: 'Servidor Local' },
    { url: 'https://sua-api.vercel.app', description: 'Servidor Produção' }
  ],
  paths: {
    '/api/tasks': {
      get: {
        summary: 'Listar todas as tarefas',
        tags: ['Tarefas'],
        responses: {
          200: {
            description: 'Lista de tarefas retornada com sucesso',
            content: {
              'application/json': {
                example: {
                  success: true,
                  data: [
                    { id: 1, title: 'Tarefa 1', description: 'Descrição', completed: false }
                  ],
                  total: 1
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Criar nova tarefa',
        tags: ['Tarefas'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title'],
                properties: {
                  title: { type: 'string', example: 'Minha tarefa' },
                  description: { type: 'string', example: 'Descrição da tarefa' },
                  completed: { type: 'boolean', example: false }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Tarefa criada com sucesso' },
          400: { description: 'Dados inválidos' }
        }
      }
    },
    '/api/tasks/{id}': {
      get: {
        summary: 'Buscar tarefa por ID',
        tags: ['Tarefas'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Tarefa encontrada' },
          404: { description: 'Tarefa não encontrada' }
        }
      },
      put: {
        summary: 'Atualizar tarefa',
        tags: ['Tarefas'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  completed: { type: 'boolean' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Tarefa atualizada' },
          404: { description: 'Tarefa não encontrada' }
        }
      },
      delete: {
        summary: 'Deletar tarefa',
        tags: ['Tarefas'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Tarefa deletada' },
          404: { description: 'Tarefa não encontrada' }
        }
      }
    }
  }
};

// Rota do Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'API de Gerenciamento de Tarefas',
    documentation: '/api-docs',
    endpoints: {
      'GET /api/tasks': 'Listar todas as tarefas',
      'GET /api/tasks/:id': 'Buscar tarefa por ID',
      'POST /api/tasks': 'Criar nova tarefa',
      'PUT /api/tasks/:id': 'Atualizar tarefa',
      'DELETE /api/tasks/:id': 'Deletar tarefa'
    }
  });
});

// CREATE - Criar nova tarefa
app.post('/api/tasks', (req, res) => {
  const { title, description, completed } = req.body;
  
  if (!title) {
    return res.status(400).json({
      success: false,
      message: 'O campo "title" é obrigatório'
    });
  }

  const newTask = {
    id: nextId++,
    title,
    description: description || '',
    completed: completed || false,
    createdAt: new Date().toISOString()
  };

  tasks.push(newTask);

  res.status(201).json({
    success: true,
    message: 'Tarefa criada com sucesso',
    data: newTask
  });
});

// READ - Listar todas as tarefas
app.get('/api/tasks', (req, res) => {
  res.json({
    success: true,
    data: tasks,
    total: tasks.length
  });
});

// READ - Buscar tarefa por ID
app.get('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find(t => t.id === id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Tarefa não encontrada'
    });
  }

  res.json({
    success: true,
    data: task
  });
});

// UPDATE - Atualizar tarefa
app.put('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const taskIndex = tasks.findIndex(t => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Tarefa não encontrada'
    });
  }

  const { title, description, completed } = req.body;
  
  tasks[taskIndex] = {
    ...tasks[taskIndex],
    ...(title !== undefined && { title }),
    ...(description !== undefined && { description }),
    ...(completed !== undefined && { completed }),
    updatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    message: 'Tarefa atualizada com sucesso',
    data: tasks[taskIndex]
  });
});

// DELETE - Deletar tarefa
app.delete('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const taskIndex = tasks.findIndex(t => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Tarefa não encontrada'
    });
  }

  const deletedTask = tasks.splice(taskIndex, 1)[0];

  res.json({
    success: true,
    message: 'Tarefa deletada com sucesso',
    data: deletedTask
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📚 Documentação: http://localhost:${PORT}/api-docs`);
});