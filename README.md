# 💸 Digital Wallet System (Backend)

A secure and role-based digital wallet backend system built using **Node.js**, **Express.js**, **MongoDB**, and **TypeScript**. This platform allows users to manage their wallets, perform transactions, and interact with agents and admins.

---

## 🚀 Features

### ✅ Authentication & Authorization
- JWT-based authentication
- Bcrypt-secured password hashing
- Role-based access control for `USER`, `AGENT`, `ADMIN`, and `SUPER_ADMIN`

### 🧍 User & Agent Management
- Create, verify, and manage users and agents
- Admin can **approve** or **suspend** agents
- Users can **send money**, **withdraw**, or **cash out** through agents

### 💰 Wallet System
- Add money to wallets
- Withdraw money (with fee)
- Cash in / cash out via agents (with commission)
- Block/unblock wallet functionality by admins

### 💳 Transactions
- Every transaction is recorded with type, fee, initiator, and timestamp
- Transaction types: `ADD_MONEY`, `WITHDRAW`, `SEND_MONEY`, `CASH_IN`, `CASH_OUT`

---

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Language**: TypeScript
- **Security**: JWT, Bcrypt
- **Testing Tool**: Postman

---

## 📂 Project Structure

src/  
│  
├── app/  
│ ├── modules/  
│ │ ├── user/   
│ │ ├── wallet/  
│ │ ├── transaction/  
│ ├── middlewares/  
│ ├── utils/  
│ ├── routes/  
│ └── config/  
│  
├── interfaces/  
├── server.ts  
└── app.ts  


---

## 🔐 Roles & Access

| Role        | Capabilities                                                |
|-------------|-------------------------------------------------------------|
| USER        | Add money, send money, withdraw, cash out                   |
| AGENT       | Cash in/out users, earn commission, must be approved        |
| ADMIN       | View/Block/Unblock wallets, approve/suspend agents          |
| SUPER_ADMIN | Full admin privileges                                       |

---

## 🧪 API Testing

All endpoints are tested with **Postman**. Example workflows include:  
- 🔐 Login/Register  
    http://localhost:5000/api/v1/user/register  
    http://localhost:5000/api/v1/auth/login  
    http://localhost:5000/api/v1/auth/logout  
  
- ➕ Add money to wallet  
    http://localhost:5000/api/v1/wallet/add-money  
  
- 🔁 Send money to another user  
    http://localhost:5000/api/v1/wallet/send-money  

- 💸 Withdraw  
    http://localhost:5000/api/v1/wallet/withdraw  
  
- 🔃 Cash out via agent  
    http://localhost:5000/api/v1/wallet/cash-out  
      
- 🔃 Cash in via agent  
    http://localhost:5000/api/v1/wallet/cash-in  
  
- ✅ Admin block/unblock wallet  
    http://localhost:5000/api/v1/wallet/block/:id  
    http://localhost:5000/api/v1/wallet/unblock/:id  
  
- ⚙️ Approve/Suspend agents    
    http://localhost:5000/api/v1/user/approve-agent/:id  
    http://localhost:5000/api/v1/user/suspend-agent/:id  
  
- 👤 User   
    http://localhost:5000/api/v1/user/all-users  
    http://localhost:5000/api/v1/user/:id  
    http://localhost:5000/api/v1/user/me  
    http://localhost:5000/api/v1/user/:id  
  
-  🧾 Transaction  
    http://localhost:5000/api/v1/transaction/  
---

## 🎥 Demo
> https://drive.google.com/file/d/1nJdsgXKX4NWgDdybpWpCX0q0t-PjVCcd/view?usp=sharing

