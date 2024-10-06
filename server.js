const express = require('express');
const mysql = require('mysql');

const app = express();
app.use(express.json());

// MySQL bağlantısı
const db = mysql.createConnection({
  host: 'localhost',
  user: 'admin',  // MySQL kullanıcı adınız
  password: 'admin',  // MySQL şifreniz
  database: 'userdb'
}); 

db.connect(err => {
  if (err) throw err;
  console.log('MySQL connected...');
});

// Anahtar Oluşturma (Yalnızca admin için)
app.post('/api/create-key', (req, res) => {
  const { key, username } = req.body; // username'i de al

  const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 hafta

  // Admin kontrolü
  const adminKey = req.headers['admin-key'];

  const checkAdminSql = 'SELECT * FROM users WHERE `key` = ? AND isAdmin = true';
  db.query(checkAdminSql, [adminKey], (err, adminResults) => {
    if (err || adminResults.length === 0) {
      return res.status(403).send('Only admins can create keys');
    }

    // Anahtarın zaten var olup olmadığını kontrol et
    const checkSql = 'SELECT * FROM users WHERE `key` = ?';
    db.query(checkSql, [key], (err, results) => {
      if (err) return res.status(500).send('Server error');

      if (results.length > 0) {
        return res.status(400).send('Key already exists');
      }

      // Anahtarı kaydet
      const sql = 'INSERT INTO users (`key`, username, expiry) VALUES (?, ?, ?)';
      db.query(sql, [key, username, expiry], (err, result) => {
        if (err) return res.status(400).send('Error registering key');
        res.status(201).send('Key created');
      });
    });
  });
});

// Anahtar Kontrolü
app.get('/api/check-key', (req, res) => {
  const { key } = req.query;

  const sql = 'SELECT * FROM users WHERE `key` = ?';
  db.query(sql, [key], (err, results) => {
    if (err || results.length === 0 || new Date(results[0].expiry) < new Date()) {
      return res.status(403).send('Access denied');
    }
    res.json({ valid: true, username: results[0].username }); // Kullanıcı adını döndür
  });
});

// Sunucu Başlatma
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
