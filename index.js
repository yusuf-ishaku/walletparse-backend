const express = require('express');
const {SolScript} = require('./deploy');
const cors = require('cors');
const app = express();
const port = 3000;
const solScript = new SolScript();
app.use(express.json());
app.use(cors());
app.post('/deploy', async (req, res) => {
    const methodName = req.body.methodName;
    const walletPk = req.body.walletPk;
    try {
        const data = await solScript.handleDeploy(methodName, walletPk);
        console.log("respond!")
        return res.json({ success: true, data });

    } catch (error) {
        console.error('Deployment error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/estimate', async (req, res) => {
    const methodName = req.body.methodName;
    const walletPk = req.body.walletPk;
    try {
        const data = await solScript.handleEstimateGas(methodName, walletPk);
        console.log("respond!")
        return res.json({ success: true, data });

    } catch (error) {
        console.error('Deployment error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
