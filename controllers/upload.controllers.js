// upload.controllers.js
export const uploader = async (req, res) => {
    const uploaded_file = req.file;
  
    if (!uploaded_file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
  
    try {
      console.log('Uploaded File:', uploaded_file);
      
      // Get the API base URL from environment or use default
      const apiBaseUrl = process.env.API_BASE_URL || '/api/v1';
      
      res.status(200).json({
        message: 'File uploaded successfully',
        fileName: uploaded_file.filename,
        filePath: uploaded_file.path,
        // Return a proper download URL that matches your API structure
        downloadUrl: `${apiBaseUrl}/user/download?file=${encodeURIComponent(uploaded_file.filename)}`
      });
      
    } catch (error) {
      console.error('Error uploading file:', error);
      return res.status(500).json({ error: 'Error uploading file' });
    }
  };