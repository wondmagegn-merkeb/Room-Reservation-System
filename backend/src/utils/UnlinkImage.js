import fs from 'fs';
import path from 'path';

export const UnlinkImage = (filename) => {
  if (!filename) return; // Exit if no filename is provided

  const filePath = path.join(process.cwd(), 'uploads', filename); // Adjust directory as needed

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath); // Delete file synchronously
      console.log(`File deleted: ${filePath}`);
    } else {
      console.log(`File not found: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error deleting file: ${error.message}`);
  }
};
