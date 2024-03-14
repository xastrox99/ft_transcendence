import { ArgumentsHost, Catch, HttpException } from "@nestjs/common";
import { BaseWsExceptionFilter, WsException } from "@nestjs/websockets";

@Catch(WsException, HttpException, Error)
export class SocketExceptionFilter extends BaseWsExceptionFilter {
    catch(exception: WsException | HttpException | Error, host: ArgumentsHost) {
        const client = host.switchToWs().getClient();
        client.emit("error", "error");
    }
}