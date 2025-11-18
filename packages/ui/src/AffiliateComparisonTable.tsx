"use client";

import React from "react";
import { AffiliateProgram } from "@traffic2u/config";

interface AffiliateComparisonTableProps {
  programs: AffiliateProgram[];
  siteName: string;
  primaryColor?: string;
}

export const AffiliateComparisonTable: React.FC<AffiliateComparisonTableProps> = ({
  programs,
  siteName,
  primaryColor = "#FF6B9D",
}) => {
  if (!programs || programs.length === 0) {
    return (
      <div className="rounded-lg bg-gray-50 p-8 text-center">
        <p className="text-gray-600">No affiliate programs available for this niche yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <div className="mb-4 border-b border-gray-200 bg-gradient-to-r px-6 py-4" style={{ backgroundColor: primaryColor }}>
        <h3 className="text-lg font-bold text-white">Affiliate Programs for {siteName}</h3>
        <p className="text-sm text-white/90">
          Join these affiliate programs and earn commissions by referring customers
        </p>
      </div>

      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Company</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Commission</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Cookie Duration</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Network</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
          </tr>
        </thead>
        <tbody>
          {programs.map((program, index) => (
            <tr
              key={program.id}
              className={`border-b border-gray-100 transition hover:bg-gray-50 ${
                index % 2 === 0 ? "bg-white" : "bg-gray-50"
              }`}
            >
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-900">{program.company}</span>
                  {program.notes && <span className="text-xs text-gray-500">{program.notes}</span>}
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
                  {program.commission}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-700">{program.cookieDuration}</td>
              <td className="px-6 py-4 text-sm text-gray-700">
                {program.affiliateNetwork ? (
                  <span className="inline-block rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                    {program.affiliateNetwork}
                  </span>
                ) : (
                  <span className="text-gray-400">Direct</span>
                )}
              </td>
              <td className="px-6 py-4">
                {program.signupLink ? (
                  <a
                    href={program.signupLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block rounded px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Join Program →
                  </a>
                ) : (
                  <a
                    href={`${program.website}/affiliates`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block rounded px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Join Program →
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="bg-blue-50 px-6 py-4 text-sm text-blue-900">
        <p className="font-semibold">💡 How to Get Started:</p>
        <ol className="mt-2 ml-4 list-decimal space-y-1">
          <li>Click "Join Program" for the affiliate program you're interested in</li>
          <li>Complete the signup process with your website/traffic source information</li>
          <li>Once approved, you'll get unique affiliate links to share</li>
          <li>Earn commissions for every customer referred through your links</li>
        </ol>
      </div>
    </div>
  );
};

export default AffiliateComparisonTable;
