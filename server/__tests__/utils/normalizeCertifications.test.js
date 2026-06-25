import normalizeCertifications from '../../src/utils/normalizeCertifications.js';

describe('normalizeCertifications', () => {
  it('should return empty array for null, undefined, empty string', () => {
    expect(normalizeCertifications(null)).toEqual([]);
    expect(normalizeCertifications(undefined)).toEqual([]);
    expect(normalizeCertifications('')).toEqual([]);
    expect(normalizeCertifications(123)).toEqual([]); // Anything else
  });

  describe('Array input', () => {
    it('should sanitize an array of valid objects', () => {
      const input = [
        { name: 'AWS', issuer: 'Amazon', date: '2023', link: 'http://aws.com' },
        { name: 'GCP' }, // missing fields
        { name: 'Azure', issuer: '' } // empty string issuer
      ];
      const result = normalizeCertifications(input);
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ name: 'AWS', issuer: 'Amazon', date: '2023', link: 'http://aws.com' });
      expect(result[1]).toEqual({ name: 'GCP', issuer: 'Unknown', date: '', link: '' });
      expect(result[2]).toEqual({ name: 'Azure', issuer: 'Unknown', date: '', link: '' });
    });

    it('should ignore empty objects', () => {
      const input = [{}, { name: 'AWS' }, null, 123];
      const result = normalizeCertifications(input);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('AWS');
    });

    it('should parse an array of strings', () => {
      const input = ['AWS — Amazon 2023 http://aws.com', '   '];
      const result = normalizeCertifications(input);
      expect(result).toHaveLength(1);
      expect(result[0].issuer).toBe('AWS');
      expect(result[0].name).toBe('Amazon');
      expect(result[0].date).toBe('2023');
      expect(result[0].link).toBe('http://aws.com');
    });
  });

  describe('String input (multiline)', () => {
    it('should parse multiline strings', () => {
      const input = `
        AWS — Amazon 2023
        GCP | Google
        Just Name
      `;
      const result = normalizeCertifications(input);
      expect(result).toHaveLength(3);
      
      expect(result[0].issuer).toBe('AWS');
      expect(result[0].name).toBe('Amazon');
      expect(result[0].date).toBe('2023');
      
      expect(result[1].issuer).toBe('GCP');
      expect(result[1].name).toBe('Google');
      
      expect(result[2].name).toBe('Just Name');
      expect(result[2].issuer).toBe('Unknown');
    });
  });

  describe('parseCertificationString internal logic', () => {
    it('should extract URLs', () => {
      const result = normalizeCertifications('AWS Cert https://cert.com');
      expect(result[0].link).toBe('https://cert.com');
      expect(result[0].name).toBe('AWS Cert');
    });

    it('should extract years', () => {
      const result = normalizeCertifications('AWS Cert 2020');
      expect(result[0].date).toBe('2020');
      expect(result[0].name).toBe('AWS Cert');
    });

    it('should split by em-dash/en-dash', () => {
      const result = normalizeCertifications('Issuer — Name');
      expect(result[0].issuer).toBe('Issuer');
      expect(result[0].name).toBe('Name');
    });

    it('should split by pipe', () => {
      const result = normalizeCertifications('Issuer | Name');
      expect(result[0].issuer).toBe('Issuer');
      expect(result[0].name).toBe('Name');
    });

    it('should split by hyphen before capital', () => {
      const result = normalizeCertifications('Issuer - Name');
      expect(result[0].issuer).toBe('Issuer');
      expect(result[0].name).toBe('Name');
    });

    it('should split by colon', () => {
      const result = normalizeCertifications('Issuer: Name');
      expect(result[0].issuer).toBe('Issuer');
      expect(result[0].name).toBe('Name');
    });

    it('should fallback to name only if no separator', () => {
      const result = normalizeCertifications('My Certificate from somewhere');
      expect(result[0].name).toBe('My Certificate from somewhere');
      expect(result[0].issuer).toBe('Unknown');
    });

    it('should handle crash gracefully in parseCertificationString', () => {
      const originalMatch = String.prototype.match;
      String.prototype.match = function() {
        throw new Error('Crash');
      };
      
      const result = normalizeCertifications(['Valid String']);
      
      String.prototype.match = originalMatch;
      
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Valid String');
      expect(result[0].issuer).toBe('Unknown');
    });

    it('should handle crash gracefully in normalizeCertifications outer block', () => {
      const badArray = [];
      badArray.flatMap = () => { throw new Error('Crash outer'); };
      
      const result = normalizeCertifications(badArray);
      expect(result).toEqual([]);
    });
  });
});
