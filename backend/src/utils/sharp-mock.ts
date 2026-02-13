
/**
 * Sharp Mock
 * Simulates image processing operations
 */
const mockSharpInstance = {
    resize: jest.fn().mockReturnThis(),
    toFormat: jest.fn().mockReturnThis(),
    jpeg: jest.fn().mockReturnThis(),
    webp: jest.fn().mockReturnThis(),
    png: jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockResolvedValue(Buffer.from('processed-image-buffer')),
    metadata: jest.fn().mockResolvedValue({
        width: 1024,
        height: 768,
        format: 'jpeg'
    })
};

const sharp = jest.fn(() => mockSharpInstance);

export default sharp;
