const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(cors({ origin: 'http://localhost:3000' }));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

let tasks = [];

app.get('/task', (req, res) => {
  res.status(200).json(tasks);
  
});

app.post('/task', upload.single('file'), (req, res) => {
  const { title, status, dueDate } = req.body;
  const newTask = {
    id: tasks.length + 1,
    title,
    status: status || 'pending',
    dueDate,
    file: req.file ? req.file.filename : null,
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

app.put('/task/:id', upload.single('file'), (req, res) => {
  const taskId = parseInt(req.params.id);
  const { title, status, dueDate } = req.body;
  const taskIndex = tasks.findIndex(t => t.id === taskId);

  if (taskIndex > -1) {
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      title : title ? title : tasks[taskIndex].title,
      status,
      Date : dueDate ? dueDate : tasks[taskIndex].Date,
      file: req.file ? req.file.filename : tasks[taskIndex].file,
    };
    console.log(tasks[taskIndex]);
    res.status(200).json(tasks[taskIndex]);
  } else {
    res.status(404).json({ message: 'Task not found' });
  }
});

app.delete('/task/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  tasks = tasks.filter(t => t.id !== taskId);
  res.status(204).send();
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
