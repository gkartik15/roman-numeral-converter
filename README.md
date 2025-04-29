# Roman Numeral Converter

A full-stack application that converts numbers to Roman numerals. The application consists of a React frontend and a Node.js/Express backend with comprehensive observability features.

## Technology Choices

### Backend: Node.js with Express
- **Node.js**: 
  - JavaScript runtime that allows us to use the same language (TypeScript) across the entire stack
  - Excellent performance for I/O-bound operations
  - Large ecosystem of packages and tools
  - Built-in support for asynchronous operations
  - Perfect for building scalable web applications

- **Express**:
  - Minimalist, flexible web framework for Node.js
  - Simple routing and middleware system
  - Large community and extensive documentation
  - Easy integration with various middleware and tools
  - Perfect for building RESTful APIs

### Frontend: React
- **React**:
  - Component-based architecture for reusable UI elements
  - Virtual DOM for efficient updates
  - Strong community support and extensive ecosystem
  - Excellent developer experience with TypeScript
  - Perfect for building interactive, single-page applications
  - Easy state management and data flow

### Observability Stack

#### Logging: Winston
- **Winston**:
  - Flexible logging library with multiple transport options
  - Support for different log levels and formats
  - Built-in support for log rotation and file management
  - Easy integration with other tools and services
  - Perfect for structured logging in production environments

#### Metrics: Prometheus
- **Prometheus**:
  - Open-source monitoring and alerting system
  - Time-series database for metrics
  - Powerful query language (PromQL)
  - Service discovery and target scraping
  - Perfect for monitoring application performance

#### Tracing: Jaeger
- **Jaeger**:
  - Open-source distributed tracing system
  - Support for OpenTelemetry
  - Real-time monitoring and debugging
  - Perfect for understanding request flow and performance bottlenecks

### Containerization: Docker
- **Docker**:
  - Consistent environments across development and production
  - Easy service orchestration with Docker Compose
  - Isolated services with dedicated networks
  - Health checks and dependency management
  - Volume mounting for configuration and logs
  - Multi-stage builds for optimized images
  - Environment-specific configurations

## Features

- Convert numbers between 1 and 3999 to Roman numerals
- Modern, responsive UI with real-time conversion
- Comprehensive observability:
  - Metrics collection and monitoring with Prometheus
  - Distributed tracing with Jaeger
  - Structured logging with Winston
- Error handling and input validation
- CORS support for frontend-backend communication
- Docker support for development and production environments

## Project Structure

```
roman-numeral-converter/
├── frontend/           # React frontend application
│   ├── public/        # Static files
│   ├── src/           # React source code
│   ├── nginx.conf     # Nginx configuration
│   └── Dockerfile     # Frontend Docker configuration
├── backend/           # Node.js/Express backend
│   ├── observability/ # Logging, metrics, and tracing
│   ├── server.ts      # Main server file
│   └── Dockerfile     # Backend Docker configuration
├── config/            # Configuration files
│   └── prometheus.yml # Prometheus configuration
├── logs/              # Application logs
│   └── otel/          # OpenTelemetry logs
└── docker-compose.yml # Docker Compose configuration
```

## Prerequisites

- Docker and Docker Compose
- Node.js (v14 or higher) and npm (for local development)

## Installation

### Docker Deployment (Recommended)

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd roman-numeral-converter
   ```

2. Build and start the containers:
   ```bash
   docker compose up --build
   ```

   This will:
   - Build the frontend and backend images
   - Set up the network between services
   - Mount necessary volumes
   - Start all services (frontend, backend, Jaeger, Prometheus)

### Local Development

1. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Install backend dependencies:
   ```bash
   cd ../backend
   npm install
   ```

## Running the Application

### Docker Environment (Recommended)

1. Development mode:
   ```bash
   docker compose up
   ```

   Services will be available at:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8080
   - Jaeger UI: http://localhost:16686
   - Prometheus: http://localhost:9090

### Local Development

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```
   The backend server will run on http://localhost:8080

2. Start the frontend development server:
   ```bash
   cd frontend
   npm start
   ```
   The frontend will be available at http://localhost:3000

## API Endpoints

### Backend API

- `GET /romannumeral?query=<number>`: Convert a number to Roman numeral
  - Query parameter: `query` (number between 1 and 3999)
  - Returns: JSON object with input and output
  - Example: `GET /romannumeral?query=42` returns `{"input": "42", "output": "XLII"}`

- `GET /metrics?format=pretty`: Prometheus metrics endpoint
  - Returns: Metrics in Prometheus format

## Observability

The application includes comprehensive observability features:

### Logging
- Logs are written to hourly rotating files in `logs/` directory
- Log rotation: 5MB maximum file size, 24-hour retention
- Structured logging with timestamps and metadata
- Separate files for error logs and application logs

### Metrics (Prometheus)
- HTTP request counts
- Response times
- Error rates
- Available at `/metrics` endpoint
- Scraped by Prometheus every 15 seconds

### Tracing (Jaeger)
- Distributed tracing with OpenTelemetry and Jaeger
- Automatic instrumentation of Express routes
- Trace visualization in Jaeger UI
- Service dependency analysis

## Error Handling

- Input validation for numbers (1-3999 range)
- Proper error responses with status codes
- Error logging with stack traces
- User-friendly error messages

## Development

### Frontend
- Built with React and TypeScript
- Responsive design with Adobe React Spectrum
- Real-time conversion
- Error handling and validation

### Backend
- Node.js with Express
- TypeScript for type safety
- Comprehensive observability
- RESTful API design

### Docker Development
- Multi-stage builds for optimized images
- Volume mounting for source code
- Health checks for services
- Network isolation
- Environment-specific configurations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
