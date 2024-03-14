import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { error } from "console";
import { Response } from "express";

@Catch(Error)
export class AppExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(400).json({
      error: exception.message,
    });
  }
}
