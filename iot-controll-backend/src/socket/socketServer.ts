import io from "socket.io";
import { Server } from 'socket.io';

export const intialSocketIo = (server: any) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
            allowedHeaders: ["Content-Type", "Authorization"]
        }
    });

    io.on('clientConnect', (socket) => {
        
    });

    return io;
} 