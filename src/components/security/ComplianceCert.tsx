import React from 'react';
import { SecurityCertification } from '../../types/security';
import { ShieldCheck, CheckCircle2, Award, ExternalLink } from 'lucide-react';
import { Badge } from '../common/Badge';

interface ComplianceCertProps {
  certifications: SecurityCertification[];
}

export const ComplianceCert: React.FC<ComplianceCertProps> = ({ certifications }) => {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-cyan-400" />
          <span className="text-xs font-bold text-slate-100 uppercase font-mono tracking-wider">
            Industrial Cybersecurity & Air-Gap Standards Compliance
          </span>
        </div>
        <Badge variant="success" size="xs">
          Audit Ready
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
        {certifications.map((cert) => (
          <div
            key={cert.standard}
            className="p-3 rounded-lg border border-slate-800 bg-slate-950/80 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-100 text-xs">{cert.standard}</span>
                <span className="inline-flex items-center gap-1 text-emerald-400 text-[10px]">
                  <CheckCircle2 className="h-3 w-3" /> {cert.status}
                </span>
              </div>
              <div className="text-[11px] text-slate-300 font-sans font-medium mb-1">
                {cert.title}
              </div>
              <div className="text-[10px] text-slate-400 leading-tight">
                Clause: {cert.clause}
              </div>
            </div>

            <div className="mt-2.5 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
              <span>Verified: {cert.lastVerified}</span>
              <span className="text-cyan-400 hover:underline cursor-pointer">
                View Proof &rarr;
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};