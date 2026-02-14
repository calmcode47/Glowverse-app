module.exports = {
    generateRandomProduct,
    generateRandomEmail,
    generateAuthToken,
};

function generateRandomProduct(context, events, done) {
    // Generate realistic product IDs from your seed data or common patterns
    // For a real test, ideally query the DB or use a known list of valid IDs
    // Here we use placeholders that should serve as examples or need valid IDs from staging DB
    const productIds = [
        '507f1f77bcf86cd799439011',
        '507f1f77bcf86cd799439012',
        '507f1f77bcf86cd799439013',
        // Add real IDs here
    ];

    context.vars.productId = productIds[Math.floor(Math.random() * productIds.length)];
    return done();
}

function generateRandomEmail(context, events, done) {
    const num = Math.floor(Math.random() * 10000);
    context.vars.testEmail = `loadtest${num}@example.com`;
    return done();
}

function generateAuthToken(context, events, done) {
    // This will be populated from the login response in the scenario
    return done();
}
