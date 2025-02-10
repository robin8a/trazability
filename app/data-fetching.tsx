"use client"
// pages/data-fetching.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import type { NextPage } from 'next';

// Define the type for your data (replace with your actual data structure)
interface DataItem {
  id: number;
  name: string;
  // ... other properties
}

const DataFetching: NextPage = () => {
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<DataItem[]>('/api/data'); // Or your API endpoint
        setData(response.data);
      } catch (err: any) {  // Type the error for better type checking
        console.error("Error fetching data:", err);
        setError(err?.response?.data?.message || err?.message || "Error fetching data"); // More robust error handling
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures this runs only once on mount

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }


  return (
    <div>
      <h1>Data from API</h1>
      <ul>
        {data.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default DataFetching;