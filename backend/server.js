const express=require('express')
const dotenv=require('dotenv')
const cors=require('cors')
const path=require('path')
const { log } = require('console')

dotenv.config()

const app=express()

app.use(express.json())
app.use(cors({
    origin: 'http://localhost:5173',
  credentials: true
}))

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/items', require('./routes/itemRoutes'))
app.use('/api/chat', require('./routes/chatRoutes'))

app.use((req,res)=>{
    res.status(404).json({message:'route not found'})

})

const PORT=process.env.PORT || 5000

const server=app.listen(PORT, ()=>{
    console.log(`server running on port ${PORT}`)
    
})


const{Server}=require('socket.io')

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
})

io.on('connection', (socket) => {
  console.log('user connected:', socket.id)

  socket.on('join_room', (roomId) => {
    socket.join(roomId)
  })

  socket.on('send_message', (data) => {
    socket.to(data.roomId).emit('receive_message', data)
  })

  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id)
  })
})

module.exports = { io }