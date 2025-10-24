# Revenue Automation Frontend

A modern React + TypeScript + Tailwind CSS frontend for the Revenue Automation platform by Maximor AI.

## Features

- **Contract Upload**: Drag-and-drop file upload with validation
- **Dashboard**: View contracts, revenue schedules, and audit memos
- **Modern UI**: Clean, minimal design with Tailwind CSS
- **TypeScript**: Full type safety throughout the application
- **Responsive**: Works on desktop and mobile devices

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Fetch API** for HTTP requests

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Backend API running on port 8000

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open [http://localhost:5173](http://localhost:5173) in your browser

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/
│   ├── ContractUpload.tsx    # File upload component
│   └── Dashboard.tsx         # Main dashboard
├── services/
│   └── api.ts               # API service layer
├── App.tsx                  # Main app component
├── main.tsx                 # App entry point
└── index.css               # Global styles with Tailwind
```

## API Integration

The frontend communicates with the backend API through the `ApiService` class in `src/services/api.ts`. The API endpoints include:

- `POST /contracts/upload` - Upload contract files
- `GET /contracts` - List all contracts
- `GET /contracts/{id}` - Get contract details
- `GET /contracts/{id}/revenue-schedules` - Get revenue schedules
- `GET /contracts/{id}/audit-memos` - Get audit memos

## Development

The project uses Vite for development with hot module replacement. The development server is configured to proxy API requests to the backend running on port 8000.

## Styling

The project uses Tailwind CSS with a custom color palette optimized for financial applications:

- **Primary**: Blue tones for main actions
- **Success**: Green tones for completed states
- **Warning**: Yellow tones for pending states
- **Danger**: Red tones for errors

## Contributing

1. Follow the existing code style and patterns
2. Use TypeScript for all new code
3. Add proper error handling
4. Test your changes thoroughly
5. Update documentation as needed
