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

#### Metrics: Prometheus Client
- **Prometheus Client**:
  - Standard metrics format for monitoring
  - Easy integration with Prometheus monitoring system
  - Support for custom metrics and labels
  - Efficient metric collection and export
  - Perfect for monitoring application performance and health

#### Tracing: OpenTelemetry Collector
- **OpenTelemetry Collector**:
  - Standardized observability framework
  - Support for distributed tracing
  - Easy integration with various backends
  - Automatic instrumentation capabilities
  - Perfect for understanding request flow and performance bottlenecks

### Containerization: Docker
- **Docker**:
  - Consistent environments across development and production
  - Easy service orchestration with Docker Compose
  - Isolated services with dedicated networks
  - Health checks and dependency management
  - Volume mounting for configuration and logs
  - Multi-stage builds for optimized images

## Features

- Convert numbers between 1 and 3999 to Roman numerals
- Modern, responsive UI with real-time conversion
- Comprehensive observability:
  - Metrics collection and monitoring
  - Distributed tracing
  - Structured logging
- Error handling and input validation
- CORS support for frontend-backend communication

## Project Structure

```
roman-numeral-converter/
├── frontend/           # React frontend application
│   ├── public/        # Static files
│   └── src/           # React source code
└── backend/           # Node.js/Express backend
    ├── observability/ # Logging, metrics, and tracing
    └── server.ts      # Main server file
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd roman-numeral-converter
   ```

2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd ../backend
   npm install
   ```

## Running the Application

1. Start the backend server:
   ```bash
   cd backend
   npm start
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

### Metrics
- HTTP request counts
- Response times
- Error rates
- Available at `/metrics` endpoint

### Tracing
- Distributed tracing with OpenTelemetry
- Console span exporter for development
- Automatic instrumentation of Express routes

## Error Handling

- Input validation for numbers (1-3999 range)
- Proper error responses with status codes
- Error logging with stack traces
- User-friendly error messages

## Development

### Frontend
- Built with React and TypeScript
- Responsive design
- Real-time conversion
- Error handling and validation

### Backend
- Node.js with Express
- TypeScript for type safety
- Comprehensive observability
- RESTful API design

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
