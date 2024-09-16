const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const methodOverride = require('method-override');


const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('public'));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads');
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
  });
const upload = multer({ storage: storage });

let tasks = [];

app.get('/', (req, res) => {
  const statusFilter = req.query.status || 'all';
  let filteredTasks = tasks;

  if (statusFilter !== 'all') {
    filteredTasks = tasks.filter(task => task.status === statusFilter);
  }

  res.render('index', { tasks: filteredTasks, statusFilter });
});

app.get('/task/new', (req, res) => {
  res.render('new_task');
});

app.post('/task', upload.single('file'), (req, res) => {
  const newTask = {
    id: Date.now().toString(),
    title: req.body.title,
    status: req.body.status,
    dueDate: req.body.dueDate,
    file: req.file ? req.file.filename : null
  };
  console.log(newTask);

  tasks.push(newTask);
  res.redirect('/');
});

app.get('/task/:id/edit', (req, res) => {
  const task = tasks.find(t => t.id === req.params.id);
  res.render('edit_task', { task });
});

app.put('/task/:id', upload.single('file'), (req, res) => {
  const taskIndex = tasks.findIndex(t => t.id === req.params.id);
  if (taskIndex !== -1) {
    tasks[taskIndex].title = req.body.title;
    tasks[taskIndex].status = req.body.status;
    tasks[taskIndex].dueDate = req.body.dueDate;
    if (req.file) {
      tasks[taskIndex].file = req.file.filename;
    }
  }
  res.redirect('/');
});

app.delete('/task/:id', (req, res) => {
    const taskIndex = tasks.findIndex(task => task.id === req.params.id);
    console.log(taskIndex);
    if (taskIndex !== -1) {
      tasks.splice(taskIndex, 1);
    }
    console.log("List: ");
  console.log(tasks);

  res.redirect('/');
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
