# Portfolio Backend

Express.js backend for Om Prakash's portfolio contact form.

## Features

- 📧 Contact form submission handling
- 🗄️ MongoDB Atlas integration
- 📧 Email notifications (configurable)
- 🛡️ Rate limiting and validation
- 🔒 Security headers and CORS

## API Endpoints

- `POST /api/contact/submit` - Submit contact form
- `GET /api/contact/stats` - Get submission statistics
- `GET /api/contact/all` - Get all submissions

## Environment Variables

Create a `config.env` file with:
- `MONGODB_URI` - MongoDB Atlas connection string
- `GMAIL_USER` - Gmail address for notifications
- `GMAIL_PASS` - Gmail app password
- `PORT` - Server port (default: 5000)

## Running

```bash
npm install
node server.js
``` 