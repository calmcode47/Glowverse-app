
/**
 * Cloudinary Mock
 * Simulates Cloudinary upload and management
 */
export const CloudinaryMock = {
    v2: {
        config: jest.fn(),
        uploader: {
            upload: jest.fn().mockImplementation((file, options) => {
                // Simulate various outcomes based on file path/content
                if (file.includes('fail')) {
                    return Promise.reject(new Error('Cloudinary Upload Failed'));
                }
                return Promise.resolve({
                    secure_url: `https://res.cloudinary.com/demo/image/upload/v123456/${options.public_id || 'test'}.jpg`,
                    public_id: options.public_id || 'test_id',
                    format: 'jpg',
                    width: 800,
                    height: 600,
                    bytes: 102400
                });
            }),
            destroy: jest.fn().mockResolvedValue({ result: 'ok' })
        },
        url: jest.fn().mockReturnValue('https://res.cloudinary.com/demo/image/upload/w_200,h_200,c_fill/test.jpg')
    }
};

export default CloudinaryMock;
