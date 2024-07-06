const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 3000;
const baseDir = path.join(__dirname, 'files');

// Create the files directory if it doesn't exist
if (!fs.existsSync(baseDir)){
    fs.mkdirSync(baseDir);
}

// Helper function to handle responses
const handleResponse = (res, statusCode, message) => {
    res.writeHead(statusCode, { 'Content-Type': 'text/plain' });
    res.end(message);
};

const server = http.createServer((req, res) => {
    const urlParts = req.url.split('/');
    const action = urlParts[1];
    const fileName = urlParts[2];

    if (!fileName) {
        handleResponse(res, 400, 'File name is required.');
        return;
    }

    const filePath = path.join(baseDir, fileName);

    switch(action) {
        case 'create':
            fs.writeFile(filePath, 'This is a new file.', (err) => {
                if (err) {
                    handleResponse(res, 500, 'Error creating file.');
                } else {
                    handleResponse(res, 200, 'File created successfully.');
                }
            });
            break;
        
        case 'read':
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    if (err.code === 'ENOENT') {
                        handleResponse(res, 404, 'File not found.');
                    } else {
                        handleResponse(res, 500, 'Error reading file.');
                    }
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    res.end(data);
                }
            });
            break;

        case 'delete':
            fs.unlink(filePath, (err) => {
                if (err) {
                    if (err.code === 'ENOENT') {
                        handleResponse(res, 404, 'File not found.');
                    } else {
                        handleResponse(res, 500, 'Error deleting file.');
                    }
                } else {
                    handleResponse(res, 200, 'File deleted successfully.');
                }
            });
            break;

        default:
            handleResponse(res, 400, 'Invalid action.');
            break;
    }
});

server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
