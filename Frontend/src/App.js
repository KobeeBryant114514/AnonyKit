iimport React, { useState } from 'react';

function App() {
    const [vote, setVote] = useState('');
    const [status, setStatus] = useState('');
    const [enclaveResponse, setEnclaveResponse] = useState(null);

    const handleSubmitVote = async (e) => {
        e.preventDefault();
        if (!vote || !['A', 'B'].includes(vote)) {
            setStatus('Invalid vote. Please select A or B.');
            return;
        }

        setStatus('Submitting vote to Enclave...');
        try {
            const response = await fetch('http://54.250.236.83:4000/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vote })
            });
            const data = await response.json();
            if (data.error) {
                setStatus(data.error);
                return;
            }
            setEnclaveResponse(data);
            setStatus('Vote submitted to Enclave. Please confirm to record on blockchain.');
        } catch (error) {
            setStatus('Failed to submit vote to Enclave: ' + error.message);
        }
    };

    const handleSubmitToBlockchain = async () => {
        if (!enclaveResponse) {
            setStatus('No vote response available.');
            return;
        }

        setStatus('Submitting vote to Sui Blockchain...');
        try {
            const response = await fetch('http://54.250.236.83:4000/submit-vote-to-blockchain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vote: enclaveResponse.response.data.vote,
                    signature: enclaveResponse.signature,
                    timestamp_ms: enclaveResponse.response.timestamp_ms
                })
            });
            const data = await response.json();
            if (data.error) {
                setStatus(data.error);
                return;
            }
            setStatus('Vote recorded on blockchain! Tx: ' + JSON.stringify(data.tx));
        } catch (error) {
            setStatus('Failed to submit vote to blockchain: ' + error.message);
        }
    };

    const handleCheckResults = async () => {
        try {
            const response = await fetch('http://54.250.236.83:4000/results');
            const data = await response.json();
            if (data.error) {
                setStatus(data.error);
                return;
            }
            setStatus(`Results: A: ${data.A} votes, B: ${data.B} votes`);
        } catch (error) {
            setStatus('Failed to fetch voting results: ' + error.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4 text-center">Anonymous Voting</h2>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Select your vote:</label>
                    <select
                        value={vote}
                        onChange={(e) => setVote(e.target.value)}
                        className="w-full p-2 border rounded"
                    >
                        <option value="">Select...</option>
                        <option value="A">Candidate A</option>
                        <option value="B">Candidate B</option>
                    </select>
                </div>
                <button
                    onClick={handleSubmitVote}
                    className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mb-2"
                >
                    Submit Vote
                </button>
                {enclaveResponse && (
                    <button
                        onClick={handleSubmitToBlockchain}
                        className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 mb-2"
                    >
                        Confirm Vote on Blockchain
                    </button>
                )}
                <button
                    onClick={handleCheckResults}
                    className="w-full bg-purple-500 text-white p-2 rounded hover:bg-purple-600"
                >
                    Check Voting Results
                </button>
                <p className="mt-4 text-gray-600">{status}</p>
            </div>
        </div>
    );
}

export default App;