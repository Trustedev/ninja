const express = require('express');
const mysql = require('mysql');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(express.json());

// MySQL bağlantısı
const db = mysql.createConnection({
    host: 'db-mysql-fra1-25321-do-user-17974490-0.l.db.ondigitalocean.com',
    user: 'doadmin',
    password: 'AVNS_bkYKVyoKohpk_vyZ7BS',
    database: 'userdb',
    port: 25060,
    ssl: {
      ca: fs.readFileSync(path.join(__dirname, 'certs', 'ca-certificate.crt')) // CA sertifikasının yolunu belirtin
    }
  });
  

db.connect(err => {
  if (err) throw err;
  console.log('MySQL connected...');
});

// Anahtar Oluşturma (Yalnızca admin için)


// Anahtar Kontrolü
app.get('/api/check-key', (req, res) => {
  const { key } = req.query;

  const sql = 'SELECT * FROM users WHERE `key` = ?';
  db.query(sql, [key], (err, results) => {
    if (err || results.length === 0 || new Date(results[0].expiry) < new Date()) {
      return res.status(403).send('Access denied');
    }
    res.json({ valid: true, username: results[0].username, results[0].expiry}); // Kullanıcı adını döndür
  });
});

// Sunucu Başlatma
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
