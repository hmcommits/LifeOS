const fs = require('fs');
const readline = require('readline');
const path = require('path');

/**
 * Converts a WhatsApp chat export (.txt) into a Coral-compatible .csv file.
 * Handles multiline messages and safely escapes CSV strings.
 * 
 * Works for standard WhatsApp formats like:
 * "29/05/2026, 11:04 pm - flexion: Let's plan a meeting regarding hackathon"
 */
async function convertWhatsappToCsv(inputFilePath, outputFilePath) {
    const fileStream = fs.createReadStream(inputFilePath);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    // Regex to match the standard WhatsApp export format:
    // Captures: 1: Date, 2: Time, 3: Sender, 4: Message
    // Supports DD/MM/YYYY or D/M/YY and accounts for narrow no-break spaces in time (\u202F)
    const regex = /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(.*?)\s-\s(.*?):\s(.*)$/;

    const records = [];
    let currentRecord = null;

    for await (const line of rl) {
        // Skip completely empty lines if we haven't started a record yet
        if (line.trim() === '' && !currentRecord) continue;

        const match = line.match(regex);

        if (match) {
            // Save the previous record before starting a new one
            if (currentRecord) {
                records.push(currentRecord);
            }

            // Start parsing a new message
            currentRecord = {
                date: match[1].trim(),
                time: match[2].trim().replace(/\u202F/g, ' '), // Normalize hidden space characters
                sender: match[3].trim(),
                message: match[4]
            };
        } else {
            // If the line doesn't match the timestamp regex, it belongs to the previous message (multiline text)
            if (currentRecord) {
                currentRecord.message += '\n' + line;
            }
        }
    }

    // Don't forget to push the very last record
    if (currentRecord) {
        records.push(currentRecord);
    }

    // Build the CSV string
    // Coral/DataFusion uses the first row as headers by default
    let csvContent = 'Date,Time,Sender,Message\n';
    
    records.forEach(rec => {
        const date = escapeCsvText(rec.date);
        const time = escapeCsvText(rec.time);
        const sender = escapeCsvText(rec.sender);
        const message = escapeCsvText(rec.message);
        
        csvContent += `${date},${time},${sender},${message}\n`;
    });

    // Write to the output file
    fs.writeFileSync(outputFilePath, csvContent, 'utf8');
    console.log(`✅ Success! Converted ${records.length} messages and saved to: ${outputFilePath}`);
}

/**
 * Helper function to safely escape text for CSV format.
 * - Wraps text in quotes if it contains commas, newlines, or quotes.
 * - Escapes internal double quotes by doubling them up ("").
 */
function escapeCsvText(text) {
    if (!text) return '""';
    
    // Replace " with ""
    let escaped = text.replace(/"/g, '""');
    
    // If the text has commas, newlines, or quotes, it MUST be wrapped in outer quotes
    if (escaped.includes(',') || escaped.includes('\n') || escaped.includes('"')) {
        return `"${escaped}"`;
    }
    
    return escaped;
}

// If run directly from the terminal (CLI mode)
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.log("Usage: node whatsappToCsv.js <input_chat.txt> <output_data.csv>");
        process.exit(1);
    }
    
    const input = path.resolve(args[0]);
    const output = path.resolve(args[1]);
    
    convertWhatsappToCsv(input, output).catch(err => {
        console.error("❌ Error converting file:", err);
    });
}

module.exports = { convertWhatsappToCsv };
