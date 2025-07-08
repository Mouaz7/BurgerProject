# BurgerProject 🍔

BurgerProject is a full-stack burger ordering system built with **Node.js**, **Express**, **MySQL**, and **EJS**. It allows customers to view predefined burgers, customize their own, place and track orders, and allows kitchen staff to view finalized orders.

---

## 🚀 Features

- View available burgers with ingredients and pricing.
- Create your own custom burger by adding/removing ingredients.
- Complete and submit orders with customer name and total price.
- View all finalized orders (kitchen view).
- Delete past orders from history.
- CSRF protection on all forms.
- EJS templates with clean layout and dynamic content.

---

## 🧱 Tech Stack

- **Backend**: Node.js, Express, MySQL (with stored procedures)
- **Frontend**: HTML, CSS, EJS (Embedded JavaScript)
- **Security**: express-session, csurf (CSRF protection)
- **Database**: MySQL (with burgers, ingredients, orders tables)

---

## 🛠️ Installation

```bash
git clone https://github.com/yourusername/BurgerProject.git
cd BurgerProject
npm install
```

Create your `.env` file based on the provided example:

```
PORT=1337
SESSION_SECRET=your-secret-key
```

Add your database credentials to `config/db/config.json`:

```json
{
  "host": "localhost",
  "user": "your_db_user",
  "password": "your_db_password",
  "database": "burger",
  "connectionLimit": 10,
  "connectTimeout": 30000
}
```

Run the SQL setup files inside `/sql/` to create the database schema and seed data.

---

## 📦 Usage

Start the application:

```bash
npm run dev    # If nodemon is installed
# or
node index.js
```

Then open your browser and go to: [http://localhost:1337](http://localhost:1337)

---

## 📁 Project Structure

```
BurgerProject/
├── config/              # DB config
├── public/              # Static assets (CSS)
├── routes/              # Express routes
├── views/               # EJS templates (pages + partials)
├── sql/                 # SQL setup & seed files
├── src.js               # Core logic (to be modularized)
├── index.js             # Entry point
├── .env                 # Environment variables
└── README.md
```

---

## 🧪 Planned Improvements

- Add validation on backend and frontend
- Modularize src.js into services/controllers
- Add flash messages for UX
- Include authentication system (admin vs customer)
- Include tests (Jest)

---

## 🧑‍💻 Author

Made with 💖 by Mouaz Naji

---

## 📜 License

This project is licensed under the ISC License.
