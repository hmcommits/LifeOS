const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { extractSocialContext } = require('../services/socialCapitalService');
const { convertWhatsappToCsv } = require('../scripts/whatsappToCsv');

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../data/uploads'));
    },
    filename: function (req, file, cb) {
        cb(null, 'whatsapp_chat_' + Date.now() + '.txt');
    }
});
const upload = multer({ storage: storage });

router.get('/social-capital', async (req, res) => {
    try {
        const data = await extractSocialContext();
        res.json({
            status: "success",
            data: data
        });
    } catch (error) {
        console.error("Route error /social-capital:", error);
        res.status(500).json({ 
            status: "error", 
            message: "Failed to extract social context" 
        });
    }
});

// New Upload Route for processing WhatsApp .txt files
router.post('/upload-chat', upload.single('chatFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ status: "error", message: "No file uploaded" });
        }

        const uploadedFilePath = req.file.path;
        const outputCsvPath = path.join(__dirname, '../data/uploads/whatsapp_data.csv');

        // 1. Convert .txt to .csv using our script
        await convertWhatsappToCsv(uploadedFilePath, outputCsvPath);

        // 2. Extract new insights (Coral would query the new CSV now)
        const updatedData = await extractSocialContext();

        res.json({
            status: "success",
            message: "Chat processed successfully",
            data: updatedData
        });

    } catch (error) {
        console.error("Route error /upload-chat:", error);
        res.status(500).json({ 
            status: "error", 
            message: "Failed to process chat file" 
        });
    }
});

module.exports = router;
