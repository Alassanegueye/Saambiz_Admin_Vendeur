import { describe, it, expect } from 'vitest';
import { normaliserTelephone } from './telephone';

/**
 * Le numéro part tel quel à l'opérateur : il doit être nettoyé ici, sinon la
 * demande de paiement est refusée et le vendeur ne sait pas pourquoi.
 */
describe('numéro à débiter', () => {
  it('accepte les formes que le vendeur écrit vraiment', () => {
    expect(normaliserTelephone('771234567')).toBe('771234567');
    expect(normaliserTelephone('77 123 45 67')).toBe('771234567');
    expect(normaliserTelephone('+221 77 123 45 67')).toBe('771234567');
    expect(normaliserTelephone('00221771234567')).toBe('771234567');
    expect(normaliserTelephone('77-123-45-67')).toBe('771234567');
  });

  it('refuse ce qui n’est pas un numéro à neuf chiffres', () => {
    expect(normaliserTelephone('')).toBeNull();
    expect(normaliserTelephone(null)).toBeNull();
    expect(normaliserTelephone('7712345')).toBeNull();
    expect(normaliserTelephone('7712345678')).toBeNull();
    expect(normaliserTelephone('pas un numéro')).toBeNull();
  });
});
