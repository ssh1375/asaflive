import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import type { Response } from 'express';


@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const map: Record<string, { status: number; message: string; error: string }> = {
      // ─── Authentication ───────────────────────────────────────────────
      P1000: { status: 401, message: 'Authentication failed against database', error: 'Unauthorized' },
      P1001: { status: 503, message: 'Database server unreachable', error: 'Service Unavailable' },
      P1002: { status: 503, message: 'Database server timeout', error: 'Service Unavailable' },
      P1003: { status: 404, message: 'Database does not exist', error: 'Not Found' },
      P1008: { status: 503, message: 'Operations timed out', error: 'Service Unavailable' },
      P1009: { status: 409, message: 'Database already exists', error: 'Conflict' },
      P1010: { status: 403, message: 'Access denied to database', error: 'Forbidden' },
      P1011: { status: 503, message: 'TLS connection error', error: 'Service Unavailable' },
      P1012: { status: 500, message: 'Schema validation error', error: 'Internal Server Error' },
      P1013: { status: 500, message: 'Invalid database string', error: 'Internal Server Error' },
      P1014: { status: 500, message: 'Underlying model does not exist', error: 'Internal Server Error' },
      P1015: { status: 500, message: 'Unsupported database feature', error: 'Internal Server Error' },
      P1016: { status: 500, message: 'Incorrect number of parameters', error: 'Internal Server Error' },
      P1017: { status: 503, message: 'Server closed the connection', error: 'Service Unavailable' },

      // ─── Query Engine ─────────────────────────────────────────────────
      P2000: { status: 400, message: 'Value too long for column', error: 'Bad Request' },
      P2001: { status: 404, message: 'Record not found in where clause', error: 'Not Found' },
      P2002: { status: 409, message: 'Unique constraint violation', error: 'Conflict' },
      P2003: { status: 400, message: 'Foreign key constraint failed', error: 'Bad Request' },
      P2004: { status: 400, message: 'Database constraint failed', error: 'Bad Request' },
      P2005: { status: 400, message: 'Invalid field value type', error: 'Bad Request' },
      P2006: { status: 400, message: 'Invalid value for field', error: 'Bad Request' },
      P2007: { status: 400, message: 'Data validation error', error: 'Bad Request' },
      P2008: { status: 500, message: 'Query parsing failed', error: 'Internal Server Error' },
      P2009: { status: 500, message: 'Query validation failed', error: 'Internal Server Error' },
      P2010: { status: 500, message: 'Raw query failed', error: 'Internal Server Error' },
      P2011: { status: 400, message: 'Null constraint violation', error: 'Bad Request' },
      P2012: { status: 400, message: 'Missing required value', error: 'Bad Request' },
      P2013: { status: 400, message: 'Missing required argument', error: 'Bad Request' },
      P2014: { status: 400, message: 'Relation violation', error: 'Bad Request' },
      P2015: { status: 404, message: 'Related record not found', error: 'Not Found' },
      P2016: { status: 400, message: 'Query interpretation error', error: 'Bad Request' },
      P2017: { status: 400, message: 'Records not connected', error: 'Bad Request' },
      P2018: { status: 404, message: 'Required connected records not found', error: 'Not Found' },
      P2019: { status: 400, message: 'Input error', error: 'Bad Request' },
      P2020: { status: 400, message: 'Value out of range', error: 'Bad Request' },
      P2021: { status: 500, message: 'Table does not exist', error: 'Internal Server Error' },
      P2022: { status: 500, message: 'Column does not exist', error: 'Internal Server Error' },
      P2023: { status: 500, message: 'Inconsistent column data', error: 'Internal Server Error' },
      P2024: { status: 503, message: 'Connection pool timeout', error: 'Service Unavailable' },
      P2025: { status: 404, message: 'Record not found', error: 'Not Found' },
      P2026: { status: 400, message: 'Unsupported database feature', error: 'Bad Request' },
      P2027: { status: 500, message: 'Multiple database errors', error: 'Internal Server Error' },
      P2028: { status: 500, message: 'Transaction API error', error: 'Internal Server Error' },
      P2029: { status: 400, message: 'Query parameter limit exceeded', error: 'Bad Request' },
      P2030: { status: 400, message: 'Fulltext index not found', error: 'Bad Request' },
      P2031: { status: 503, message: 'MongoDB replica set required', error: 'Service Unavailable' },
      P2033: { status: 400, message: 'Number out of 64-bit range', error: 'Bad Request' },
      P2034: { status: 409, message: 'Transaction conflict, please retry', error: 'Conflict' },
      P2035: { status: 500, message: 'Database assertion violation', error: 'Internal Server Error' },
      P2036: { status: 500, message: 'External connector error', error: 'Internal Server Error' },
      P2037: { status: 503, message: 'Too many database connections', error: 'Service Unavailable' },

      // ─── Migration / Schema ───────────────────────────────────────────
      P3000: { status: 500, message: 'Migration failed to create database', error: 'Internal Server Error' },
      P3001: { status: 500, message: 'Migration may cause destructive changes', error: 'Internal Server Error' },
      P3002: { status: 500, message: 'Migration was rolled back', error: 'Internal Server Error' },
      P3003: { status: 500, message: 'Migration format changed', error: 'Internal Server Error' },
      P3004: { status: 500, message: 'Migration not allowed on system database', error: 'Internal Server Error' },
      P3005: { status: 500, message: 'Database schema is not empty', error: 'Internal Server Error' },
      P3006: { status: 500, message: 'Migration failed to apply', error: 'Internal Server Error' },
      P3007: { status: 500, message: 'Preview feature not allowed', error: 'Internal Server Error' },
      P3008: { status: 500, message: 'Migration already applied', error: 'Internal Server Error' },
      P3009: { status: 500, message: 'Migrate found failed migrations', error: 'Internal Server Error' },
      P3010: { status: 500, message: 'Migration name too long', error: 'Internal Server Error' },
      P3011: { status: 500, message: 'Migration cannot be rolled back', error: 'Internal Server Error' },
      P3012: { status: 500, message: 'Migration cannot be rolled back (not failed)', error: 'Internal Server Error' },
      P3013: { status: 500, message: 'Datasource provider mismatch', error: 'Internal Server Error' },
      P3014: { status: 500, message: 'Prisma Migrate shadow database error', error: 'Internal Server Error' },
      P3015: { status: 500, message: 'Migration file not found', error: 'Internal Server Error' },
      P3016: { status: 500, message: 'Fallback method for database reset failed', error: 'Internal Server Error' },
      P3017: { status: 500, message: 'Migration not found', error: 'Internal Server Error' },
      P3018: { status: 500, message: 'Migration failed to apply cleanly', error: 'Internal Server Error' },
      P3019: { status: 500, message: 'Datasource provider mismatch in schema', error: 'Internal Server Error' },
      P3020: { status: 500, message: 'Automatic creation of shadow database not supported', error: 'Internal Server Error' },
      P3021: { status: 500, message: 'Foreign keys cannot be created', error: 'Internal Server Error' },
      P3022: { status: 500, message: 'Direct execution of DDL not allowed', error: 'Internal Server Error' },

      // ─── Introspection ────────────────────────────────────────────────
      P4000: { status: 500, message: 'Introspection failed', error: 'Internal Server Error' },
      P4001: { status: 500, message: 'Introspected database is empty', error: 'Internal Server Error' },
      P4002: { status: 500, message: 'Inconsistent introspected schema', error: 'Internal Server Error' },
    };

    const resBody = map[exception.code] ?? ({
      status: exception.code,
      message: `Database error (${exception.code})`,
      error: 'Internal Server Error',
    });

    return response.json(resBody);
  }
}