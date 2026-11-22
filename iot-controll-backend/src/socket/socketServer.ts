import io from "socket.io";
import { Server } from 'socket.io';

export const intialSocketIo = (server: any) => {
    const io = new Server(server);

    io.on('clientConnect', (socket) => {
        
    });

    return io;
} 