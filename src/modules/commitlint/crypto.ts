import crypto from 'crypto';

export const computeHash = async (content: string, algorithm: string = 'sha256'): Promise<string> => {
    try {
        const hash = crypto.createHash(algorithm);
        hash.update(content);
        return hash.digest('hex');
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error while computing hash:', error);
        throw error;
    }
};
