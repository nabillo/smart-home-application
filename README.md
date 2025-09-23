<![CDATA[
<div align="center">
  <img src="https://images.pexels.com/photos/39284/macbook-apple-imac-computer-39284.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Smart Home Dashboard on a laptop screen" width="800" />
  <h1><b>AuraHome: Smart Home Management System</b></h1>
  <p>A modern, secure, and intuitive platform for managing and automating your smart home devices.</p>
  <p>
    <a href="#-key-features">Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-architecture">Architecture</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-api-documentation">API</a> •
    <a href="#-database-schema">Database</a>
  </p>
</div>

---

## ✨ Key Features

AuraHome is designed to be a robust central hub for your smart home ecosystem.

- **🔒 Secure Authentication:** JWT-based authentication ensures secure access to your home's controls.
- **👤 Role-Based Access Control (RBAC):** Granular permissions system with predefined roles (Admin, Member, Guest) to manage user access.
- **🏡 Multi-Home Management:** Seamlessly manage devices and users across multiple properties from a single account.
- **💡 Device Control & Monitoring:** A sleek dashboard to monitor device status, view historical data, and control smart lights, thermostats, locks, and more.
- **🤖 Powerful Automation Engine:** Create custom rules and scenes to automate your home based on triggers like time of day, sensor data, or device status.
- **📊 Real-time Data Visualization:** (In Development) Live dashboards and historical charts for sensor data like temperature, humidity, and energy consumption.

---

## 🛠️ Tech Stack

This project leverages a modern, type-safe, and performant technology stack for both the frontend and backend.

| Area          | Technology                                                                                                                            |
|---------------|---------------------------------------------------------------------------------------------------------------------------------------|
| **Frontend**  | [**React**](https://react.dev/) ([Vite](https://vitejs.dev/)), [**TypeScript**](https://www.typescriptlang.org/), [**Tailwind CSS**](https://tailwindcss.com/), [**Framer Motion**](https://www.framer.com/motion/), [**Lucide Icons**](https://lucide.dev/) |
| **Backend**   | [**Node.js**](https://nodejs.org/), [**Express.js**](https://expressjs.com/), [**JWT**](https://jwt.io/), [**bcryptjs**](https://github.com/dcodeIO/bcrypt.js)                                                              |
| **Database**  | [**PostgreSQL**](https://www.postgresql.org/) (hosted on [**Supabase**](https://supabase.com/))                                                                                                       |
| **Dev Tools** | [**ESLint**](https://eslint.org/), [**Nodemon**](https://nodemon.io/), [**Concurrently**](https://github.com/open-cli-tools/concurrently)                                                                                             |

---

## 🏗️ Architecture

The project is structured as a monorepo-like setup with two main components: a React frontend and a Node.js/Express backend.

- **`/` (Root):** The frontend application, built with Vite. It includes all UI components, pages, and client-side logic.
- **`/backend`:** The backend API server. It handles business logic, database interactions, and user authentication.

During development, [Vite's proxy server](https://vitejs.dev/config/server-options.html#server-proxy) is used to forward API requests from the frontend (e.g., `/api/login`) to the backend server running on `http://localhost:8080`, avoiding CORS issues.

---

## 🚀 Getting Started

Follow these steps to get the project running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18.x or later)
- [npm](https://www.npmjs.com/) (v9.x or later)

### Installation & Setup

1.  **Install Frontend Dependencies:**
    ```bash
    npm install
    ```

2.  **Install Backend Dependencies:**
    ```bash
    cd backend
    npm install
    ```

3.  **Configure Backend Environment:**
    - Navigate to the `/backend` directory.
    - Create a `.env` file by copying the example: `cp .env.example .env`
    - Update the `.env` file with your credentials:
      ```env
      # PostgreSQL Database Connection (e.g., from Supabase)
      DATABASE_URL="your_postgresql_connection_string"

      # JWT Configuration
      JWT_SECRET="generate_a_strong_secret_key"
      JWT_EXPIRES_IN="1d"

      # Server Configuration
      PORT=8080
      ```

4.  **Initialize the Database:**
    - Connect to your PostgreSQL database.
    - Execute the SQL script located at `/backend/db/init.sql` to create the necessary tables, roles, and seed the initial admin user.
    - **Default Admin Credentials:** `username: admin`, `password: admin_password`

### Running the Application

Once the setup is complete, run the development server from the **root directory**:

```bash
npm run dev
```

This command uses `concurrently` to start both the Vite frontend server and the Nodemon backend server with a single command.

- Frontend will be available at `http://localhost:5173`
- Backend API will be running at `http://localhost:8080`

---

## 📄 API Documentation

The backend exposes a RESTful API for all operations. For detailed information on available endpoints, request/response schemas, and authentication requirements, please refer to the OpenAPI specification file.

*(Note: An `openapi.yaml` file will be added in a future update.)*

---

## 🗄️ Database Schema

The database schema is designed to be scalable and relational, supporting the core features of the application. Key tables include:

- `Homes`: Manages home locations.
- `Users`: Stores user profiles and credentials.
- `Roles` & `Permissions`: Defines the RBAC structure.
- `HomeMembers`: Links users to homes with specific roles.
- `Devices`: Manages physical smart devices.
- `DeviceData`: Stores time-series data from sensors.
- `AutomationRules`: Defines automation logic.

For the complete and up-to-date schema, please see the DDL script at `/backend/db/init.sql`.
]]>
