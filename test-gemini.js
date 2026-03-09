const fs = require('fs');
const GeminiRecipeEngine = require('./ai-engine/GeminiRecipeEngine');
require('dotenv').config();

async function test() {
    try {
        const log = [];
        const logger = (msg) => { console.log(msg); log.push(msg); };

        logger('Testing Gemini API (REST Mode)...');

        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY not found');
        }
        logger('Key present');

        const engine = new GeminiRecipeEngine();
        logger('Engine instantiated');

        const recipe = await engine.generateRecipe(
            ['chicken', 'rice', 'basil'],
            {
                cuisine: 'thai',
                cookingTime: 20
            }
        );

        logger('✅ Success! Generated Recipe: ' + recipe.name);
        logger('Description: ' + recipe.description);

        fs.writeFileSync('test_result.txt', log.join('\n'));

    } catch (error) {
        console.error('❌ Test failed:', error);
        fs.writeFileSync('test_result.txt', 'FAILED\n' + error.message + '\n' + error.stack);
    }
}

test();
