import express, { Request, Response, NextFunction } from 'express';
import { CHAINS_ENABLED } from './config';
import loadBalancer from './loadBalancer';
import { configDotenv } from 'dotenv'

configDotenv();

const app = express();
const port = process.env.PORT;

// Middleware for JSON parsing
app.use(express.json());

// Middleware for validating chain names
const validateChainName = (req: Request, res: Response, next: NextFunction): void => {
    const { chainName } = req.params;

    if (!CHAINS_ENABLED.includes((chainName as any))) {
        res.status(400).json({ error: 'Invalid chain name', chainName });
        return; // Stop execution; don't call next() if there's an error
    }
    next(); // Proceed to the next middleware/route handler
};

// Route to handle requests for specific chain names
app.use('/:chainName', validateChainName, async (req: Request, res: Response) => {
    const { chainName } = req.params;
    await loadBalancer((chainName as any), req, res)
});


// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
