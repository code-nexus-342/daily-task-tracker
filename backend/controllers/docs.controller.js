import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const updateDocs = async (req, res) => {
  try {
    const { isAdmin } = req.user;
    if (!isAdmin) {
      return res.status(403).json({ message: 'Only administrators can update documentation' });
    }

    const docsContent = req.body;
    const docsPath = path.join(__dirname, '../../frontend/src/config/docs.js');

    // Create the new file content
    const fileContent = `import {
  FileText,
  Users,
  CheckCircle,
  Clock,
  Search,
  Upload,
  Shield,
  AlertCircle,
  ArrowRight,
  Code,
  Database,
  Server,
  Globe
} from 'lucide-react';

export const DOCUMENTATION = ${JSON.stringify(docsContent, null, 2)};`;

    // Write the updated content to the file
    await fs.writeFile(docsPath, fileContent, 'utf8');

    res.json({ message: 'Documentation updated successfully' });
  } catch (error) {
    console.error('Error updating documentation:', error);
    res.status(500).json({ message: 'Failed to update documentation' });
  }
};

export { updateDocs }; 