import { SequenceStats } from '../types/index.ts';

export const RAW_FASTA_HEADER = '>S1';

export const RAW_SEQUENCE_LINES = [
  'TTGACCGATGACCCCGGTTCAGGCTTCACCACAGTGTGGAACGCGGTCGTCTCCGAACTTAACGGCGACCCTAAGGTTGA',
  'CGACGGACCCAGCAGTGATGCTAATCTCAGCGCTCCGCTGACCCCTCAGCAAAGGGCTTGGCTCAATCTCGTCCAGCCAT',
  'TGACCATCGTCGAGGGGTTTGCTCTGTTATCCGTGCCGAGCAGCTTTGTCCAAAACGAAATCGAGCGCCATCTGCGGGCC',
  'CCGATTACCGACGCTCTCAGCCGCCGACTCGGACATCAGATCCAACTCGGGGTCCGCATCGCTCCGCCGGCGACCGACGA',
  'AGCCGACGACACTACCGTGCCGCCTTCCGAAAATCCTGCTACCACATCGCCAGACACCACAACCGACAACGACGAGATTG',
  'ATGACAGCGCTGCGGCACGGGGCGATAACCAGCACAGTTGGCCAAGTTACTTCACCGAGCGCCCGCACAATACCGATTCC',
  'GCTACCGCTGGCGTAACCAGCCTTAACCGTCGCTACACCTTTGATACGTTCGTTATCGGCGCCTCCAACCGGTTCGCGCA',
  'CGCCGCCGCCTTGGCGATCGCAGAAGCACCCGCCCGCGCTTACAACCCCCTGTTCATCTGGGGCGAGTCCGGTCTCGGCA',
  'AGACACACCTGCTACACGCGGCAGGCAACTATGCCCAACGGTTGTTCCCGGGAATGCGGGTCAAATATGTCTCCACCGAG',
  'GAATTCACCAACGACTTCATTAACTCGCTCCGCGATGACCGCAAGGTCGCATTCAAACGCAGCTACCGCGACGTAGACGT',
];

export const GENOME_S1_SEQUENCE = RAW_SEQUENCE_LINES.join('');

export const FULL_FASTA_TEXT = `${RAW_FASTA_HEADER}
${RAW_SEQUENCE_LINES.join('\n')}`;

export function computeSequenceStats(seq: string): SequenceStats {
  const upper = seq.toUpperCase();
  const length = upper.length;
  let aCount = 0;
  let tCount = 0;
  let gCount = 0;
  let cCount = 0;

  for (let i = 0; i < length; i++) {
    const char = upper[i];
    if (char === 'A') aCount++;
    else if (char === 'T') tCount++;
    else if (char === 'G') gCount++;
    else if (char === 'C') cCount++;
  }

  const gcCount = gCount + cCount;
  const atCount = aCount + tCount;
  const purineCount = aCount + gCount;
  const pyrimidineCount = cCount + tCount;

  const gcContent = length > 0 ? (gcCount / length) * 100 : 0;
  const atContentPct = length > 0 ? (atCount / length) * 100 : 0;

  // Approximate Molecular weight for ssDNA in kDa: length * 330 Da
  const molecularWeight = (length * 330) / 1000;

  // Approximate Melting Temperature (Tm) using Marmur-Doty formula for oligos/sequences > 50bp:
  // Tm = 64.9 + 41 * (yG + zC - 16.4) / (wA + xT + yG + zC)
  const meltingTemp = length > 0 ? 64.9 + 41 * (gcCount - 16.4) / length : 0;

  return {
    length,
    aCount,
    tCount,
    gCount,
    cCount,
    gcContent: Number(gcContent.toFixed(2)),
    atContent: Number(atContentPct.toFixed(2)),
    purineCount,
    pyrimidineCount,
    molecularWeight: Number(molecularWeight.toFixed(2)),
    meltingTemp: Number(meltingTemp.toFixed(1)),
  };
}

export const S1_STATS = computeSequenceStats(GENOME_S1_SEQUENCE);
