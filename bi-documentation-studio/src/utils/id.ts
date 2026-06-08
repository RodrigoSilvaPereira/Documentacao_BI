import { v4 as uuidv4 } from 'uuid';

/** Gera um UUID v4 para identificar entidades do documento. */
export function generateId(): string {
  return uuidv4();
}