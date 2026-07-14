// const express = require('express');
import express from 'express';
import path from 'path';    // newly added
import {ENV} from './lib/env.js';

import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import { connectDB } from './lib/db.js';




const app = express();
//const __dirname = process.resolve(); -- removed for testing

const PORT = ENV.PORT || 3000;

// newly added
const __dirname = import.meta.dirname;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//////////////////

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

//make ready for development
if (ENV.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/dist')))

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'))
  })
}

app.listen(ENV.PORT, () => {
  console.log(`Server is running on port ${ENV.PORT}`)
  connectDB();
} )