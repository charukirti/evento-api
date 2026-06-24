import { HTTPException } from 'hono/http-exception';

export class NotFoundException extends HTTPException {
  constructor(message = 'Not found') {
    super(404, { message });
    this.name = 'NotFoundException';
  }
}

export class BadRequestException extends HTTPException {
  constructor(message = 'Bad request') {
    super(400, { message });
    this.name = 'BadRequestException';
  }
}

export class ConflictException extends HTTPException {
  constructor(message = 'Conflict') {
    super(409, { message });
    this.name = 'ConflictException';
  }
}

export class UnauthorizedException extends HTTPException {
  constructor(message = 'Unauthorized') {
    super(401, { message });
    this.name = 'UnauthorizedException';
  }
}

export class ForbiddenException extends HTTPException {
  constructor(message = 'Forbidden') {
    super(403, { message });
    this.name = 'ForbiddenException';
  }
}

export class InternalServerErrorException extends HTTPException {
  constructor(message = 'Internal server error') {
    super(500, { message });
    this.name = 'InternalServerErrorException';
  }
}
