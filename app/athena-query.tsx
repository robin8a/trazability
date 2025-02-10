// pages/athena-query.tsx
import { useState } from 'react';

interface AthenaResultRow {
  [key: string]: string | number | null; // Adjust type as needed
}

const AthenaQuery: React.FC = () => {
  const [query, setQuery] = useState('SELECT * FROM your_table LIMIT 10'); // Initial query
  const [results, setResults] = useState<AthenaResultRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const runAthenaQuery = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('/api/athena', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const errorData = await response.json(); // Try to get error details from the API
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'success') {
        setResults(data.data.map((row: any) => { // Type the rows
          const newRow: AthenaResultRow = {};
          row.Data.forEach((cell: any, index: number) => {
            if (cell?.VarCharValue) {
                newRow[data.data[0].ResultSet.Rows[0].Data[index].VarCharValue] = cell.VarCharValue;
            } else {
                newRow[data.data[0].ResultSet.Rows[0].Data[index].VarCharValue] = null;
            }
          });
          return newRow;
        }));
      } else {
        throw new Error(data.message || 'Athena query failed');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4"> {/* Added some basic styling */}
      <h1 className="text-2xl font-bold mb-4">Athena Query</h1>

      <textarea
        className="w-full h-24 border rounded p-2 mb-4"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={runAthenaQuery}
        disabled={loading}
      >
        {loading ? 'Running...' : 'Run Query'}
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      {results && results.length > 0 && (
        <div className="mt-4 overflow-x-auto"> {/* Added overflow for wide tables */}
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                {Object.keys(results[0]).map((key) => (
                  <th key={key} className="border border-gray-300 px-4 py-2">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, index) => (
                    <td key={index} className="border border-gray-300 px-4 py-2">
                      {value === null ? 'NULL' : value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {results && results.length === 0 && (
        <p className="mt-4">No results found.</p>
      )}

      {loading && <p className="mt-4">Loading...</p>}
    </div>
  );
};

export default AthenaQuery;