import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/jobs/list')
      .then(r => r.json())
      .then(data => { setJobs(data.jobs || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow"><div className="max-w-6xl mx-auto px-4 py-4 flex justify-between"><Link href="/"><h1 className="text-2xl font-bold text-orange-600">🔧 SkillTrade</h1></Link></div></nav>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-8">Available Jobs</h1>
        {loading ? <p>Loading...</p> : (
          <div className="grid md:grid-cols-2 gap-6">
            {jobs.map(job => (
              <div key={job.id} className="bg-white rounded shadow p-6">
                <h3 className="text-lg font-bold">{job.title}</h3>
                <p className="text-gray-600 text-sm mt-2">{job.description}</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-2xl font-bold text-green-600">${job.budget}</span>
                  <button className="px-4 py-2 bg-orange-600 text-white rounded">Apply</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
