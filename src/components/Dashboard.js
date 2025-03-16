import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/files')
      .then(res => setFiles(res.data.files))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>📁 Uploaded Files</h2>
      <ul>
        {files.map(file => (
          <li key={file}>
            <a href={`http://localhost:5000/uploads/${file}`} download>{file}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
