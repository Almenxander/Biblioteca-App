const express = require ('express');
const mongoose = require ('mongoose');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
require('dotenv').config(); // Carga las variables de entorno

const MONGO_URI = process.env.MONGO_URI;


// Middlewares
app.use(cors());
app.use(express.json()); // Permite a Express leer JSON en el cuerpo de las peticiones

// Conexión a la base de datos
mongoose.connect(MONGO_URI)
    .then(() => console.log('Conectado a MongoDB Atlas'))
    .catch(err => console.error('Error al conectar a MongoDB:', err));

// Definición del esquema y modelo de Libro
const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    isbn: { type: String, required: true, unique: true },
    publishedDate: { type: Date, default: Date.now },
    description: { type: String }
});

const Book = mongoose.model('Book', bookSchema);

// Rutas (API Endpoints)
// Obtener todos los libros
app.get('/api/books', async (req, res) => {
    try {
        const books = await Book.find();
        res.json(books);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Obtener un libro por ID
app.get('/api/books/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: 'Libro no encontrado' });
        res.json(book);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Crear un nuevo libro
app.post('/api/books', async (req, res) => {
    const { title, author, isbn, publishedDate, description } = req.body;
    const newBook = new Book({
        title,
        author,
        isbn,
        publishedDate,
        description
    });

    try {
        const savedBook = await newBook.save();
        res.status(201).json(savedBook);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Actualizar un libro
app.put('/api/books/:id', async (req, res) => {
    try {
        const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedBook) return res.status(404).json({ message: 'Libro no encontrado' });
        res.json(updatedBook);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Eliminar un libro
app.delete('/api/books/:id', async (req, res) => {
    try {
        const deletedBook = await Book.findByIdAndDelete(req.params.id);
        if (!deletedBook) return res.status(404).json({ message: 'Libro no encontrado' });
        res.json({ message: 'Libro eliminado' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});